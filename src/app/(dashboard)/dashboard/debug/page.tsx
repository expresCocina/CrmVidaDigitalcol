import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DebugPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Get ALL leads
    const { data: allLeads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

    // Get ALL clients
    // @ts-ignore
    const { data: allClients, error: clientsError } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

    // Get ALL activities
    // @ts-ignore
    const { data: allActivities, error: activitiesError } = await supabase
        .from("actividades")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Debug Database State</h1>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Leads ({allLeads?.length || 0})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Estado</th>
                                <th className="border px-4 py-2">Fecha Conversión</th>
                                <th className="border px-4 py-2">Cliente ID</th>
                                <th className="border px-4 py-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allLeads?.map((lead: any) => (
                                <tr key={lead.id}>
                                    <td className="border px-4 py-2">{lead.nombre}</td>
                                    <td className="border px-4 py-2">{lead.estado}</td>
                                    <td className="border px-4 py-2">{lead.fecha_conversion || 'NULL'}</td>
                                    <td className="border px-4 py-2">{lead.convertido_a_cliente_id || 'NULL'}</td>
                                    <td className="border px-4 py-2">{new Date(lead.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {leadsError && <p className="text-red-500">Error: {leadsError.message}</p>}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Clientes ({allClients?.length || 0})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2">Nombre</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Estado</th>
                                <th className="border px-4 py-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allClients?.map((client: any) => (
                                <tr key={client.id}>
                                    <td className="border px-4 py-2">{client.nombre}</td>
                                    <td className="border px-4 py-2">{client.email}</td>
                                    <td className="border px-4 py-2">{client.estado}</td>
                                    <td className="border px-4 py-2">{new Date(client.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {clientsError && <p className="text-red-500">Error: {clientsError.message}</p>}
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Actividades ({allActivities?.length || 0})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2">Tipo</th>
                                <th className="border px-4 py-2">Título</th>
                                <th className="border px-4 py-2">Lead ID</th>
                                <th className="border px-4 py-2">Cliente ID</th>
                                <th className="border px-4 py-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allActivities?.map((activity: any) => (
                                <tr key={activity.id}>
                                    <td className="border px-4 py-2">{activity.tipo}</td>
                                    <td className="border px-4 py-2">{activity.titulo}</td>
                                    <td className="border px-4 py-2">{activity.lead_id || 'NULL'}</td>
                                    <td className="border px-4 py-2">{activity.cliente_id || 'NULL'}</td>
                                    <td className="border px-4 py-2">{new Date(activity.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {activitiesError && <p className="text-red-500">Error: {activitiesError.message}</p>}
            </div>
        </div>
    );
}
