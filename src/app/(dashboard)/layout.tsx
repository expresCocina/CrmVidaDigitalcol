"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    UserPlus,
    Calendar,
    MessageSquare,
    Brain,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Sparkles,
    Package,
    FileText,
    LayoutGrid,
    Receipt,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: UserPlus },
    { name: "Pipeline de Ventas", href: "/dashboard/pipeline", icon: LayoutGrid },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Agenda", href: "/dashboard/citas", icon: Calendar },
    { name: "Cotizaciones", href: "/dashboard/cotizaciones", icon: FileText },
    { name: "Facturas", href: "/dashboard/facturas", icon: Receipt },
    { name: "Chat Center", href: "/dashboard/mensajes", icon: MessageSquare },
    { name: "Planes", href: "/dashboard/planes", icon: Sparkles },
    { name: "Servicios", href: "/dashboard/servicios", icon: Package },
    { name: "IA", href: "/dashboard/ia", icon: Brain },
    { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

interface Notification {
    id: string;
    text: string;
    sender: string;
    time: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = createClient();

    const fetchUnreadCount = useCallback(async () => {
        const { count, error } = await supabase
            .from('mensajes')
            .select('id', { count: 'exact', head: true })
            .eq('direccion', 'entrante')
            .eq('leido', false);

        if (!error && count !== null) {
            setUnreadCount(count);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUnreadCount();

        // Listener global para mensajes leídos (disparado desde las páginas de chat)
        const handleMessagesRead = () => fetchUnreadCount();
        window.addEventListener('messages-read', handleMessagesRead);

        // Suscripción Realtime para nuevos mensajes
        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes',
                    filter: 'direccion=eq.entrante'
                },
                async (payload) => {
                    console.log('🔔 Layout detectó nuevo mensaje:', payload);
                    const newMsg = payload.new as any;

                    // Actualizar contador
                    fetchUnreadCount();

                    // No mostrar notificación si ya estamos viendo esta conversación
                    if (pathname.includes(newMsg.conversacion_id)) {
                        console.log('🔇 Notificación silenciada: ya estás en este chat');
                        return;
                    }

                    // Mostrar notificación visual
                    try {
                        // Obtener nombre del remitente (lead o cliente)
                        const { data: conv } = await supabase
                            .from('conversaciones')
                            .select('leads(nombre), clientes(nombre)')
                            .eq('id', newMsg.conversacion_id)
                            .single();

                        const senderName = (conv as any)?.leads?.nombre ||
                            (conv as any)?.clientes?.nombre ||
                            "Nuevo mensaje";

                        const newNotification: Notification = {
                            id: newMsg.id,
                            text: newMsg.tipo === 'text' ? newMsg.contenido : `Envió una ${newMsg.tipo}`,
                            sender: senderName,
                            time: format(new Date(), "HH:mm", { locale: es })
                        };

                        setNotifications(prev => [newNotification, ...prev].slice(0, 3));

                        // Sonido
                        const audio = new Audio('/sounds/notification.mp3');
                        audio.play().catch(() => { });

                        // Auto-limpiar después de 5 segundos
                        setTimeout(() => {
                            setNotifications(prev => prev.filter(n => n.id !== newMsg.id));
                        }, 5000);
                    } catch (e) {
                        console.error("Error showing notification:", e);
                    }
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener('messages-read', handleMessagesRead);
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchUnreadCount]);

    return (
        <div className="min-h-screen bg-[#111] dark:bg-black text-white">
            {/* Sidebar móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo - Lyon Visión Style */}
                    <div className="flex items-center justify-between h-20 px-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                <span className="text-black font-bold text-lg">V</span>
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-tight">
                                Vida <span className="text-yellow-400">Digital</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${isActive
                                        ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/10"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? "text-black" : "text-gray-400 group-hover:text-yellow-400"}`} />
                                    <span className="flex-1">{item.name}</span>

                                    {/* Badge para Chat Center */}
                                    {item.name === "Chat Center" && unreadCount > 0 && (
                                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? "bg-black text-yellow-400" : "bg-yellow-400 text-black"} shadow-sm animate-pulse`}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Usuario y cerrar sesión */}
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center p-2 mb-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-semibold shadow-inner">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                    {user?.user_metadata?.nombre_completo || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate">
                                    Administrador
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:pl-64 min-h-screen flex flex-col">
                {/* Notificaciones Toasts Lyons Style */}
                <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className="pointer-events-auto flex items-center p-4 min-w-[320px] bg-black/90 backdrop-blur-md border border-yellow-400/30 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg mr-3 shadow-lg shadow-yellow-400/20">
                                {notif.sender.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest truncate">{notif.sender}</h4>
                                    <span className="text-[9px] font-medium text-gray-500">{notif.time}</span>
                                </div>
                                <p className="text-sm text-white/90 truncate font-medium">{notif.text}</p>
                            </div>
                            <Link
                                href={`/dashboard/mensajes`}
                                className="ml-4 p-2 bg-yellow-400/10 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </Link>
                        </div>
                    ))}
                </div>
                {/* Header móvil */}
                <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-black/80 backdrop-blur-md border-b border-white/5 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="ml-4 text-lg font-bold text-white">
                        Vida <span className="text-yellow-400">Digital</span>
                    </h1>
                </div>

                {/* Contenido */}
                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
