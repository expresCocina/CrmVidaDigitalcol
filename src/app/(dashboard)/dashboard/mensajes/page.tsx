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
    identificador_externo: string | null;
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

        // Función para reproducir sonido
        const playNotificationSound = () => {
            try {
                const audio = new Audio('/sounds/notification.mp3'); // Fallback URL
                // Oscilador simple como backup inmediato
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } catch (e) { console.error("Error playing sound", e); }
        };

        // Suscripción a nuevos mensajes para actualizar lista
        const channel = supabase
            .channel('global-mensajes-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes'
                },
                (payload) => {
                    console.log('Nuevo mensaje global detectado:', payload);
                    const nuevoMensaje = payload.new as any;

                    setConversaciones(prev => {
                        const nuevaLista = [...prev];
                        const index = nuevaLista.findIndex(c => c.id === nuevoMensaje.conversacion_id);

                        // Si existe la conversación, moverla al inicio y actualizar
                        if (index !== -1) {
                            const conversacion = { ...nuevaLista[index] };
                            conversacion.ultimo_mensaje_at = nuevoMensaje.created_at;
                            conversacion.metadata = {
                                ...conversacion.metadata,
                                ultimo_mensaje_contenido: nuevoMensaje.tipo === 'imagen' || nuevoMensaje.tipo === 'image' ? '📷 Imagen' :
                                    nuevoMensaje.tipo === 'audio' || nuevoMensaje.tipo === 'voice' ? '🎤 Nota de voz' :
                                        nuevoMensaje.contenido
                            };

                            // Incrementar contador si es mensaje entrante
                            if (nuevoMensaje.direccion === 'entrante') {
                                conversacion.metadata = {
                                    ...conversacion.metadata,
                                    mensajes_no_leidos: (conversacion.metadata?.mensajes_no_leidos || 0) + 1
                                };
                                playNotificationSound();
                            }

                            // Quitar de la posición actual y poner al inicio
                            nuevaLista.splice(index, 1);
                            nuevaLista.unshift(conversacion);
                            return nuevaLista;
                        } else {
                            // Si no existe (nueva conv), recargar todo
                            fetchConversaciones();
                            return prev;
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchConversaciones = async () => {
        setLoading(true);
        // Traemos conversaciones y luego haremos un fetch secundario para último mensaje si es necesario
        // Por ahora optimizamos usando lo que tenemos
        const { data, error } = await supabase
            .from("conversaciones")
            .select(`
                *,
                leads (nombre),
                clientes (nombre)
            `)
            .order("ultimo_mensaje_at", { ascending: false });

        if (!error && data) {
            // Nota: En un entorno real, idealmente tendríamos una vista o función RPC 
            // que nos devuelva el último mensaje y conteo. 
            // Por simplicidad y rapidez, asumiremos que 'ultimo_mensaje_at' ordena,
            // y para el contenido del último mensaje, haremos un fetch rápido de los últimos mensajes.

            const conversacionesConDetalles = await Promise.all(data.map(async (conv: any) => {
                // Obtener último mensaje real para preview
                const { data: lastMsg } = await supabase
                    .from("mensajes")
                    .select("contenido, tipo, created_at, direccion, leido")
                    .eq("conversacion_id", conv.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single();

                // Obtener conteo de no leídos
                const { count } = await supabase
                    .from("mensajes")
                    .select("id", { count: 'exact', head: true })
                    .eq("conversacion_id", conv.id)
                    .eq("direccion", "entrante")
                    .eq("leido", false);

                return {
                    ...conv,
                    metadata: {
                        ...conv.metadata,
                        ultimo_mensaje_contenido: lastMsg ? (
                            (lastMsg.tipo === 'imagen' || lastMsg.tipo === 'image') ? '📷 Imagen' :
                                (lastMsg.tipo === 'audio' || lastMsg.tipo === 'voice') ? '🎤 Nota de voz' :
                                    lastMsg.contenido
                        ) : '',
                        mensajes_no_leidos: count || 0
                    }
                };
            }));

            setConversaciones(conversacionesConDetalles);
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

    const [filterUnread, setFilterUnread] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const filteredConversaciones = conversaciones.filter(conv => {
        // 1. Filtro de búsqueda (Buscamos en nombre o identificador)
        const contactName = getContactName(conv).toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = contactName.includes(search) ||
            conv.identificador_externo?.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        // 2. Filtro de Archivados (Por defecto ocultamos archivadas a menos que se active el toggle)
        const isArchived = conv.estado === 'archivada' || conv.estado === 'cerrada';
        if (isArchived && !showArchived) return false;
        if (!isArchived && showArchived) return false; // Si queremos ver SOLO archivados o AMBOS?
        // Nota: El usuario suele querer ver "Archivados" como una lista separada o toggle.
        // Vamos a hacer que si showArchived es true, SOLO muestre archivados.

        // 3. Filtro de No Leídos
        if (filterUnread && (conv.metadata?.mensajes_no_leidos || 0) <= 0) return false;

        // 4. Filtro por Tag (asumiendo que los tags están en metadata.tags como array)
        if (activeTag && !conv.metadata?.tags?.includes(activeTag)) return false;

        return true;
    });
    const getAvatarColor = (name: string) => {
        const colors = [
            "bg-blue-100 text-blue-600",
            "bg-purple-100 text-purple-600",
            "bg-pink-100 text-pink-600",
            "bg-indigo-100 text-indigo-600",
            "bg-green-100 text-green-600",
            "bg-orange-100 text-orange-600",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="h-[calc(100vh-8rem)]">
            <div className="flex h-full gap-6">
                {/* Lista de Conversaciones */}
                <div className="w-96 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Chat Center</h2>
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                                <MessageSquare className="w-5 h-5 text-black" />
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-all shadow-sm"
                                placeholder="Buscar en chats y mensajes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filtros */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFilterUnread(!filterUnread)}
                                className={`flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${filterUnread ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                            >
                                No leídos
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => {
                                        // Simple toggle for now, could be a dropdown later
                                        if (activeTag) setActiveTag(null);
                                        else {
                                            const allTags = Array.from(new Set(conversaciones.flatMap(c => c.metadata?.tags || [])));
                                            if (allTags.length > 0) setActiveTag(allTags[0] as string);
                                        }
                                    }}
                                    className={`flex items-center px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${activeTag ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    {activeTag ? `#${activeTag}` : "Filtrar por tag"}
                                </button>
                            </div>
                        </div>

                        <div
                            onClick={() => setShowArchived(!showArchived)}
                            className="flex items-center text-xs font-medium text-gray-400 pt-2 pb-1 border-b border-gray-50 dark:border-white/5 cursor-pointer hover:text-white transition-colors"
                        >
                            <MessageSquare className={`w-3 h-3 mr-2 ${showArchived ? 'text-yellow-400' : ''}`} />
                            {showArchived ? "Cerrar archivados" : "Mostrar archivados"}
                            <span className="ml-auto text-gray-300">
                                {conversaciones.filter(c => c.estado === 'archivada' || c.estado === 'cerrada').length}
                            </span>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-2 text-sm text-gray-500">Cargando conversaciones...</p>
                            </div>
                        ) : filteredConversaciones.length > 0 ? (
                            <div className="px-3 pb-4 space-y-1">
                                {filteredConversaciones.map((conv) => {
                                    const contactName = getContactName(conv);
                                    const initials = getInitials(contactName);
                                    const avatarColor = getAvatarColor(contactName);
                                    const isSelected = selectedConversacion === conv.id;

                                    return (
                                        <Link
                                            key={conv.id}
                                            href={`/dashboard/mensajes/${conv.id}`}
                                            className={`group relative flex items-center p-3 rounded-2xl transition-all duration-200 ${isSelected
                                                ? "bg-yellow-400 shadow-lg shadow-yellow-400/10"
                                                : "hover:bg-gray-50 dark:hover:bg-white/5"
                                                }`}
                                            onClick={() => {
                                                setSelectedConversacion(conv.id);
                                                setConversaciones(prev => prev.map(c =>
                                                    c.id === conv.id ? { ...c, metadata: { ...c.metadata, mensajes_no_leidos: 0 } } : c
                                                ));
                                                // Notificar al layout global que refresque el contador
                                                window.dispatchEvent(new Event('messages-read'));
                                            }}
                                        >
                                            <div className="flex-shrink-0 relative mr-4">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${isSelected ? "bg-white text-black" : avatarColor}`}>
                                                    {initials}
                                                </div>
                                                {conv.canal === "whatsapp" && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-md p-0.5">
                                                        <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center">
                                                            <Phone className="w-3 h-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Badge de No Leídos - Lyon Style */}
                                                {(conv.metadata?.mensajes_no_leidos > 0) && (
                                                    <div className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 z-10 animate-pulse">
                                                        {conv.metadata.mensajes_no_leidos}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h3 className={`text-sm font-bold truncate ${isSelected ? "text-black" : "text-gray-900 dark:text-white"}`}>
                                                        {contactName}
                                                    </h3>
                                                    {conv.ultimo_mensaje_at && (
                                                        <span className={`text-[10px] font-medium ${isSelected ? "text-black/60" : "text-gray-400"}`}>
                                                            {format(new Date(conv.ultimo_mensaje_at), "HH:mm", { locale: es })}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className={`text-xs truncate h-4 ${isSelected ? "text-black/70" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {conv.metadata?.ultimo_mensaje_contenido || conv.identificador_externo}
                                                    </p>
                                                </div>

                                                {!isSelected && (
                                                    <div className="mt-2">
                                                        <span className={`px-2 py-0.5 inline-flex text-[9px] uppercase tracking-wider font-bold rounded-lg ${getEstadoColor(conv.estado)}`}>
                                                            {conv.estado}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-900 dark:text-white">
                                <MessageSquare className="mx-auto h-12 w-12 text-gray-200 dark:text-white/10" />
                                <h3 className="mt-4 text-sm font-bold text-gray-900 dark:text-white">No hay chats</h3>
                                <p className="mt-1 text-xs text-gray-400">
                                    Inicia una conversación para verla aquí.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Área de Mensajes - Placeholder elegante */}
                <div className="flex-1 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-center p-12">
                    <div className="text-center max-w-sm space-y-6">
                        <div className="w-24 h-24 rounded-3xl bg-white dark:bg-white/5 shadow-xl border border-gray-100 dark:border-white/5 flex items-center justify-center mx-auto transition-transform hover:scale-110 cursor-default group">
                            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-white/20 group-hover:text-yellow-400 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Selecciona una conversación</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Elige una conversación de la lista de la izquierda para ver el historial completo y responder.
                            </p>
                        </div>
                        <button className="px-6 py-2.5 bg-yellow-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-yellow-400/20 hover:bg-yellow-500 transition-all active:scale-95">
                            Nueva conversación
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}
