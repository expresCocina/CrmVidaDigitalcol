"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, X, AlertCircle } from "lucide-react";

interface AppointmentFormProps {
    initialData?: any;
    citaId?: string;
}

export default function AppointmentForm({ initialData, citaId }: AppointmentFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [leads, setLeads] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        tipo: "presencial",
        estado: "programada",
        ubicacion: "",
        lead_id: "",
        cliente_id: "",
        notas: "",
        url_reunion: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                fecha_inicio: initialData.fecha_inicio ? new Date(initialData.fecha_inicio).toISOString().slice(0, 16) : "",
                fecha_fin: initialData.fecha_fin ? new Date(initialData.fecha_fin).toISOString().slice(0, 16) : "",
            });
        }
        fetchLeadsAndClientes();
    }, [initialData]);

    const fetchLeadsAndClientes = async () => {
        const [leadsRes, clientesRes] = await Promise.all([
            supabase.from("leads").select("id, nombre").order("nombre"),
            supabase.from("clientes").select("id, nombre").order("nombre")
        ]);

        if (leadsRes.data) setLeads(leadsRes.data);
        if (clientesRes.data) setClientes(clientesRes.data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                ...formData,
                fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
                fecha_fin: new Date(formData.fecha_fin).toISOString(),
                lead_id: formData.lead_id || null,
                cliente_id: formData.cliente_id || null,
                asignado_a: user?.id
            };

            if (citaId) {
                const { error: updateError } = await supabase
                    .from("citas")
                    .update(payload)
                    .eq("id", citaId);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("citas")
                    .insert([payload]);

                if (insertError) throw insertError;
            }

            router.push("/dashboard/citas");
            router.refresh();
        } catch (err: any) {
            console.error("Error saving cita:", err);
            setError(err.message || "Error al guardar la cita");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Título */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Título *
                    </label>
                    <input
                        type="text"
                        name="titulo"
                        required
                        value={formData.titulo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Ej: Reunión con cliente"
                    />
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Detalles de la cita..."
                    />
                </div>

                {/* Fecha Inicio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha y Hora de Inicio *
                    </label>
                    <input
                        type="datetime-local"
                        name="fecha_inicio"
                        required
                        value={formData.fecha_inicio}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Fecha Fin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha y Hora de Fin *
                    </label>
                    <input
                        type="datetime-local"
                        name="fecha_fin"
                        required
                        value={formData.fecha_fin}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                {/* Tipo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo
                    </label>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="presencial">Presencial</option>
                        <option value="virtual">Virtual</option>
                        <option value="telefonica">Telefónica</option>
                    </select>
                </div>

                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado
                    </label>
                    <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="programada">Programada</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                {/* Ubicación */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Ubicación
                    </label>
                    <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Dirección o sala"
                    />
                </div>

                {/* URL Reunión */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL de Reunión Virtual
                    </label>
                    <input
                        type="url"
                        name="url_reunion"
                        value={formData.url_reunion}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="https://meet.google.com/..."
                    />
                </div>

                {/* Lead */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lead Relacionado
                    </label>
                    <select
                        name="lead_id"
                        value={formData.lead_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Ninguno</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>{lead.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Cliente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cliente Relacionado
                    </label>
                    <select
                        name="cliente_id"
                        value={formData.cliente_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Ninguno</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Notas */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notas
                    </label>
                    <textarea
                        name="notas"
                        value={formData.notas}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Notas adicionales..."
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Save className="w-4 h-4 inline mr-2" />
                    {loading ? "Guardando..." : "Guardar Cita"}
                </button>
            </div>
        </form>
    );
}
