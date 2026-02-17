"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Phone, User, Check, CheckCheck, Wifi, WifiOff, MessageSquare, Image, Mic, Paperclip, X, Sparkles } from "lucide-react";
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
    const [realtimeStatus, setRealtimeStatus] = useState<'conectado' | 'desconectado' | 'error'>('desconectado');

    useEffect(() => {
        params.then(p => setId(p.id));
    }, []);

    // Marcar mensajes como leídos
    useEffect(() => {
        const markAsRead = async () => {
            if (mensajes.length === 0) return;

            // Filtrar solo los mensajes entrantes no leídos
            const unreadMessages = mensajes.filter(m =>
                m.direccion === 'entrante' && !m.leido
            );

            if (unreadMessages.length > 0) {
                console.log(`Marcando ${unreadMessages.length} mensajes como leídos...`);

                // Actualizar en DB
                const { error } = await supabase
                    .from('mensajes')
                    .update({ leido: true })
                    .eq('conversacion_id', id)
                    .eq('direccion', 'entrante')
                    .eq('leido', false);

                if (!error) {
                    // Actualizar estado local para reflejar cambio inmediato
                    setMensajes(prev => prev.map(m =>
                        (m.direccion === 'entrante' && !m.leido) ? { ...m, leido: true } : m
                    ));

                    // Disparar evento para actualizar contador global (hack simple)
                    // En una app más compleja usaríamos Context o Redux
                    window.dispatchEvent(new Event('messages-read'));
                } else {
                    console.error("Error al marcar como leído:", error);
                }
            }
        };

        if (id && mensajes.length > 0) {
            markAsRead();
        }
    }, [id, mensajes.length]); // Dependencia en length para no ejecutar en cada re-render innecesario

    useEffect(() => {
        if (id) {
            fetchConversacion();
            fetchMensajes();

            const playNotificationSound = () => {
                try {
                    const audio = new Audio('/sounds/notification.mp3');
                    audio.play().catch(e => {
                        console.warn("Autoplay blocked, using fallback beep.", e);
                        // Fallback beep logic
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.frequency.setValueAtTime(800, ctx.currentTime);
                        gain.gain.setValueAtTime(0.1, ctx.currentTime);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.1);
                    });
                } catch (e) {
                    console.error("Error playing sound:", e);
                }
            };

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
                        console.log('🔔 REALTIME MSG:', payload);
                        if (payload.eventType === 'INSERT') {
                            setMensajes((prev) => [...prev, payload.new as any]);
                            if ((payload.new as any).direccion === 'entrante') {
                                playNotificationSound();
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            setMensajes((prev) => prev.map((m) =>
                                m.id === payload.new.id ? { ...m, ...payload.new } : m
                            ));
                        }
                    }
                )
                .subscribe((status) => {
                    console.log(`🔌 ESTADO REALTIME: ${status}`);
                    if (status === 'SUBSCRIBED') {
                        setRealtimeStatus('conectado');
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        setRealtimeStatus('desconectado');
                        // Intento de reconexión manual después de 5s si falla
                        setTimeout(() => channel.subscribe(), 5000);
                    }
                });

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

    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ file: File, type: 'image' | 'audio', preview: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    // Estados para tags y ventas
    const [tags, setTags] = useState<string[]>([]);
    const [showSalesTools, setShowSalesTools] = useState(false);
    const [activeSalesTab, setActiveSalesTab] = useState<'planes' | 'servicios'>('planes');
    const [planes, setPlanes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);

    const fetchSalesItems = async () => {
        const { data: p } = await supabase.from('planes').select('*').eq('activo', true);
        const { data: s } = await supabase.from('servicios').select('*').eq('activo', true);
        if (p) setPlanes(p);
        if (s) setServicios(s);
    };

    const syncTagsWithLead = async (newTags: string[]) => {
        if (!conversacion) return;

        // Actualizar Conversación
        const updatedMetadata = { ...(conversacion.metadata || {}), tags: newTags };
        await supabase
            .from('conversaciones')
            .update({ metadata: updatedMetadata })
            .eq('id', id);

        // Actualizar Lead si existe
        if (conversacion.lead_id) {
            const { data: lead } = await supabase.from('leads').select('metadata').eq('id', conversacion.lead_id).single();
            const updatedLeadMetadata = { ...(lead?.metadata || {}), tags: newTags };
            await supabase
                .from('leads')
                .update({ metadata: updatedLeadMetadata })
                .eq('id', conversacion.lead_id);
        }

        setTags(newTags);
        // Actualizar objeto local para evitar desincronización
        setConversacion({ ...conversacion, metadata: updatedMetadata });
    };

    useEffect(() => {
        if (conversacion?.metadata?.tags) {
            setTags(conversacion.metadata.tags);
        }
        fetchSalesItems();
    }, [conversacion?.id]);

    // Estados para grabación de audio
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
                ? 'audio/ogg; codecs=opus'
                : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const isOgg = mimeType.includes('ogg');
                const audioBlob = new Blob(chunks, { type: mimeType });
                const fileName = `voice_note_${Date.now()}.${isOgg ? 'ogg' : 'webm'}`;
                const file = new File([audioBlob], fileName, { type: mimeType });
                const preview = URL.createObjectURL(audioBlob);
                setSelectedMedia({ file, type: 'audio', preview });

                stream.getTracks().forEach(track => track.stop());
            };

            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);

            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic error:", err);
            alert("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            setSelectedMedia(null);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tamaño (máximo 16MB para WhatsApp)
        if (file.size > 16 * 1024 * 1024) {
            alert("El archivo es demasiado grande (máximo 16MB)");
            return;
        }

        const preview = type === 'image' ? URL.createObjectURL(file) : '';
        setSelectedMedia({ file, type, preview });
    };

    const uploadToSupabase = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('mensajes')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('mensajes')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!nuevoMensaje.trim() && !selectedMedia) || !conversacion || sending) return;

        setSending(true);
        try {
            let mediaUrl = null;
            let type = "texto";

            if (selectedMedia) {
                setUploading(true);
                mediaUrl = await uploadToSupabase(selectedMedia.file, selectedMedia.type === 'image' ? 'images' : 'audios');
                type = selectedMedia.type;
                setUploading(false);
            }

            // Llamar a la Edge Function para enviar el mensaje
            const { data, error } = await supabase.functions.invoke("whatsapp-outbound", {
                body: {
                    to: conversacion.identificador_externo,
                    message: nuevoMensaje,
                    media_url: mediaUrl,
                    type: type,
                    conversacion_id: conversacion.id,
                    plantilla_id: null
                }
            });

            if (error) {
                console.error("Supabase Function Error:", error);
                throw new Error("Error invocando la función");
            }

            console.log("Mensaje enviado:", data);
            setNuevoMensaje("");
            setSelectedMedia(null);

            // Recargar mensajes
            await fetchMensajes();

        } catch (error: any) {
            console.error("Error al enviar mensaje:", error);
            alert("Error al enviar el mensaje. Verifica la consola.");
        } finally {
            setSending(false);
            setUploading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard/mensajes"
                            className="p-2 -ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black border-2 border-white dark:border-gray-900 shadow-sm">
                                {getContactName().charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${realtimeStatus === 'conectado' ? 'bg-green-500' : 'bg-red-500'} ${realtimeStatus === 'conectado' ? 'animate-pulse' : ''}`} title={realtimeStatus === 'conectado' ? 'En línea (Realtime)' : 'Desconectado'} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                {getContactName()}
                            </h2>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-400">
                                    {conversacion?.identificador_externo}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/10" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80">
                                    {conversacion?.canal}
                                    {realtimeStatus !== 'conectado' && (
                                        <span className="ml-2 text-red-500 lowercase tracking-normal font-medium"> (reconectando...)</span>
                                    )}
                                </span>
                            </div>

                            {/* Tags Area */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-400/10 text-yellow-500 border border-yellow-500/20"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => syncTagsWithLead(tags.filter(t => t !== tag))}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                                <button
                                    onClick={() => {
                                        const newTag = prompt("Nueva etiqueta:");
                                        if (newTag && !tags.includes(newTag)) {
                                            syncTagsWithLead([...tags, newTag]);
                                        }
                                    }}
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500 border border-transparent hover:border-yellow-400/50 transition-all"
                                >
                                    + tag
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfcfc] dark:bg-[#0d0d0d] custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-400">Cargando conversación...</p>
                    </div>
                ) : mensajes.length > 0 ? (
                    <>
                        {mensajes.map((mensaje) => {
                            const isIncoming = mensaje.direccion === "entrante";
                            return (
                                <div
                                    key={mensaje.id}
                                    className={`flex ${!isIncoming ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] group relative ${!isIncoming
                                            ? "bg-yellow-400 text-black rounded-2xl rounded-tr-none px-4 py-3 shadow-md border border-yellow-300"
                                            : "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100 dark:border-white/5"
                                            }`}
                                    >
                                        {/* Renderizar según tipo de mensaje */}
                                        {mensaje.tipo === 'imagen' || mensaje.tipo === 'image' ? (
                                            <div className="overflow-hidden rounded-xl mb-1">
                                                <img
                                                    src={mensaje.contenido}
                                                    alt="Imagen enviada"
                                                    className="max-w-xs rounded-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                                                    onClick={() => window.open(mensaje.contenido, '_blank')}
                                                />
                                            </div>
                                        ) : mensaje.tipo === 'audio' || mensaje.tipo === 'voice' ? (
                                            <div className="py-1">
                                                <audio controls className={`w-full max-w-xs h-8 ${!isIncoming ? 'brightness-90 contrast-125' : 'dark:invert dark:opacity-75'}`}>
                                                    <source src={mensaje.contenido} type="audio/ogg" />
                                                    <source src={mensaje.contenido} type="audio/mpeg" />
                                                </audio>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">{mensaje.contenido}</p>
                                        )}

                                        <div className={`flex items-center justify-end space-x-1.5 mt-1.5 opacity-60 text-[10px] font-bold tracking-tighter uppercase ${!isIncoming ? "text-black" : "text-gray-400"
                                            }`}>
                                            <span>{mensaje.created_at ? format(new Date(mensaje.created_at), "HH:mm", { locale: es }) : "--:--"}</span>
                                            {!isIncoming && (
                                                <div className="flex ml-0.5">
                                                    {mensaje.leido ? (
                                                        <CheckCheck className="w-3 h-3 text-blue-500" />
                                                    ) : mensaje.entregado ? (
                                                        <CheckCheck className="w-3 h-3 text-black/50" />
                                                    ) : (
                                                        <Check className="w-3 h-3 text-black/50" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-gray-200 dark:text-white/10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Sin mensajes aún</p>
                            <p className="text-xs text-gray-400">Envía un mensaje para iniciar la conversación.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preview de Media Seleccionada */}
            {selectedMedia && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-bottom-2 fade-in">
                    <div className="flex items-center space-x-4 max-w-5xl mx-auto">
                        <div className="relative group">
                            {selectedMedia.type === 'image' ? (
                                <img
                                    src={selectedMedia.preview}
                                    className="w-20 h-20 object-cover rounded-xl border-2 border-yellow-400 shadow-md"
                                    alt="Preview"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-yellow-400/10 rounded-xl border-2 border-yellow-400 flex items-center justify-center">
                                    <Mic className="w-8 h-8 text-yellow-500" />
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-black transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {selectedMedia.file.name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {(selectedMedia.file.size / 1024 / 1024).toFixed(2)} MB • Listo para enviar
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input de Mensaje */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3 max-w-5xl mx-auto w-full">
                    {!isRecording ? (
                        <>
                            {/* Botones de Adjuntar */}
                            <div className="flex items-center space-x-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all"
                                    title="Adjuntar imagen"
                                >
                                    <Image className="w-6 h-6" />
                                </button>

                                <input
                                    type="file"
                                    ref={audioInputRef}
                                    onChange={(e) => handleFileUpload(e, 'audio')}
                                    className="hidden"
                                    accept="audio/*"
                                />
                                <button
                                    type="button"
                                    onClick={() => audioInputRef.current?.click()}
                                    className="p-2.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-xl transition-all"
                                    title="Adjuntar archivo de audio"
                                >
                                    <Paperclip className="w-6 h-6" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowSalesTools(!showSalesTools)}
                                    className={`p-2.5 rounded-xl transition-all ${showSalesTools ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                                    title="Herramientas de venta (Planes/Servicios)"
                                >
                                    <Sparkles className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Panel de Ventas Floating */}
                            {showSalesTools && (
                                <div className="absolute bottom-20 left-4 right-4 bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-50 animate-in slide-in-from-bottom-5 duration-200">
                                    <div className="flex border-b border-gray-100 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setActiveSalesTab('planes')}
                                            className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeSalesTab === 'planes' ? 'text-yellow-500 bg-yellow-400/5' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Planes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveSalesTab('servicios')}
                                            className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${activeSalesTab === 'servicios' ? 'text-yellow-500 bg-yellow-400/5' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Servicios
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 gap-1 custom-scrollbar">
                                        {(activeSalesTab === 'planes' ? planes : servicios).map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    const detail = item.caracteristicas ? `\n✅ ${JSON.parse(JSON.stringify(item.caracteristicas)).join('\n✅ ')}` : (item.descripcion ? `\n${item.descripcion}` : '');
                                                    const msg = `*${item.nombre}*\n💰 Precio: $${Number(item.precio).toLocaleString('es-CO')}${detail}\n\n¿Te gustaría adquirir este servicio?`;
                                                    setNuevoMensaje(msg);
                                                    setShowSalesTools(false);
                                                }}
                                                className="flex flex-col items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left group"
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-yellow-400">{item.nombre}</span>
                                                    <span className="text-xs font-bold text-yellow-500">$ {Number(item.precio).toLocaleString('es-CO')}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{item.descripcion}</p>
                                            </button>
                                        ))}
                                        {(activeSalesTab === 'planes' ? planes : servicios).length === 0 && (
                                            <div className="p-8 text-center text-xs text-gray-400">
                                                No hay {activeSalesTab} disponibles.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    placeholder={selectedMedia ? "Añadir un comentario..." : "Escribe un mensaje aquí..."}
                                    className="block w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all shadow-inner sm:text-sm"
                                    disabled={loading || sending || uploading}
                                />
                                <div className="absolute right-3 inset-y-0 flex items-center space-x-2">
                                    {(nuevoMensaje.trim() || selectedMedia) ? (
                                        <button
                                            type="submit"
                                            disabled={(!nuevoMensaje.trim() && !selectedMedia) || loading || sending || uploading}
                                            className="p-2 rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20 hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-200"
                                        >
                                            {sending || uploading ? (
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                                            title="Grabar nota de voz"
                                        >
                                            <Mic className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-500/10 rounded-2xl px-4 py-2 border border-red-100 dark:border-red-500/20 animate-in slide-in-from-bottom-1 duration-200">
                            <div className="flex items-center space-x-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">
                                    {formatTime(recordingTime)}
                                </span>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">Grabando audio...</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={cancelRecording}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Cancelar grabación"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md transition-all active:scale-95"
                                    title="Finalizar grabación"
                                >
                                    <Mic className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </form>
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
        </div >
    );
}
