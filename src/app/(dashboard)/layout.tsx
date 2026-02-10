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
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", href: "/dashboard/leads", icon: UserPlus },
    { name: "Pipeline", href: "/dashboard/pipeline", icon: LayoutGrid },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Citas", href: "/dashboard/citas", icon: Calendar },
    { name: "Cotizaciones", href: "/dashboard/cotizaciones", icon: FileText },
    { name: "Mensajes", href: "/dashboard/mensajes", icon: MessageSquare },
    { name: "Planes", href: "/dashboard/planes", icon: Sparkles },
    { name: "Servicios", href: "/dashboard/servicios", icon: Package },
    { name: "IA", href: "/dashboard/ia", icon: Brain },
    { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                            Vida Digital
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Usuario y cerrar sesión */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.user_metadata?.nombre_completo || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:pl-64">
                {/* Header móvil */}
                <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                        CRM Vida Digital
                    </h1>
                </div>

                {/* Contenido */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
