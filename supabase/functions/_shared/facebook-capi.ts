/**
 * Utilidad compartida para enviar eventos a Meta Conversions API (CAPI)
 */

const PIXEL_ID = "1468671101342188";
const ACCESS_TOKEN = "EAATlWMpQtdwBQkNP3gxs8OsFpNLZBdbvtj0tbcsGfgxpWGNSQvJg1LkvpECrcOtdoCgajaqPwZCGWV8ZBXTrZBF0UIJ8gqbV8yVNY0MNTrtVRvKgw5IZAdcoqLDNh2uiZCpcEHfCRmVkM0ZCQkl0zZBotsjO8cQ0MWmtly0nW9TZBSbwZBaEAbnOFqGZCsEwBm67wZDZD";

interface FBEventData {
    event_name: string;
    event_time?: number;
    action_source?: "email" | "website" | "app" | "phone_call" | "other";
    user_data: {
        em?: string[]; // email hashed
        ph?: string[]; // phone hashed
        fn?: string[]; // first name hashed
        ln?: string[]; // last name hashed
        external_id?: string[];
        client_user_agent?: string;
        client_ip_address?: string;
    };
    custom_data?: {
        value?: number;
        currency?: string;
        content_name?: string;
        content_category?: string;
        status?: string;
    };
    event_id?: string;
}

export async function sendMetaEvent(event: FBEventData) {
    try {
        const payload = {
            data: [
                {
                    event_name: event.event_name,
                    event_time: event.event_time || Math.floor(Date.now() / 1000),
                    action_source: event.action_source || "website",
                    user_data: event.user_data,
                    custom_data: event.custom_data,
                    event_id: event.event_id,
                },
            ],
        };

        console.log(`[CAPI] Sending event: ${event.event_name}`);

        const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
                access_token: ACCESS_TOKEN,
            }),
        });

        const result = await response.json();
        if (result.error) {
            console.error("[CAPI] Error from Meta:", result.error);
        } else {
            console.log(`[CAPI] Success: ${event.event_name}`, result);
        }
        return result;
    } catch (error) {
        console.error("[CAPI] Fatal error sending event:", error);
        return { error };
    }
}

/**
 * Función helper para hashear datos sensibles (SHA-256)
 * Nota: En Edge Functions se puede usar Web Crypto API
 */
export async function hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataUint8 = encoder.encode(data.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
