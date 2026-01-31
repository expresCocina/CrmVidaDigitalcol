import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppMessage {
    from: string;
    id: string;
    timestamp: string;
    type: string;
    text?: { body: string };
    image?: { id: string; mime_type: string; sha256: string };
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Verificar webhook de WhatsApp
        if (req.method === "GET") {
            const url = new URL(req.url);
            const mode = url.searchParams.get("hub.mode");
            const token = url.searchParams.get("hub.verify_token");
            const challenge = url.searchParams.get("hub.challenge");

            if (
                mode === "subscribe" &&
                token === Deno.env.get("WHATSAPP_VERIFY_TOKEN")
            ) {
                return new Response(challenge, { status: 200 });
            }

            return new Response("Forbidden", { status: 403 });
        }

        // Procesar mensaje entrante
        const body = await req.json();
        console.log("WhatsApp webhook received:", JSON.stringify(body));

        if (!body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const message: WhatsAppMessage =
            body.entry[0].changes[0].value.messages[0];
        const phoneNumber = message.from;
        const messageText = message.text?.body || "";

        console.log(`Message from ${phoneNumber}: ${messageText}`);

        // Buscar o crear conversación
        let { data: conversacion, error: convError } = await supabaseClient
            .from("conversaciones")
            .select("*")
            .eq("canal", "whatsapp")
            .eq("identificador_externo", phoneNumber)
            .single();

        if (convError || !conversacion) {
            // Buscar lead o cliente por teléfono
            const { data: lead } = await supabaseClient
                .from("leads")
                .select("id")
                .eq("telefono", phoneNumber)
                .single();

            const { data: cliente } = await supabaseClient
                .from("clientes")
                .select("id")
                .eq("telefono", phoneNumber)
                .single();

            // Crear nueva conversación
            const { data: newConv, error: createError } = await supabaseClient
                .from("conversaciones")
                .insert({
                    canal: "whatsapp",
                    identificador_externo: phoneNumber,
                    lead_id: lead?.id || null,
                    cliente_id: cliente?.id || null,
                    estado: "abierta",
                })
                .select()
                .single();

            if (createError) {
                console.error("Error creating conversation:", createError);
                throw createError;
            }

            conversacion = newConv;

            // Si no existe lead ni cliente, crear lead automáticamente
            if (!lead && !cliente) {
                const { error: leadError } = await supabaseClient.from("leads").insert({
                    nombre: `Lead WhatsApp ${phoneNumber}`,
                    telefono: phoneNumber,
                    fuente_id: (
                        await supabaseClient
                            .from("fuentes_leads")
                            .select("id")
                            .eq("nombre", "WhatsApp")
                            .single()
                    ).data?.id,
                    estado: "nuevo",
                });

                if (leadError) {
                    console.error("Error creating lead:", leadError);
                }
            }
        }

        // Guardar mensaje
        const { error: msgError } = await supabaseClient.from("mensajes").insert({
            conversacion_id: conversacion.id,
            contenido: messageText,
            tipo: message.type,
            direccion: "entrante",
            leido: false,
            entregado: true,
            metadata: { whatsapp_message_id: message.id },
        });

        if (msgError) {
            console.error("Error saving message:", msgError);
            throw msgError;
        }

        // Llamar a IA para generar respuesta automática (opcional)
        try {
            const aiResponse = await fetch(
                `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-assistant`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                    },
                    body: JSON.stringify({
                        mensaje: messageText,
                        conversacion_id: conversacion.id,
                        tipo: "respuesta_automatica",
                    }),
                }
            );

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                console.log("AI response:", aiData);

                // Enviar respuesta automática si está habilitada
                if (aiData.respuesta && aiData.enviar_automaticamente) {
                    await fetch(
                        `${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-outbound`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                            },
                            body: JSON.stringify({
                                to: phoneNumber,
                                message: aiData.respuesta,
                                conversacion_id: conversacion.id,
                            }),
                        }
                    );
                }
            }
        } catch (aiError) {
            console.error("Error calling AI assistant:", aiError);
            // No lanzar error, continuar sin IA
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
