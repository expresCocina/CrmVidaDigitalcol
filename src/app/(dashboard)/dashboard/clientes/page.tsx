"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Phone,
    Mail,
    MapPin,
    Building2,
    User,
    Users
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cliente {
    id: string;
    nombre: string;
    email?: string | null;
    telefono?: string | null;
    empresa?: string | null;
    tipo_cliente?: string | null;
    estado?: string;
    ciudad?: string | null;
    created_at: string;
}

export default function ClientsPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("clientes")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setClientes(data);
        }
        setLoading(false);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "activo": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "inactivo": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
            case "suspendido": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona tu base de clientes y empresas
                    </p>
                </div>
                <Link
                    href="/dashboard/clientes/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Cliente
                </Link>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        placeholder="Buscar por nombre, email o ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </button>
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando clientes...</div>
                ) : filteredClientes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredClientes.map((cliente) => (
                                    <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                                                    {cliente.tipo_cliente === 'empresa' ? (
                                                        <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {cliente.nombre}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                                        {cliente.tipo_cliente || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                {cliente.email && (
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        {cliente.email}
                                                    </div>
                                                )}
                                                {cliente.telefono && (
                                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {cliente.telefono}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {cliente.ciudad && (
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2" />
                                                    {cliente.ciudad}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(cliente.estado || 'activo')}`}>
                                                {(cliente.estado || 'activo').charAt(0).toUpperCase() + (cliente.estado || 'activo').slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/dashboard/clientes/${cliente.id}`}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Ver Perfil
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay clientes</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Comienza agregando tu primer cliente.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/dashboard/clientes/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" />
                                Nuevo Cliente
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
