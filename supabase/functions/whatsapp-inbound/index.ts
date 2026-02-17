import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendMetaEvent, hashData } from "../_shared/facebook-capi.ts";

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
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    console.log("[INBOUND] Webhook received");

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("[INBOUND] Critical: Missing Supabase environment variables");
            return new Response(JSON.stringify({ error: "Server Configuration Error (ENV)" }), { status: 500 });
        }

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        // Obtener configuración de WhatsApp
        const { data: whatsappConfig } = await supabaseClient
            .from("integraciones")
            .select("credenciales")
            .eq("tipo", "whatsapp")
            .eq("activo", true)
            .maybeSingle();

        const verifyToken = whatsappConfig?.credenciales?.verify_token || Deno.env.get("WHATSAPP_VERIFY_TOKEN");

        // Verificar webhook (GET)
        if (req.method === "GET") {
            const url = new URL(req.url);
            const mode = url.searchParams.get("hub.mode");
            const token = url.searchParams.get("hub.verify_token");
            const challenge = url.searchParams.get("hub.challenge");

            if (mode === "subscribe" && token === verifyToken) {
                return new Response(challenge, { status: 200 });
            }
            return new Response("Forbidden", { status: 403 });
        }

        // Procesar mensaje (POST)
        const body = await req.json().catch(() => ({}));

        // Manejar actualizaciones de estado (leído, entregado)
        if (body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]) {
            const status = body.entry[0].changes[0].value.statuses[0];
            const whatsappMessageId = status.id;
            const statusType = status.status;

            console.log(`[INBOUND] Status Update: ${statusType} for ID ${whatsappMessageId}`);

            const updateData: any = {};
            if (statusType === 'delivered') updateData.entregado = true;
            else if (statusType === 'read') {
                updateData.leido = true;
                updateData.entregado = true;
            } else if (statusType === 'failed') {
                updateData.metadata = { error: status.errors?.[0], last_status: statusType };
            }

            if (Object.keys(updateData).length > 0) {
                await supabaseClient
                    .from("mensajes")
                    .update(updateData)
                    .eq("metadata->>whatsapp_message_id", whatsappMessageId);
            }

            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        // Si no hay mensaje, retornar éxito
        const messageData = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!messageData) {
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        const message: WhatsAppMessage = messageData;
        const phoneNumber = message.from;
        const messageText = message.text?.body || "";
        const profileName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || null;

        console.log(`[INBOUND] New message from ${phoneNumber}: "${messageText}"`);

        // Buscar o crear conversación
        let { data: conversacion, error: convError } = await supabaseClient
            .from("conversaciones")
            .select("*")
            .eq("canal", "whatsapp")
            .eq("identificador_externo", phoneNumber)
            .maybeSingle();

        if (!conversacion) {
            const { data: lead } = await supabaseClient.from("leads").select("id").eq("telefono", phoneNumber).maybeSingle();
            const { data: cliente } = await supabaseClient.from("clientes").select("id").eq("telefono", phoneNumber).maybeSingle();

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

            if (createError) throw createError;
            conversacion = newConv;

            // Crear lead si no existe
            if (!lead && !cliente) {
                const { data: newLead } = await supabaseClient.from("leads").insert({
                    nombre: profileName || `Lead WhatsApp ${phoneNumber}`,
                    telefono: phoneNumber,
                    fuente_id: (await supabaseClient.from("fuentes_leads").select("id").eq("nombre", "WhatsApp").maybeSingle()).data?.id,
                    estado: "nuevo",
                }).select().single();

                if (newLead) {
                    await supabaseClient.from("conversaciones").update({ lead_id: newLead.id }).eq("id", conversacion.id);
                    conversacion.lead_id = newLead.id;

                    // --- TRACKING CAPI: LEAD ---
                    try {
                        const hashedPhone = await hashData(phoneNumber);
                        const hashedName = profileName ? await hashData(profileName) : undefined;

                        sendMetaEvent({
                            event_name: "Lead",
                            user_data: {
                                ph: [hashedPhone],
                                fn: hashedName ? [hashedName] : undefined,
                            },
                            custom_data: {
                                content_name: "Nuevo Prospecto WhatsApp",
                                status: "nuevo"
                            },
                            event_id: `lead_${phoneNumber}_${Date.now()}`
                        });
                    } catch (e) {
                        console.error("[CAPI] Error tracking Lead:", e);
                    }
                }
            }
        }

        // Guardar mensaje
        let contenido = messageText;
        let tipoMensaje = message.type;

        // Manejar imágenes
        if (message.type === 'image' && message.image?.id) {
            try {
                const mediaId = message.image.id;
                const accessToken = whatsappConfig?.credenciales?.access_token || Deno.env.get("WHATSAPP_ACCESS_TOKEN");

                const mediaInfoResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const mediaInfo = await mediaInfoResponse.json();

                if (mediaInfo.url) {
                    const imageResponse = await fetch(mediaInfo.url, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const imageBlob = await imageResponse.blob();

                    const fileName = `whatsapp/${conversacion.id}/${Date.now()}_${mediaId}.jpg`;
                    const { data: uploadData, error: uploadError } = await supabaseClient.storage
                        .from('mensajes')
                        .upload(fileName, imageBlob, {
                            contentType: message.image.mime_type || 'image/jpeg',
                        });

                    if (!uploadError && uploadData) {
                        const { data: { publicUrl } } = supabaseClient.storage.from('mensajes').getPublicUrl(fileName);
                        contenido = publicUrl;
                        tipoMensaje = 'imagen';
                    }
                }
            } catch (error) {
                console.error('[INBOUND] Error processing image:', error);
                contenido = '[Error al procesar imagen]';
            }
        }

        // Manejar audio
        if ((message.type === 'audio' || message.type === 'voice') && (message as any).audio?.id) {
            try {
                const mediaId = (message as any).audio.id;
                const accessToken = whatsappConfig?.credenciales?.access_token || Deno.env.get("WHATSAPP_ACCESS_TOKEN");

                const mediaInfoResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const mediaInfo = await mediaInfoResponse.json();

                if (mediaInfo.url) {
                    const audioResponse = await fetch(mediaInfo.url, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const audioBlob = await audioResponse.blob();

                    const fileName = `whatsapp/${conversacion.id}/${Date.now()}_${mediaId}.ogg`;
                    const { data: uploadData, error: uploadError } = await supabaseClient.storage
                        .from('mensajes')
                        .upload(fileName, audioBlob, {
                            contentType: (message as any).audio.mime_type || 'audio/ogg',
                        });

                    if (!uploadError && uploadData) {
                        const { data: { publicUrl } } = supabaseClient.storage.from('mensajes').getPublicUrl(fileName);
                        contenido = publicUrl;
                        tipoMensaje = 'audio';
                    }
                }
            } catch (error) {
                console.error('[INBOUND] Error processing audio:', error);
                contenido = '[Error al procesar audio]';
            }
        }

        const { error: msgError } = await supabaseClient.from("mensajes").insert({
            conversacion_id: conversacion.id,
            contenido: contenido,
            tipo: tipoMensaje === 'image' ? 'imagen' : (tipoMensaje === 'audio' || tipoMensaje === 'voice' ? 'audio' : 'texto'),
            direccion: "entrante",
            leido: false,
            entregado: true,
            metadata: { whatsapp_message_id: message.id },
        });

        if (msgError) console.error("[INBOUND] Error saving message:", msgError.message);

        // Llamar al Chatbot (No bloqueante de la respuesta a Meta)
        try {
            let leadNameFinal = profileName || "amigo/a";
            if (conversacion.lead_id) {
                const { data: leadData } = await supabaseClient.from("leads").select("nombre").eq("id", conversacion.lead_id).maybeSingle();
                if (leadData?.nombre) leadNameFinal = leadData.nombre;
            }

            // Llamada asíncrona (fuego y olvido relativo para asegurar respuesta rápida a Meta)
            fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sales-chatbot`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    messageText: messageText,
                    conversacionId: conversacion.id,
                    leadName: leadNameFinal,
                }),
            }).catch(e => console.error("[INBOUND] Chatbot call non-blocking error:", e.message));

        } catch (cbError: any) {
            console.error("[INBOUND] Error preparing chatbot call:", cbError.message);
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error: any) {
        console.error("[INBOUND] Fatal error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
