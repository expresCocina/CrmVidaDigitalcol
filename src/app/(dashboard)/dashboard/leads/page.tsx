import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

async function getLeads() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: leads, error } = await supabase
        .from("leads")
        .select(`
      *,
      fuentes_leads(nombre),
      usuarios:asignado_a(nombre_completo)
    `)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching leads:", error);
        return [];
    }

    return leads || [];
}

const estadoColors: Record<string, string> = {
    nuevo: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    contactado:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    calificado:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    no_calificado:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    convertido:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const calificacionColors: Record<string, string> = {
    frio: "bg-blue-500",
    tibio: "bg-yellow-500",
    caliente: "bg-red-500",
};

export default async function LeadsPage() {
    const leads = await getLeads();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Leads
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Gestiona tus prospectos y oportunidades de venta
                    </p>
                </div>
                <Link
                    href="/dashboard/leads/nuevo"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Lead
                </Link>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                        <option value="">Todos los estados</option>
                        <option value="nuevo">Nuevo</option>
                        <option value="contactado">Contactado</option>
                        <option value="calificado">Calificado</option>
                        <option value="no_calificado">No Calificado</option>
                        <option value="convertido">Convertido</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Leads */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Contacto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fuente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Calificación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Asignado a
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {leads.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No hay leads para mostrar. Crea tu primer lead para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead: any) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                    {lead.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {lead.nombre}
                                                    </div>
                                                    {lead.empresa && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {lead.empresa}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {lead.email || "-"}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {lead.telefono || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {lead.fuentes_leads?.nombre || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoColors[lead.estado] || estadoColors.nuevo
                                                    }`}
                                            >
                                                {lead.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.calificacion ? (
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${calificacionColors[lead.calificacion]
                                                            } mr-2`}
                                                    />
                                                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                                                        {lead.calificacion}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {lead.usuarios?.nombre_completo || "Sin asignar"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/dashboard/leads/${lead.id}`}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Ver detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
