"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    Calendar,
    MapPin,
    Clock,
    Phone,
    Video,
    Users
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Cita {
    id: string;
    titulo: string;
    descripcion?: string | null;
    fecha_inicio: string;
    fecha_fin: string;
    tipo: string;
    estado: string;
    ubicacion?: string | null;
    lead_id?: string | null;
    cliente_id?: string | null;
    created_at: string;
}

export default function CitasPage() {
    const [citas, setCitas] = useState<Cita[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchCitas();
    }, []);

    const fetchCitas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("citas")
            .select("*")
            .order("fecha_inicio", { ascending: true });

        if (!error && data) {
            setCitas(data);
        }
        setLoading(false);
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "programada": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "confirmada": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "completada": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
            case "cancelada": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
        }
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case "telefonica": return Phone;
            case "virtual": return Video;
            case "presencial": return Users;
            default: return Calendar;
        }
    };

    const filteredCitas = citas.filter(cita =>
        cita.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Citas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona tus reuniones y llamadas programadas
                    </p>
                </div>
                <Link
                    href="/dashboard/citas/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Cita
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
                        placeholder="Buscar por título o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </button>
            </div>

            {/* Lista de Citas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Cargando citas...</div>
                ) : filteredCitas.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCitas.map((cita) => {
                            const TipoIcon = getTipoIcon(cita.tipo);
                            return (
                                <div key={cita.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                                <TipoIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {cita.titulo}
                                                </h3>
                                                {cita.descripcion && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {cita.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {format(new Date(cita.fecha_inicio), "d MMM, yyyy", { locale: es })}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        {format(new Date(cita.fecha_inicio), "h:mm a", { locale: es })}
                                                    </div>
                                                    {cita.ubicacion && (
                                                        <div className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {cita.ubicacion}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                                                {cita.estado}
                                            </span>
                                            <Link
                                                href={`/dashboard/citas/${cita.id}`}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay citas</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Comienza creando tu primera cita.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/dashboard/citas/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" />
                                Crear Cita
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
