"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Phone, User, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface Mensaje {
    id: string;
    contenido: string;
    tipo: string | null;
    direccion: string;
    leido: boolean | null;
    entregado: boolean | null;
    created_at: string | null;
    enviado_por?: string | null;
}

interface Conversacion {
    id: string;
    canal: string;
    identificador_externo: string | null;
    estado: string | null;
    lead_id?: string | null;
    cliente_id?: string | null;
    leads?: { nombre: string } | null;
    clientes?: { nombre: string } | null;
}

export default function ConversacionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [id, setId] = useState<string>("");

    const [conversacion, setConversacion] = useState<Conversacion | null>(null);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [nuevoMensaje, setNuevoMensaje] = useState("");

    useEffect(() => {
        params.then(p => setId(p.id));
    }, []);

    useEffect(() => {
        if (id) {
            fetchConversacion();
            fetchMensajes();
        }
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const fetchConversacion = async () => {
        // @ts-ignore - Las tablas 'conversaciones', 'clientes' existen en la BD pero faltan en los tipos
        const { data, error } = await supabase
            .from("conversaciones")
            .select(`
                *,
                leads (nombre),
                clientes (nombre)
            `)
            .eq("id", id)
            .single();

        if (!error && data) {
            setConversacion(data);
        }
    };

    const fetchMensajes = async () => {
        setLoading(true);
        // @ts-ignore - La tabla 'mensajes' existe en la BD pero falta en los tipos
        const { data, error } = await supabase
            .from("mensajes")
            .select("*")
            .eq("conversacion_id", id)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setMensajes(data);
        }
        setLoading(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getContactName = () => {
        if (!conversacion) return "Cargando...";
        if (conversacion.leads?.nombre) return conversacion.leads.nombre;
        if (conversacion.clientes?.nombre) return conversacion.clientes.nombre;
        return conversacion.identificador_externo || "Desconocido";
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoMensaje.trim()) return;

        // Nota: Esto requiere integración con WhatsApp API
        // Por ahora solo mostramos el mensaje localmente
        console.log("Enviar mensaje:", nuevoMensaje);
        setNuevoMensaje("");
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/mensajes"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            {conversacion?.canal === "whatsapp" ? (
                                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {getContactName()}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversacion?.identificador_externo}
                        </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {conversacion?.canal}
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/20">
                {loading ? (
                    <div className="text-center text-gray-500 py-8">Cargando mensajes...</div>
                ) : mensajes.length > 0 ? (
                    <>
                        {mensajes.map((mensaje) => (
                            <div
                                key={mensaje.id}
                                className={`flex ${mensaje.direccion === "saliente" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-md px-4 py-2 rounded-lg ${mensaje.direccion === "saliente"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{mensaje.contenido}</p>
                                    <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${mensaje.direccion === "saliente" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                        }`}>
                                        <span>{format(new Date(mensaje.created_at || new Date().toISOString()), "HH:mm", { locale: es })}</span>
                                        {mensaje.direccion === "saliente" && (
                                            <>
                                                {mensaje.leido ? (
                                                    <CheckCheck className="w-4 h-4 text-blue-200" />
                                                ) : mensaje.entregado ? (
                                                    <CheckCheck className="w-4 h-4" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No hay mensajes en esta conversación
                    </div>
                )}
            </div>

            {/* Input de Mensaje */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe un mensaje... (requiere integración WhatsApp)"
                        disabled
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    El envío de mensajes requiere configuración de WhatsApp Business API
                </p>
            </div>
        </div>
    );
}
