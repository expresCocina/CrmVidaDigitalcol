"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronRight, User, Mail, Phone, Building2, MapPin, Calendar,
    Package, FileText, Activity, Edit2
} from "lucide-react";
import ServiciosCliente from "@/components/clientes/ServiciosCliente";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchClient = async () => {
            const { data, error } = await supabase
                .from("clientes")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching client:", error);
                router.push("/dashboard/clientes");
            } else {
                setClient(data);
            }
            setLoading(false);
        };

        if (id) {
            fetchClient();
        }
    }, [id, router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando información del cliente...</div>;
    }

    if (!client) {
        return <div className="p-8 text-center text-red-500">Cliente no encontrado</div>;
    }

    const tabs = [
        { id: 'info', label: 'Información', icon: User },
        { id: 'servicios', label: 'Servicios', icon: Package },
        { id: 'actividad', label: 'Actividad', icon: Activity }
    ];

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "activo": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "inactivo": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
            case "suspendido": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard/clientes" className="hover:text-blue-600">Clientes</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900 dark:text-white">{client.nombre}</span>
            </nav>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                            {client.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {client.nombre}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(client.estado || 'activo')}`}>
                                    {client.estado || 'activo'}
                                </span>
                                {client.tipo_cliente && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                        {client.tipo_cliente}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/dashboard/clientes/${id}/edit`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                    </Link>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {client.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 mr-2" />
                            {client.email}
                        </div>
                    )}
                    {client.telefono && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4 mr-2" />
                            {client.telefono}
                        </div>
                    )}
                    {client.empresa && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Building2 className="w-4 h-4 mr-2" />
                            {client.empresa}
                        </div>
                    )}
                    {client.ciudad && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4 mr-2" />
                            {client.ciudad}
                        </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Cliente desde {new Date(client.created_at).toLocaleDateString('es-CO')}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Información del Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Nombre Completo
                                </label>
                                <p className="text-gray-900 dark:text-white">{client.nombre}</p>
                            </div>
                            {client.email && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{client.email}</p>
                                </div>
                            )}
                            {client.telefono && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Teléfono
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{client.telefono}</p>
                                </div>
                            )}
                            {client.empresa && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Empresa
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{client.empresa}</p>
                                </div>
                            )}
                            {client.ciudad && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Ciudad
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{client.ciudad}</p>
                                </div>
                            )}
                            {client.direccion && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        Dirección
                                    </label>
                                    <p className="text-gray-900 dark:text-white">{client.direccion}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Tipo de Cliente
                                </label>
                                <p className="text-gray-900 dark:text-white capitalize">{client.tipo_cliente || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Estado
                                </label>
                                <p className="text-gray-900 dark:text-white capitalize">{client.estado || 'activo'}</p>
                            </div>
                        </div>
                        {client.notas && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Notas
                                </label>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{client.notas}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'servicios' && (
                    <ServiciosCliente clienteId={id} />
                )}

                {activeTab === 'actividad' && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Historial de actividad próximamente</p>
                    </div>
                )}
            </div>
        </div>
    );
}
