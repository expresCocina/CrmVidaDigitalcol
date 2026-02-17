import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    console.log("[OUTBOUND] Request received");

    let usedTokenPrefix = "init";
    let usedPhoneId = "init";
    let credentialSource = "none";

    try {
        const body = await req.json().catch(() => ({}));
        const { to, message, media_url, type = "texto", conversacion_id, plantilla_id } = body;

        console.log(`[OUTBOUND] Processing request for ${to}, type: ${type}`);

        if (!to || (!message && !media_url)) {
            console.error("[OUTBOUND] Missing required fields:", { to, message, media_url });
            return new Response(JSON.stringify({ error: "Missing required fields (to, and message or media_url)" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("[OUTBOUND] Critical: Missing Supabase environment variables");
            return new Response(JSON.stringify({ error: "Server Configuration Error (ENV)" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Obtener configuración de WhatsApp
        const { data: whatsappConfig, error: configError } = await supabaseClient
            .from("integraciones")
            .select("credenciales, configuracion")
            .eq("tipo", "whatsapp")
            .eq("activo", true)
            .maybeSingle();

        if (configError || !whatsappConfig) {
            console.error("[OUTBOUND] Error fetching config:", configError);
            throw new Error("WhatsApp integration not configured or inactive");
        }

        const accessToken = whatsappConfig?.credenciales?.access_token || Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const phoneNumberId = whatsappConfig?.credenciales?.phone_number_id || Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        usedTokenPrefix = accessToken?.substring(0, 10) || "none";
        usedPhoneId = phoneNumberId || "none";
        credentialSource = whatsappConfig?.credenciales?.access_token ? "database" : "environment";

        console.log(`[OUTBOUND] Using credentials from ${credentialSource}. Phone ID: ${usedPhoneId}`);

        if (!accessToken || !phoneNumberId) {
            console.error("[OUTBOUND] Missing credentials in DB and ENV");
            throw new Error("WhatsApp credentials missing");
        }

        // Limpiar número de teléfono (solo números)
        const cleanPhone = String(to).replace(/\D/g, "");

        // Preparar el cuerpo del mensaje para Meta
        const messageBody: any = {
            messaging_product: "whatsapp",
            to: cleanPhone,
        };

        if (type === "image" || type === "imagen") {
            messageBody.type = "image";
            messageBody.image = { link: media_url };
            if (message) messageBody.image.caption = message;
        } else if (type === "audio" || type === "voice") {
            messageBody.type = "audio";
            messageBody.audio = { link: media_url };
        } else {
            messageBody.type = "text";
            messageBody.text = { body: message };
        }

        console.log(`[OUTBOUND] Calling Meta API for ${cleanPhone}...`);

        // Enviar mensaje a WhatsApp Business API
        const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(messageBody),
            }
        );

        const whatsappData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
            console.error("[OUTBOUND] Meta API Error Details:", JSON.stringify(whatsappData));
            throw new Error(whatsappData.error?.message || "Error from Meta API");
        }

        console.log("[OUTBOUND] Message sent successfully via Meta");

        // Guardar mensaje en la base de datos
        if (conversacion_id) {
            const authHeader = req.headers.get("Authorization");
            let userId = null;

            // Intentar obtener el usuario autenticado (Opcional, no debe romper la función)
            try {
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.replace("Bearer ", "");
                    // Solo intentar getUser si el token parece un JWT (evitar crash con API keys de sistema)
                    if (token.split('.').length === 3) {
                        const { data, error: authError } = await supabaseClient.auth.getUser(token);
                        if (!authError && data?.user) {
                            userId = data.user.id;
                        }
                    }
                }
            } catch (e) {
                console.warn("[OUTBOUND] Could not determine user (system auth or invalid JWT):", e.message);
            }

            const { error: msgError } = await supabaseClient.from("mensajes").insert({
                conversacion_id,
                contenido: message || media_url,
                tipo: (type === "image" || type === "imagen") ? "imagen" :
                    (type === "audio" || type === "voice") ? "audio" : "texto",
                direccion: "saliente",
                enviado_por: userId,
                leido: false,
                entregado: true,
                metadata: {
                    whatsapp_message_id: whatsappData.messages?.[0]?.id,
                    plantilla_id: plantilla_id || null,
                    media_url: media_url || null
                },
            });

            if (msgError) {
                console.error("[OUTBOUND] Error saving result to DB:", msgError.message);
            }
        }

        return new Response(JSON.stringify({ success: true, message_id: whatsappData.messages?.[0]?.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("[OUTBOUND] Fatal error in function:", error.message);

        // Diagnóstico para el frontend (útil para el usuario)
        const diag = {
            error: error.message,
            used_token_prefix: usedTokenPrefix,
            used_phone_id: usedPhoneId,
            credential_source: credentialSource,
            success: false
        };

        return new Response(JSON.stringify(diag), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
