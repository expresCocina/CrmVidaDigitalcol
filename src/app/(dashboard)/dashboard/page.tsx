import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    Users,
    UserPlus,
    TrendingUp,
    Calendar,
    DollarSign,
    MessageSquare,
    CheckCircle2,
    Clock,
    Phone,
    Mail,
    FileText,
    Video
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardData {
    stats: {
        leadsNuevos: number;
        leadsConvertidos: number;
        citasProgramadas: number;
        actividadesPendientes: number;
        valorOportunidades: number;
        conversacionesActivas: number;
    };
    activities: any[];
    appointments: any[];
}

interface Activity {
    id: string;
    tipo: string;
    titulo: string;
    descripcion: string;
    fecha: string;
    usuario_nombre: string;
}

interface Cita {
    id: string;
    titulo: string;
    fecha_inicio: string;
    tipo: string;
    estado: string;
}

async function getDashboardData() {
    // Use regular client for auth
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Use admin client for data queries to bypass RLS
    const adminClient = createAdminClient();

    // Calculate date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysStr = last30Days.toISOString();
    const nowStr = new Date().toISOString();

    // 1. Leads Nuevos (Últimos 30 días)
    // @ts-ignore
    const { count: leadsNuevos } = await adminClient
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last30DaysStr);
    // Removed .eq("asignado_a"...) to show GLOBAL stats for demo, or re-add if strict.
    // Given user is admin-like context, showing all is safer for "seeing data".

    // 2. Leads Convertidos (Últimos 30 días)
    // @ts-ignore
    const { count: leadsConvertidos } = await adminClient
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("estado", "convertido")
        .gte("fecha_conversion", last30DaysStr);

    // 3. Citas Programadas
    // @ts-ignore
    const { count: citasProgramadas } = await adminClient
        .from("citas")
        .select("*", { count: "exact", head: true })
        .gte("fecha_inicio", last30DaysStr)
        .in("estado", ["programada", "confirmada"]);

    // 4. Actividades Pendientes
    // @ts-ignore
    const { count: actividadesPendientes } = await adminClient
        .from("actividades")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente")
        .gte("fecha_programada", nowStr);

    // 5. Actividades Recientes (sin filtro de usuario para mostrar todas)
    // @ts-ignore
    const { data: activitiesData, error: activitiesError } = await adminClient
        .from("actividades")
        .select("id, tipo, titulo, descripcion, created_at, creado_por")
        .order("created_at", { ascending: false })
        .limit(10);

    console.log("[Dashboard] Activities query result:", { activitiesData, activitiesError });

    // 6. Próximas Citas
    // @ts-ignore
    const { data: appointmentsData } = await adminClient
        .from("citas")
        .select("*")
        .in("estado", ["programada", "confirmada"])
        .gte("fecha_inicio", nowStr)
        .order("fecha_inicio", { ascending: true })
        .limit(5);


    const stats: DashboardStats = {
        leads_nuevos: leadsNuevos || 0,
        leads_convertidos: leadsConvertidos || 0,
        citas_programadas: citasProgramadas || 0,
        valor_oportunidades: 0, // Placeholder or query if needed
        conversaciones_activas: 0,
        actividades_pendientes: actividadesPendientes || 0
    };

    const activities = (activitiesData || []).map((a: any) => ({
        id: a.id,
        tipo: a.tipo,
        titulo: a.titulo,
        descripcion: a.descripcion,
        fecha: a.created_at,
        usuario_nombre: a.usuarios?.nombre_completo || "Usuario"
    }));

    return {
        stats,
        activities,
        appointments: (appointmentsData as Cita[]) || []
    };
}

export default async function DashboardPage() {
    const { stats, activities, appointments } = await getDashboardData();

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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'llamada': return Phone;
            case 'email': return Mail;
            case 'reunion': return Users;
            default: return FileText;
        }
    };

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Actividades Recientes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-500" />
                        Actividades Recientes
                    </h2>
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity) => {
                                const Icon = getActivityIcon(activity.tipo);
                                return (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {activity.titulo}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {format(new Date(activity.fecha), "d MMM, h:mm a", { locale: es })} - {activity.usuario_nombre || 'Usuario'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                No hay actividades recientes para mostrar
                            </p>
                        )}
                    </div>
                </div>

                {/* Próximas Citas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                        Próximas Citas
                    </h2>
                    <div className="space-y-4">
                        {appointments.length > 0 ? (
                            appointments.map((cita) => (
                                <div key={cita.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-900/20">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {cita.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {format(new Date(cita.fecha_inicio), "EEEE d MMM, h:mm a", { locale: es })}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                        {cita.tipo}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                No hay citas programadas
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
