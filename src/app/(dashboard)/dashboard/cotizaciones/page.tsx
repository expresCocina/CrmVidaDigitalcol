"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus, Search, Filter, FileText, Eye, Send, Check, X, Clock, AlertCircle
} from "lucide-react";

interface Cotizacion {
    id: string;
    numero: string;
    lead_id?: string;
    cliente_id?: string;
    estado: string;
    subtotal: number;
    descuento: number;
    total: number;
    valida_hasta?: string;
    created_at: string;
    enviada_at?: string;
    lead?: {
        nombre: string;
        email?: string;
        telefono?: string;
    };
    cliente?: {
        nombre: string;
        email?: string;
        telefono?: string;
    };
}

export default function CotizacionesPage() {
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todas");
    const supabase = createClient();

    useEffect(() => {
        fetchCotizaciones();
    }, []);

    const fetchCotizaciones = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("cotizaciones")
            .select(`
                *,
                lead:lead_id(nombre, email, telefono),
                cliente:cliente_id(nombre, email, telefono)
            `)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setCotizaciones(data);
        }
        setLoading(false);
    };

    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case "borrador":
                return {
                    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
                    icon: Clock
                };
            case "enviada":
                return {
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    icon: Send
                };
            case "aceptada":
                return {
                    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    icon: Check
                };
            case "rechazada":
                return {
                    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    icon: X
                };
            case "vencida":
                return {
                    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                    icon: AlertCircle
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
                    icon: FileText
                };
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const filteredCotizaciones = cotizaciones.filter(cot => {
        const matchesSearch =
            cot.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cot.lead?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cot.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === "todas" || cot.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    const stats = {
        total: cotizaciones.length,
        borradores: cotizaciones.filter(c => c.estado === 'borrador').length,
        enviadas: cotizaciones.filter(c => c.estado === 'enviada').length,
        aceptadas: cotizaciones.filter(c => c.estado === 'aceptada').length,
        totalMonto: cotizaciones
            .filter(c => c.estado === 'aceptada')
            .reduce((sum, c) => sum + c.total, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cotizaciones</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona cotizaciones para leads y clientes
                    </p>
                </div>
                <Link
                    href="/dashboard/cotizaciones/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cotización
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enviadas</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.enviadas}</p>
                        </div>
                        <Send className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aceptadas</p>
                            <p className="text-2xl font-bold text-green-600">{stats.aceptadas}</p>
                        </div>
                        <Check className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
                            <p className="text-lg font-bold text-green-600">{formatPrice(stats.totalMonto)}</p>
                        </div>
                        <div className="text-green-400 text-2xl">$</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por número o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="todas">Todas</option>
                            <option value="borrador">Borradores</option>
                            <option value="enviada">Enviadas</option>
                            <option value="aceptada">Aceptadas</option>
                            <option value="rechazada">Rechazadas</option>
                            <option value="vencida">Vencidas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando cotizaciones...</div>
                ) : filteredCotizaciones.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm || filterEstado !== "todas"
                                ? "No se encontraron cotizaciones"
                                : "No hay cotizaciones creadas"}
                        </p>
                        {!searchTerm && filterEstado === "todas" && (
                            <Link
                                href="/dashboard/cotizaciones/new"
                                className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Primera Cotización
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Número
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Cliente/Lead
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredCotizaciones.map((cot) => {
                                    const estadoConfig = getEstadoConfig(cot.estado);
                                    const Icon = estadoConfig.icon;
                                    const nombreCliente = cot.cliente?.nombre || cot.lead?.nombre || 'Sin asignar';

                                    return (
                                        <tr key={cot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {cot.numero}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {nombreCliente}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {cot.cliente ? 'Cliente' : 'Lead'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                                                    <Icon className="w-3 h-3 mr-1" />
                                                    {cot.estado.charAt(0).toUpperCase() + cot.estado.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(cot.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(cot.created_at).toLocaleDateString('es-CO', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/dashboard/cotizaciones/${cot.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
