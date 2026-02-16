"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Phone, User, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

type Mensaje = any;
type Conversacion = any;

export default function ConversacionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [id, setId] = useState<string>("");

    const [conversacion, setConversacion] = useState<Conversacion | null>(null);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [nuevoMensaje, setNuevoMensaje] = useState("");

    useEffect(() => {
        params.then(p => setId(p.id));
    }, []);

    useEffect(() => {
        if (id) {
            fetchConversacion();
            fetchMensajes();

            // Suscripción en tiempo real a nuevos mensajes
            const channel = supabase
                .channel(`mensajes-${id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'mensajes',
                        filter: `conversacion_id=eq.${id}`
                    },
                    (payload) => {
                        console.log('Nuevo mensaje recibido:', payload);
                        if (payload.eventType === 'INSERT') {
                            setMensajes(prev => [...prev, payload.new as any]);
                        } else if (payload.eventType === 'UPDATE') {
                            setMensajes(prev => prev.map(m =>
                                m.id === payload.new.id ? payload.new as any : m
                            ));
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    const fetchConversacion = async () => {
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
            setConversacion(data as any);
        }
    };

    const fetchMensajes = async () => {
        setLoading(true);
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
        if (!nuevoMensaje.trim() || !conversacion || sending) return;

        setSending(true);
        try {
            // Llamar a la Edge Function para enviar el mensaje
            const { data, error } = await supabase.functions.invoke("whatsapp-outbound", {
                body: {
                    to: conversacion.identificador_externo,
                    message: nuevoMensaje,
                    conversacion_id: conversacion.id,
                    plantilla_id: null // Opcional, por ahora texto libre
                }
            });

            if (error) {
                console.error("Supabase Function Error:", error);
                throw new Error("Error invocando la función");
            }

            console.log("Mensaje enviado:", data);
            setNuevoMensaje("");

            // Recargar mensajes para ver el nuevo
            // TODO: Implementar suscripción real-time para mejor UX
            await fetchMensajes();

        } catch (error: any) {
            console.error("Error al enviar mensaje:", error);
            alert("Error al enviar el mensaje. Verifica la consola para más detalles.");
        } finally {
            setSending(false);
        }
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
                                        <span>{mensaje.created_at ? format(new Date(mensaje.created_at), "HH:mm", { locale: es }) : "--:--"}</span>
                                        {mensaje.direccion === "saliente" && (
                                            <>
                                                {mensaje.leido ? (
                                                    <CheckCheck className="w-4 h-4 text-cyan-300" />
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
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || sending}
                    />
                    <button
                        type="submit"
                        disabled={!nuevoMensaje.trim() || loading || sending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
