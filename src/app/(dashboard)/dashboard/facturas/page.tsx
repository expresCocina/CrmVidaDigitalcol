"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus, Search, Filter, DollarSign, FileText, AlertCircle, CheckCircle, Clock, XCircle
} from "lucide-react";

interface Factura {
    id: string;
    numero: string;
    cliente_id: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    subtotal: number;
    total: number;
    pagado: number;
    saldo: number;
    estado: string;
    cliente?: {
        nombre: string;
        email?: string;
    };
}

export default function FacturasPage() {
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("todas");
    const supabase = createClient();

    useEffect(() => {
        fetchFacturas();
    }, []);

    const fetchFacturas = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("facturas")
            .select(`
                *,
                cliente:clientes(nombre, email)
            `)
            .order("created_at", { ascending: false });

        if (data) {
            setFacturas(data);
        }
        setLoading(false);
    };

    const getEstadoConfig = (estado: string) => {
        switch (estado) {
            case "pendiente":
                return {
                    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    icon: Clock
                };
            case "parcial":
                return {
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    icon: AlertCircle
                };
            case "pagada":
                return {
                    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    icon: CheckCircle
                };
            case "vencida":
                return {
                    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    icon: XCircle
                };
            case "cancelada":
                return {
                    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
                    icon: XCircle
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

    const filteredFacturas = facturas.filter(fac => {
        const matchesSearch =
            fac.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fac.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === "todas" || fac.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    const stats = {
        total: facturas.length,
        pendientes: facturas.filter(f => f.estado === 'pendiente' || f.estado === 'parcial').length,
        vencidas: facturas.filter(f => f.estado === 'vencida').length,
        porCobrar: facturas
            .filter(f => f.estado !== 'pagada' && f.estado !== 'cancelada')
            .reduce((sum, f) => sum + f.saldo, 0),
        cobradoMes: facturas
            .filter(f => {
                const fecha = new Date(f.fecha_emision);
                const hoy = new Date();
                return f.estado === 'pagada' &&
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear();
            })
            .reduce((sum, f) => sum + f.total, 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Facturas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona facturas y pagos de clientes
                    </p>
                </div>
                <Link
                    href="/dashboard/facturas/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Factura
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Facturas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendientes}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vencidas</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.vencidas}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Por Cobrar</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(stats.porCobrar)}
                            </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por número o cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="todas">Todas</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="parcial">Parciales</option>
                            <option value="pagada">Pagadas</option>
                            <option value="vencida">Vencidas</option>
                            <option value="cancelada">Canceladas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Cargando facturas...</p>
                        </div>
                    </div>
                ) : filteredFacturas.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No hay facturas creadas</p>
                        <Link
                            href="/dashboard/facturas/new"
                            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Crear Primera Factura
                        </Link>
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
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Saldo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Vencimiento
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredFacturas.map((fac) => {
                                    const estadoConfig = getEstadoConfig(fac.estado);
                                    const Icon = estadoConfig.icon;

                                    return (
                                        <tr key={fac.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {fac.numero}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {fac.cliente?.nombre}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                                                    <Icon className="w-3 h-3 mr-1" />
                                                    {fac.estado.charAt(0).toUpperCase() + fac.estado.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(fac.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(fac.saldo)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(fac.fecha_vencimiento).toLocaleDateString('es-CO', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/dashboard/facturas/${fac.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Ver detalles
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
