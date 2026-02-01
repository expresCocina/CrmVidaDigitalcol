"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { getNowColombia, getStartOfDayColombia, getEndOfDayColombia } from "@/lib/utils/dates";
import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Calendar,
    Activity,
    Download,
    Filter
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface KPIData {
    totalLeads: number;
    leadsChange: number;
    conversionRate: number;
    conversionChange: number;
    newClients: number;
    clientsChange: number;
    totalActivities: number;
    activitiesChange: number;
}

interface ChartData {
    leadsByDay: Array<{ fecha: string; total: number }>;
    leadsBySource: Array<{ nombre: string; total: number }>;
    leadsByStatus: Array<{ estado: string; total: number }>;
    topUsers: Array<{ nombre: string; actividades: number }>;
}

type DateFilter = "today" | "week" | "month" | "year" | "custom";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ReportesPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>("month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kpiData, setKpiData] = useState<KPIData>({
        totalLeads: 0,
        leadsChange: 0,
        conversionRate: 0,
        conversionChange: 0,
        newClients: 0,
        clientsChange: 0,
        totalActivities: 0,
        activitiesChange: 0
    });
    const [chartData, setChartData] = useState<ChartData>({
        leadsByDay: [],
        leadsBySource: [],
        leadsByStatus: [],
        topUsers: []
    });

    useEffect(() => {
        fetchReportData();
    }, [dateFilter]);

    const getDateRange = () => {
        const now = getNowColombia(); // Usar hora de Colombia
        let startDate: Date;
        let endDate = now;

        switch (dateFilter) {
            case "today":
                startDate = getStartOfDayColombia(); // 00:00:00 en Colombia
                endDate = getEndOfDayColombia(); // 23:59:59 en Colombia
                break;
            case "week":
                startDate = subDays(now, 7);
                break;
            case "month":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "year":
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                break;
            default:
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
        }

        return { startDate, endDate };
    };

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { startDate, endDate } = getDateRange();

        try {
            // KPIs - Total Leads
            const { data: currentLeads, error: leadsError } = await supabase
                .from("leads")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (leadsError) throw leadsError;

            // Período anterior para comparación
            const periodLength = endDate.getTime() - startDate.getTime();
            const prevStartDate = new Date(startDate.getTime() - periodLength);
            const prevEndDate = startDate;

            const { data: prevLeads } = await supabase
                .from("leads")
                .select("*")
                .gte("created_at", prevStartDate.toISOString())
                .lt("created_at", prevEndDate.toISOString());

            const totalLeads = currentLeads?.length || 0;
            const prevTotal = prevLeads?.length || 0;
            const leadsChange = prevTotal > 0 ? ((totalLeads - prevTotal) / prevTotal) * 100 : 0;

            // Tasa de conversión
            const convertedLeads = currentLeads?.filter(l => l.estado === "convertido").length || 0;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            const prevConverted = prevLeads?.filter(l => l.estado === "convertido").length || 0;
            const prevConversionRate = prevTotal > 0 ? (prevConverted / prevTotal) * 100 : 0;
            const conversionChange = prevConversionRate > 0
                ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100
                : 0;

            // Clientes nuevos
            const { data: currentClients } = await supabase
                .from("clientes")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            const { data: prevClients } = await supabase
                .from("clientes")
                .select("*")
                .gte("created_at", prevStartDate.toISOString())
                .lt("created_at", prevEndDate.toISOString());

            const newClients = currentClients?.length || 0;
            const prevClientsTotal = prevClients?.length || 0;
            const clientsChange = prevClientsTotal > 0
                ? ((newClients - prevClientsTotal) / prevClientsTotal) * 100
                : 0;

            // Actividades
            const { data: currentActivities } = await supabase
                .from("actividades")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            const { data: prevActivities } = await supabase
                .from("actividades")
                .select("*")
                .gte("created_at", prevStartDate.toISOString())
                .lt("created_at", prevEndDate.toISOString());

            const totalActivities = currentActivities?.length || 0;
            const prevActivitiesTotal = prevActivities?.length || 0;
            const activitiesChange = prevActivitiesTotal > 0
                ? ((totalActivities - prevActivitiesTotal) / prevActivitiesTotal) * 100
                : 0;

            setKpiData({
                totalLeads,
                leadsChange,
                conversionRate,
                conversionChange,
                newClients,
                clientsChange,
                totalActivities,
                activitiesChange
            });

            // Datos para gráficos
            // Leads por día
            const leadsByDayMap = new Map<string, number>();
            currentLeads?.forEach(lead => {
                if (lead.created_at) {
                    const fecha = format(new Date(lead.created_at), "dd MMM", { locale: es });
                    leadsByDayMap.set(fecha, (leadsByDayMap.get(fecha) || 0) + 1);
                }
            });
            const leadsByDay = Array.from(leadsByDayMap, ([fecha, total]) => ({ fecha, total }));

            // Leads por fuente
            const { data: leadsBySourceData } = await supabase
                .from("leads")
                .select(`
                    fuente_id,
                    fuentes_leads (nombre)
                `)
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            const sourceMap = new Map<string, number>();
            leadsBySourceData?.forEach(lead => {
                const nombre = (lead.fuentes_leads as any)?.nombre || "Sin fuente";
                sourceMap.set(nombre, (sourceMap.get(nombre) || 0) + 1);
            });
            const leadsBySource = Array.from(sourceMap, ([nombre, total]) => ({ nombre, total }));

            // Leads por estado
            const statusMap = new Map<string, number>();
            currentLeads?.forEach(lead => {
                const estado = lead.estado || "Desconocido";
                statusMap.set(estado, (statusMap.get(estado) || 0) + 1);
            });
            const leadsByStatus = Array.from(statusMap, ([estado, total]) => ({ estado, total }));

            // Top usuarios
            const { data: topUsersData } = await supabase
                .from("actividades")
                .select(`
                    creado_por,
                    usuarios!actividades_creado_por_fkey (nombre_completo)
                `)
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            const userMap = new Map<string, number>();
            topUsersData?.forEach(activity => {
                const nombre = (activity.usuarios as any)?.nombre_completo || "Desconocido";
                userMap.set(nombre, (userMap.get(nombre) || 0) + 1);
            });
            const topUsers = Array.from(userMap, ([nombre, actividades]) => ({ nombre, actividades }))
                .sort((a, b) => b.actividades - a.actividades)
                .slice(0, 5);

            setChartData({
                leadsByDay,
                leadsBySource,
                leadsByStatus,
                topUsers
            });

        } catch (error: any) {
            console.error("Error fetching report data:", error);
            setError(error.message || "Error al cargar los reportes");
        } finally {
            setLoading(false);
        }
    };

    const KPICard = ({
        title,
        value,
        change,
        icon: Icon,
        format: formatType = "number"
    }: {
        title: string;
        value: number;
        change: number;
        icon: any;
        format?: "number" | "percentage"
    }) => {
        const isPositive = change >= 0;
        const formattedValue = formatType === "percentage" ? `${value.toFixed(1)}%` : value.toLocaleString();

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formattedValue}</p>
                        <div className={`flex items-center mt-2 text-sm ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                            <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive && "rotate-180"}`} />
                            <span>{Math.abs(change).toFixed(1)}% vs período anterior</span>
                        </div>
                    </div>
                    <div className="ml-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                        Reportes y Analytics
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Visualiza métricas clave y analiza el rendimiento de tu negocio
                    </p>
                </div>

                {/* Filtros de fecha */}
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Hoy</option>
                        <option value="week">Últimos 7 días</option>
                        <option value="month">Este mes</option>
                        <option value="year">Este año</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-4">Cargando reportes...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                    <button
                        onClick={() => fetchReportData()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard
                            title="Total de Leads"
                            value={kpiData.totalLeads}
                            change={kpiData.leadsChange}
                            icon={Users}
                        />
                        <KPICard
                            title="Tasa de Conversión"
                            value={kpiData.conversionRate}
                            change={kpiData.conversionChange}
                            icon={Target}
                            format="percentage"
                        />
                        <KPICard
                            title="Clientes Nuevos"
                            value={kpiData.newClients}
                            change={kpiData.clientsChange}
                            icon={Users}
                        />
                        <KPICard
                            title="Actividades"
                            value={kpiData.totalActivities}
                            change={kpiData.activitiesChange}
                            icon={Activity}
                        />
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Leads por día */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Leads por Día
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData.leadsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="fecha" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Leads por fuente */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Leads por Fuente
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.leadsBySource}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="nombre" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Leads por estado */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Distribución por Estado
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.leadsByStatus}
                                        dataKey="total"
                                        nameKey="estado"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {chartData.leadsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top usuarios */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Top 5 Usuarios Más Activos
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.topUsers} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis type="number" stroke="#9ca3af" />
                                    <YAxis dataKey="nombre" type="category" stroke="#9ca3af" width={120} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1f2937",
                                            border: "1px solid #374151",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Bar dataKey="actividades" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
