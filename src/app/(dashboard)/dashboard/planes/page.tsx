"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface Plan {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    caracteristicas: string[];
    destacado: boolean;
    activo: boolean;
    orden: number;
}

export default function PlanesPage() {
    const supabase = createClient();
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: 0,
        caracteristicas: [] as string[],
        destacado: false,
        activo: true,
        orden: 0
    });

    const [nuevaCaracteristica, setNuevaCaracteristica] = useState("");

    useEffect(() => {
        fetchPlanes();
    }, []);

    const fetchPlanes = async () => {
        try {
            const { data, error } = await supabase
                .from("planes" as any)
                .select("*")
                .order("orden");

            if (error) throw error;
            setPlanes((data as any) || []);
        } catch (error) {
            console.error("Error fetching planes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                caracteristicas: JSON.stringify(formData.caracteristicas)
            };

            if (editingPlan) {
                const { error } = await supabase
                    .from("planes" as any)
                    .update(payload)
                    .eq("id", editingPlan.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("planes" as any)
                    .insert([payload] as any);

                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchPlanes();
        } catch (error: any) {
            console.error("Error saving plan:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este plan?")) return;

        try {
            const { error } = await supabase
                .from("planes" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;
            fetchPlanes();
        } catch (error: any) {
            console.error("Error deleting plan:", error);
            alert(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: 0,
            caracteristicas: [],
            destacado: false,
            activo: true,
            orden: 0
        });
        setEditingPlan(null);
        setNuevaCaracteristica("");
    };

    const openEditModal = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            nombre: plan.nombre,
            descripcion: plan.descripcion || "",
            precio: plan.precio,
            caracteristicas: plan.caracteristicas || [],
            destacado: plan.destacado,
            activo: plan.activo,
            orden: plan.orden
        });
        setShowModal(true);
    };

    const agregarCaracteristica = () => {
        if (nuevaCaracteristica.trim()) {
            setFormData({
                ...formData,
                caracteristicas: [...formData.caracteristicas, nuevaCaracteristica.trim()]
            });
            setNuevaCaracteristica("");
        }
    };

    const eliminarCaracteristica = (index: number) => {
        setFormData({
            ...formData,
            caracteristicas: formData.caracteristicas.filter((_, i) => i !== index)
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Sparkles className="w-8 h-8 mr-3 text-purple-600" />
                        Gestión de Planes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Administra los planes de servicio disponibles
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Plan
                </button>
            </div>

            {/* Planes Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planes.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-xl p-6 border ${plan.destacado
                                    ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white border-transparent shadow-2xl"
                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className={`text-xl font-bold mb-1 ${plan.destacado ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                        {plan.nombre}
                                    </h3>
                                    <p className={`text-sm ${plan.destacado ? "text-purple-100" : "text-gray-600 dark:text-gray-400"}`}>
                                        {plan.descripcion}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => openEditModal(plan)}
                                        className={`p-2 rounded-lg transition-colors ${plan.destacado
                                                ? "text-white hover:bg-white/20"
                                                : "text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                            }`}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        className={`p-2 rounded-lg transition-colors ${plan.destacado
                                                ? "text-white hover:bg-white/20"
                                                : "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                            }`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className={`text-3xl font-bold ${plan.destacado ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                    {formatPrice(plan.precio)}
                                </div>
                                <span className={`text-sm ${plan.destacado ? "text-purple-100" : "text-gray-600 dark:text-gray-400"}`}>
                                    /mes
                                </span>
                            </div>

                            <ul className="space-y-2 mb-4">
                                {plan.caracteristicas?.slice(0, 4).map((feature, idx) => (
                                    <li key={idx} className={`text-sm ${plan.destacado ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                        • {feature}
                                    </li>
                                ))}
                                {plan.caracteristicas?.length > 4 && (
                                    <li className={`text-sm italic ${plan.destacado ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}>
                                        +{plan.caracteristicas.length - 4} más...
                                    </li>
                                )}
                            </ul>

                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                <span className={`text-xs ${plan.destacado ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}>
                                    Orden: {plan.orden}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.activo
                                        ? plan.destacado
                                            ? "bg-white/20 text-white"
                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                    }`}>
                                    {plan.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 my-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingPlan ? "Editar Plan" : "Nuevo Plan"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nombre del Plan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
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
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Orden
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.orden}
                                        onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Características
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <input
                                            type="text"
                                            value={nuevaCaracteristica}
                                            onChange={(e) => setNuevaCaracteristica(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCaracteristica())}
                                            placeholder="Agregar característica..."
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={agregarCaracteristica}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                                        {formData.caracteristicas.map((feature, idx) => (
                                            <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarCaracteristica(idx)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.destacado}
                                            onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            Plan destacado
                                        </span>
                                    </label>

                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            Plan activo
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
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Guardando..." : editingPlan ? "Actualizar" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
