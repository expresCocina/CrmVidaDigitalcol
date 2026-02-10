"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, Plus, Edit, Trash2, DollarSign, Tag } from "lucide-react";

interface Servicio {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    unidad: string;
    activo: boolean;
}

export default function ServiciosPage() {
    const supabase = createClient();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: 0,
        categoria: "contenido",
        unidad: "único",
        activo: true
    });

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const { data, error } = await supabase
                .from("servicios" as any)
                .select("*")
                .order("categoria, nombre");

            if (error) throw error;
            setServicios((data as any) || []);
        } catch (error) {
            console.error("Error fetching servicios:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingServicio) {
                const { error } = await supabase
                    .from("servicios" as any)
                    .update(formData)
                    .eq("id", editingServicio.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("servicios" as any)
                    .insert([formData] as any);

                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchServicios();
        } catch (error: any) {
            console.error("Error saving servicio:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

        try {
            const { error } = await supabase
                .from("servicios" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchServicios();
        } catch (error: any) {
            console.error("Error deleting servicio:", error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: 0,
            categoria: "contenido",
            unidad: "único",
            activo: true
        });
        setEditingServicio(null);
    };

    const openEditModal = (servicio: Servicio) => {
        setEditingServicio(servicio);
        setFormData({
            nombre: servicio.nombre,
            descripcion: servicio.descripcion || "",
            precio: servicio.precio,
            categoria: servicio.categoria,
            unidad: servicio.unidad,
            activo: servicio.activo
        });
        setShowModal(true);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const categorias = [
        { value: "web", label: "Desarrollo Web" },
        { value: "crm", label: "CRM y Gestión" },
        { value: "contenido", label: "Contenido Digital" },
        { value: "video", label: "Producción de Video" },
        { value: "diseño", label: "Diseño Gráfico" },
        { value: "social", label: "Redes Sociales" },
        { value: "asesoría", label: "Asesoría y Capacitación" },
        { value: "otros", label: "Otros" }
    ];

    const unidades = ["único", "mensual", "por hora", "paquete"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Package className="w-8 h-8 mr-3 text-blue-600" />
                        Gestión de Servicios
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Administra el catálogo de servicios disponibles
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Servicio
                </button>
            </div>

            {/* Servicios Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicios.map((servicio) => (
                        <div
                            key={servicio.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {servicio.nombre}
                                    </h3>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {servicio.categoria}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {servicio.unidad}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(servicio)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(servicio.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {servicio.descripcion}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    <DollarSign className="w-5 h-5" />
                                    {formatPrice(servicio.precio)}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${servicio.activo
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
                                    {servicio.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingServicio ? "Editar Servicio" : "Nuevo Servicio"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre del Servicio
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Precio (COP)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="1000"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Categoría
                                    </label>
                                    <select
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categorias.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Unidad
                                    </label>
                                    <select
                                        value={formData.unidad}
                                        onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        {unidades.map(unidad => (
                                            <option key={unidad} value={unidad} className="capitalize">{unidad}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            Servicio activo
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Guardando..." : editingServicio ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
