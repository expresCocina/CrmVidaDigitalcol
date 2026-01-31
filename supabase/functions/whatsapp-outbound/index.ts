import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { to, message, conversacion_id, plantilla_id } = await req.json();

        if (!to || !message) {
            throw new Error("Missing required fields: to, message");
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Obtener configuración de WhatsApp
        const { data: whatsappConfig } = await supabaseClient
            .from("integraciones")
            .select("credenciales, configuracion")
            .eq("tipo", "whatsapp")
            .eq("activo", true)
            .single();

        if (!whatsappConfig) {
            throw new Error("WhatsApp integration not configured");
        }

        const accessToken =
            whatsappConfig.credenciales.access_token ||
            Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const phoneNumberId =
            whatsappConfig.credenciales.phone_number_id ||
            Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

        // Limpiar número de teléfono (remover espacios, guiones, etc.)
        const cleanPhone = to.replace(/\D/g, "");

        // Enviar mensaje a WhatsApp Business API
        const whatsappResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "text",
                    text: {
                        body: message,
                    },
                }),
            }
        );

        const whatsappData = await whatsappResponse.json();

        if (!whatsappResponse.ok) {
            console.error("WhatsApp API error:", whatsappData);
            throw new Error(
                `WhatsApp API error: ${whatsappData.error?.message || "Unknown error"}`
            );
        }

        console.log("Message sent successfully:", whatsappData);

        // Guardar mensaje en la base de datos
        if (conversacion_id) {
            const authHeader = req.headers.get("Authorization");
            let userId = null;

            // Intentar obtener el usuario autenticado
            if (authHeader) {
                const token = authHeader.replace("Bearer ", "");
                const { data: { user } } = await supabaseClient.auth.getUser(token);
                userId = user?.id;
            }

            const { error: msgError } = await supabaseClient.from("mensajes").insert({
                conversacion_id,
                contenido: message,
                tipo: "texto",
                direccion: "saliente",
                enviado_por: userId,
                leido: false,
                entregado: true,
                metadata: {
                    whatsapp_message_id: whatsappData.messages?.[0]?.id,
                    plantilla_id: plantilla_id || null,
                },
            });

            if (msgError) {
                console.error("Error saving message to database:", msgError);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message_id: whatsappData.messages?.[0]?.id,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
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
