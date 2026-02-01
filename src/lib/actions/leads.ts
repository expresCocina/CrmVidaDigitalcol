"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function convertLeadToClient(leadId: string) {
    try {
        // Use regular client for auth context
        const supabase = await createClient();

        // Use admin client for database operations that may be restricted by RLS
        const adminClient = createAdminClient();

        console.log("[convertLeadToClient] Iniciando conversión para lead:", leadId);

        // 1. Obtener datos del lead
        const { data: lead, error: fetchError } = await adminClient
            .from("leads")
            .select("*")
            .eq("id", leadId)
            .single();

        if (fetchError) {
            console.error("[convertLeadToClient] Error obteniendo lead:", fetchError);
            throw new Error(`Error al obtener lead: ${fetchError.message}`);
        }

        if (!lead) {
            throw new Error("Lead no encontrado");
        }

        console.log("[convertLeadToClient] Lead encontrado:", lead.nombre, "Estado actual:", lead.estado);

        // @ts-ignore - Schema types are outdated
        if (lead.convertido_a_cliente_id) {
            // @ts-ignore
            console.warn("[convertLeadToClient] Lead ya convertido, cliente_id:", lead.convertido_a_cliente_id);
            throw new Error("Este lead ya fue convertido");
        }

        // 2. Crear Cliente
        console.log("[convertLeadToClient] Creando cliente...");
        // @ts-ignore
        const { data: client, error: clientError } = await adminClient
            .from("clientes")
            .insert({
                nombre: lead.nombre,
                email: lead.email,
                telefono: lead.telefono,
                empresa: lead.empresa || null,
                asignado_a: lead.asignado_a,
                tipo_cliente: lead.empresa ? "empresa" : "individual",
                estado: "activo",
                // @ts-ignore - Schema types are outdated
                metadata: { ...lead.metadata, origen: "conversion_lead", lead_id: leadId }
            })
            .select()
            .single();

        if (clientError) {
            console.error("[convertLeadToClient] Error creando cliente:", clientError);
            throw new Error(`Error al crear cliente: ${clientError.message}`);
        }

        if (!client) {
            throw new Error("Cliente creado pero no retornado");
        }

        console.log("[convertLeadToClient] Cliente creado exitosamente, ID:", client.id);

        // 3. Actualizar Lead con fecha_conversion y cliente_id
        console.log("[convertLeadToClient] Actualizando lead...");
        const now = new Date().toISOString();
        const { error: updateError } = await adminClient
            .from("leads")
            .update({
                estado: "convertido",
                fecha_conversion: now,
                convertido_a_cliente_id: client.id
            })
            .eq("id", leadId);

        if (updateError) {
            console.error("[convertLeadToClient] Error actualizando lead:", updateError);
            throw new Error(`Error al actualizar lead: ${updateError.message}`);
        }

        console.log("[convertLeadToClient] Lead actualizado exitosamente");

        // 4. Registrar Actividad
        console.log("[convertLeadToClient] Creando actividad...");
        // @ts-ignore
        const { error: activityError } = await adminClient
            .from("actividades")
            .insert({
                tipo: "nota",
                titulo: "Lead Convertido a Cliente",
                descripcion: `El lead ${lead.nombre} fue convertido a cliente exitosamente.`,
                lead_id: leadId,
                cliente_id: client.id,
                creado_por: lead.asignado_a,
                asignado_a: lead.asignado_a,
                fecha_programada: now,
                estado: "completada"
            });

        if (activityError) {
            console.error("[convertLeadToClient] Error creando actividad:", activityError);
            // No lanzamos error aquí porque la conversión ya se completó
        } else {
            console.log("[convertLeadToClient] Actividad creada exitosamente");
        }

        // 5. Revalidar rutas
        console.log("[convertLeadToClient] Revalidando rutas...");
        revalidatePath("/dashboard/leads");
        revalidatePath("/dashboard/clientes");
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/debug");

        console.log("[convertLeadToClient] Conversión completada exitosamente");
        return { success: true, clientId: client.id };

    } catch (error: any) {
        console.error("[convertLeadToClient] Error fatal:", error);
        throw error;
    }
}
