import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
    mensaje: string;
    conversacion_id?: string;
    tipo:
    | "respuesta_automatica"
    | "sugerencia"
    | "clasificacion"
    | "sentimiento"
    | "resumen";
    contexto?: any;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { mensaje, conversacion_id, tipo, contexto }: AIRequest =
            await req.json();

        if (!mensaje || !tipo) {
            throw new Error("Missing required fields: mensaje, tipo");
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Obtener configuración de OpenAI
        const { data: openaiConfig } = await supabaseClient
            .from("integraciones")
            .select("credenciales, configuracion")
            .eq("tipo", "openai")
            .eq("activo", true)
            .single();

        const apiKey =
            openaiConfig?.credenciales?.api_key || Deno.env.get("OPENAI_API_KEY");

        if (!apiKey) {
            throw new Error("OpenAI API key not configured");
        }

        // Obtener configuración de IA según el tipo
        const { data: iaConfig } = await supabaseClient
            .from("configuracion_ia")
            .select("*, prompts_sistema(*)")
            .eq("tipo", tipo === "respuesta_automatica" ? "asistente" : tipo)
            .eq("activo", true)
            .single();

        // Construir el prompt del sistema
        let systemPrompt = "";
        let userPrompt = mensaje;

        switch (tipo) {
            case "respuesta_automatica":
                systemPrompt = `Eres un asistente de ventas profesional para Vida Digital Col, una empresa de marketing digital en Colombia. 
Tu objetivo es ayudar a los clientes potenciales de manera amigable y profesional.

Reglas importantes:
- Responde en español colombiano
- Sé breve y conciso (máximo 2-3 oraciones)
- Si el cliente pregunta por servicios, menciona: Marketing Digital, Desarrollo Web, Redes Sociales, SEO
- Si el cliente quiere agendar una cita, solicita su nombre completo y disponibilidad
- Siempre mantén un tono profesional pero cercano
- No inventes información sobre precios o servicios específicos que no conozcas`;
                break;

            case "clasificacion":
                systemPrompt = `Clasifica el siguiente mensaje de un lead en una de estas categorías:
- caliente: Cliente muy interesado, listo para comprar o agendar
- tibio: Cliente interesado pero necesita más información
- frio: Cliente solo explorando o sin interés claro

Responde SOLO con la categoría (caliente, tibio, o frio).`;
                break;

            case "sentimiento":
                systemPrompt = `Analiza el sentimiento del siguiente mensaje y responde con:
- positivo: Cliente satisfecho o entusiasta
- neutral: Cliente informativo sin emoción clara
- negativo: Cliente insatisfecho o frustrado

Responde SOLO con el sentimiento (positivo, neutral, o negativo).`;
                break;

            case "resumen":
                systemPrompt = `Resume la siguiente conversación en 2-3 oraciones, destacando:
- Necesidad principal del cliente
- Estado de la conversación
- Próximos pasos sugeridos`;
                break;

            case "sugerencia":
                systemPrompt = `Basándote en el mensaje del cliente, sugiere 3 posibles respuestas profesionales y útiles.
Formato: Devuelve un array JSON con 3 strings.`;
                break;
        }

        // Si hay un prompt personalizado en la configuración, usarlo
        if (iaConfig?.prompts_sistema?.[0]?.prompt_sistema) {
            systemPrompt = iaConfig.prompts_sistema[0].prompt_sistema;
        }

        // Obtener historial de conversación si existe
        let conversationHistory = [];
        if (conversacion_id) {
            const { data: mensajes } = await supabaseClient
                .from("mensajes")
                .select("contenido, direccion")
                .eq("conversacion_id", conversacion_id)
                .order("created_at", { ascending: true })
                .limit(10);

            if (mensajes) {
                conversationHistory = mensajes.map((m) => ({
                    role: m.direccion === "entrante" ? "user" : "assistant",
                    content: m.contenido,
                }));
            }
        }

        // Llamar a OpenAI
        const openaiResponse = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: iaConfig?.modelo || "gpt-4",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...conversationHistory.slice(-5), // Últimos 5 mensajes
                        { role: "user", content: userPrompt },
                    ],
                    temperature: iaConfig?.temperatura || 0.7,
                    max_tokens: iaConfig?.max_tokens || 500,
                }),
            }
        );

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error("OpenAI API error:", errorData);
            throw new Error(`OpenAI API error: ${errorData.error?.message}`);
        }

        const openaiData = await openaiResponse.json();
        const respuesta = openaiData.choices[0].message.content;

        // Guardar interacción en la base de datos
        const authHeader = req.headers.get("Authorization");
        let userId = null;

        if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            const { data: { user } } = await supabaseClient.auth.getUser(token);
            userId = user?.id;
        }

        await supabaseClient.from("interacciones_ia").insert({
            configuracion_ia_id: iaConfig?.id,
            usuario_id: userId,
            conversacion_id: conversacion_id || null,
            prompt: mensaje,
            respuesta: respuesta,
            tokens_usados: openaiData.usage?.total_tokens || 0,
            metadata: {
                tipo,
                modelo: openaiData.model,
                contexto,
            },
        });

        // Determinar si enviar automáticamente (solo para respuestas automáticas)
        const enviarAutomaticamente =
            tipo === "respuesta_automatica" &&
            iaConfig?.configuracion?.envio_automatico === true;

        return new Response(
            JSON.stringify({
                success: true,
                respuesta,
                tipo,
                enviar_automaticamente: enviarAutomaticamente,
                tokens_usados: openaiData.usage?.total_tokens || 0,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error in AI assistant:", error);
        return new Response(
            JSON.stringify({
                error: error.message,
                success: false,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
