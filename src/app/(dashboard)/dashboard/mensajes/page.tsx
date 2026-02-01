"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Search, MessageSquare, Phone, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Conversacion {
    id: string;
    canal: string;
    identificador_externo: string;
    estado: string;
    ultimo_mensaje_at: string;
    metadata: any;
    lead_id?: string;
    cliente_id?: string;
    leads?: { nombre: string };
    clientes?: { nombre: string };
}

export default function MensajesPage() {
    const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConversacion, setSelectedConversacion] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchConversaciones();
    }, []);

    const fetchConversaciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("conversaciones")
            .select(`
                *,
                leads (nombre),
                clientes (nombre)
            `)
            .order("ultimo_mensaje_at", { ascending: false });

        if (!error && data) {
            setConversaciones(data);
        }
        setLoading(false);
    };

    const getContactName = (conv: Conversacion) => {
        if (conv.leads?.nombre) return conv.leads.nombre;
        if (conv.clientes?.nombre) return conv.clientes.nombre;
        return conv.identificador_externo || "Desconocido";
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "abierta": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "cerrada": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
            case "en_espera": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const filteredConversaciones = conversaciones.filter(conv => {
        const contactName = getContactName(conv);
        return contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.identificador_externo?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="flex h-full gap-6">
                {/* Lista de Conversaciones */}
                <div className="w-96 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mensajes</h2>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Buscar conversación..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando conversaciones...</div>
                        ) : filteredConversaciones.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredConversaciones.map((conv) => (
                                    <Link
                                        key={conv.id}
                                        href={`/dashboard/mensajes/${conv.id}`}
                                        className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedConversacion === conv.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                            }`}
                                        onClick={() => setSelectedConversacion(conv.id)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    {conv.canal === "whatsapp" ? (
                                                        <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {getContactName(conv)}
                                                    </p>
                                                    {conv.ultimo_mensaje_at && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {format(new Date(conv.ultimo_mensaje_at), "d MMM", { locale: es })}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {conv.identificador_externo}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(conv.estado)}`}>
                                                        {conv.estado}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {conv.canal}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay conversaciones</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Las conversaciones de WhatsApp aparecerán aquí.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Área de Mensajes */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <MessageSquare className="mx-auto h-16 w-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Selecciona una conversación</p>
                        <p className="text-sm mt-2">Elige una conversación de la lista para ver los mensajes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
