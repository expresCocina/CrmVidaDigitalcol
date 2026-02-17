import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendMetaEvent, hashData } from "../_shared/facebook-capi.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    console.log("[SALES-CHATBOT] Request received");

    try {
        const body = await req.json().catch(() => ({}));
        const { phoneNumber, messageText, conversacionId, leadName } = body;

        if (!conversacionId || !phoneNumber) {
            console.error("[SALES-CHATBOT] Missing metadata:", { conversacionId, phoneNumber });
            return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 400 });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("[SALES-CHATBOT] Critical: Missing Supabase environment variables");
            return new Response(JSON.stringify({ error: "Server Configuration Error (ENV)" }), { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Obtener estado actual de la conversación
        const { data: conv, error: convError } = await supabase
            .from("conversaciones")
            .select("metadata")
            .eq("id", conversacionId)
            .maybeSingle();

        if (convError) {
            console.error("[SALES-CHATBOT] DB error fetching conversation:", convError.message);
            throw new Error("Error fetching conversation state");
        }

        let state = conv?.metadata?.chatbot_state || "START";
        let responseMessage = "";
        let newState = state;

        const name = leadName || "amigo/a";
        const msgClean = (messageText || "").toLowerCase();

        console.log(`[SALES-CHATBOT] Processing state: ${state} for ${name}`);

        // Lógica de Estados
        switch (state) {
            case "START":
                responseMessage = `¡Hola ${name}! 👋 Bienvenido a Vida Digital.\n\nOfrecemos los mejores productos y servicios de marketing digital para impulsar tu negocio. 🚀\n\n¿Te gustaría recibir más información de nuestro *paquete en promoción* o prefieres conocer *otros paquetes*?`;
                newState = "QUALIFYING";
                break;

            case "QUALIFYING":
                if (msgClean.includes("promocion") || msgClean.includes("paquete")) {
                    responseMessage = `${name}, ¡excelente! ¿Deseas seguir con la venta automatizada por aquí o prefieres hablar con un *asesor real*?`;
                    newState = "DECISION";
                } else {
                    responseMessage = `${name}, no entendí muy bien. 😅 ¿Quieres información de la *promoción* o ver *otros paquetes*?`;
                }
                break;

            case "DECISION":
                if (msgClean.includes("asesor") || msgClean.includes("real")) {
                    responseMessage = `Entendido ${name}. En un momento un asesor se pondrá en contacto contigo para ayudarte personalmente. 👨‍💻`;
                    newState = "HUMAN_HANDOFF";
                } else {
                    // Cargar planes de la DB
                    const { data: planes } = await supabase.from("planes").select("nombre, precio").eq("activo", true);
                    const planesList = planes?.map(p => `• *${p.nombre}*: $${Number(p.precio).toLocaleString('es-CO')}`).join("\n") || "No hay planes disponibles en este momento.";

                    responseMessage = `${name}, estos son los paquetes que tenemos para ti:\n\n${planesList}\n\nSelecciona el que más te guste escribiendo su nombre. ✨`;
                    newState = "SHOWING_PLANS";
                }
                break;

            case "SHOWING_PLANS":
                responseMessage = `¡Excelente elección ${name}! 💳\n\nPronto te enviaremos los métodos de pago. Al completar la compra, un asesor te dará la bienvenida oficial y estará pendiente de la entrega de tu servicio.`;
                newState = "COMPLETED";

                // --- TRACKING CAPI: PURCHASE (Intención de compra) ---
                try {
                    const hashedPhone = await hashData(phoneNumber);
                    const hashedName = name !== "amigo/a" ? await hashData(name) : undefined;

                    sendMetaEvent({
                        event_name: "Purchase",
                        user_data: {
                            ph: [hashedPhone],
                            fn: hashedName ? [hashedName] : undefined,
                        },
                        custom_data: {
                            value: 990000, // Valor base o dinámico si se extrae del plan
                            currency: "COP",
                            content_name: msgClean
                        },
                        event_id: `purchase_${phoneNumber}_${Date.now()}`
                    });
                } catch (e) {
                    console.error("[CAPI] Error tracking Purchase:", e);
                }
                break;

            default:
                console.log(`[SALES-CHATBOT] State "${state}" is silent (human or completed)`);
                return new Response(JSON.stringify({ success: true, silent: true }), { status: 200 });
        }

        // Actualizar estado en la conversación
        const { error: updateError } = await supabase
            .from("conversaciones")
            .update({
                metadata: {
                    ...(conv?.metadata || {}),
                    chatbot_state: newState
                }
            })
            .eq("id", conversacionId);

        if (updateError) {
            console.error("[SALES-CHATBOT] Error updating state:", updateError.message);
        }

        // Enviar el mensaje a través de outbound utilizando el Service Role para evitar problemas de permisos
        const outboundResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/whatsapp-outbound`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: responseMessage,
                conversacion_id: conversacionId,
            }),
        });

        if (!outboundResponse.ok) {
            const outError = await outboundResponse.text();
            console.error("[SALES-CHATBOT] Outbound call failed:", outError);
        }

        return new Response(JSON.stringify({ success: true, newState }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("[SALES-CHATBOT] Fatal error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
