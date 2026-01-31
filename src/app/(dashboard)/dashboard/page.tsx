import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    Users,
    UserPlus,
    Calendar,
    TrendingUp,
    MessageSquare,
    CheckCircle2,
} from "lucide-react";

interface DashboardStats {
    leads_nuevos: number;
    leads_convertidos: number;
    citas_programadas: number;
    valor_oportunidades: number;
    conversaciones_activas: number;
    actividades_pendientes: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Obtener estadísticas usando la función de base de datos
    const { data: stats } = await supabase.rpc("get_dashboard_stats", {
        p_usuario_id: user.id,
    });

    return (
        (stats as unknown as DashboardStats) || {
            leads_nuevos: 0,
            leads_convertidos: 0,
            citas_programadas: 0,
            valor_oportunidades: 0,
            conversaciones_activas: 0,
            actividades_pendientes: 0,
        }
    );
}

export default async function DashboardPage() {
    const stats = await getDashboardStats();

    const cards = [
        {
            title: "Leads Nuevos",
            value: stats.leads_nuevos || 0,
            icon: UserPlus,
            color: "bg-blue-500",
            change: "+12%",
        },
        {
            title: "Leads Convertidos",
            value: stats.leads_convertidos || 0,
            icon: CheckCircle2,
            color: "bg-green-500",
            change: "+8%",
        },
        {
            title: "Citas Programadas",
            value: stats.citas_programadas || 0,
            icon: Calendar,
            color: "bg-purple-500",
            change: "+5",
        },
        {
            title: "Valor Oportunidades",
            value: `$${(stats.valor_oportunidades || 0).toLocaleString("es-CO")}`,
            icon: TrendingUp,
            color: "bg-orange-500",
            change: "+15%",
        },
        {
            title: "Conversaciones Activas",
            value: stats.conversaciones_activas || 0,
            icon: MessageSquare,
            color: "bg-cyan-500",
            change: "+3",
        },
        {
            title: "Actividades Pendientes",
            value: stats.actividades_pendientes || 0,
            icon: Users,
            color: "bg-pink-500",
            change: "-2",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Resumen de tu actividad y métricas clave
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {card.title}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {card.value}
                                </p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span
                                        className={
                                            card.change.startsWith("+")
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-red-600 dark:text-red-400"
                                        }
                                    >
                                        {card.change}
                                    </span>{" "}
                                    vs. mes anterior
                                </p>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actividades Recientes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Actividades Recientes
                </h2>
                <div className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No hay actividades recientes para mostrar
                    </p>
                </div>
            </div>

            {/* Próximas Citas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Próximas Citas
                </h2>
                <div className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No hay citas programadas
                    </p>
                </div>
            </div>
        </div>
    );
}
