"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Package, Plus, Calendar, DollarSign, AlertCircle, Check, X, Edit2, Trash2, PlayCircle, PauseCircle
} from "lucide-react";

interface ServicioCliente {
    id: string;
    servicio_id?: string;
    plan_id?: string;
    fecha_inicio: string;
    fecha_fin?: string;
    estado: string;
    notas?: string;
    servicio?: {
        nombre: string;
        precio: number;
        categoria: string;
        unidad: string;
    };
    plan?: {
        nombre: string;
        precio: number;
        descripcion: string;
    };
}

interface Props {
    clienteId: string;
}

export default function ServiciosCliente({ clienteId }: Props) {
    const [servicios, setServicios] = useState<ServicioCliente[]>([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
    const [planesDisponibles, setPlanesDisponibles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        tipo: 'servicio',
        servicio_id: '',
        plan_id: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        estado: 'activo',
        notas: ''
    });

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, [clienteId]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch servicios del cliente
        const { data: serviciosData } = await supabase
            .from("servicios_clientes")
            .select(`
                *,
                servicio:servicio_id(*),
                plan:plan_id(*)
            `)
            .eq("cliente_id", clienteId)
            .order("created_at", { ascending: false });

        if (serviciosData) setServicios(serviciosData as any);

        // Fetch servicios disponibles
        const { data: serviciosDisp } = await supabase
            .from("servicios")
            .select("*")
            .eq("activo", true)
            .order("nombre");

        if (serviciosDisp) setServiciosDisponibles(serviciosDisp);

        // Fetch planes disponibles
        const { data: planesDisp } = await supabase
            .from("planes")
            .select("*")
            .eq("activo", true)
            .order("orden");

        if (planesDisp) setPlanesDisponibles(planesDisp);

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSave = {
            cliente_id: clienteId,
            servicio_id: formData.tipo === 'servicio' ? formData.servicio_id : null,
            plan_id: formData.tipo === 'plan' ? formData.plan_id : null,
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin || null,
            estado: formData.estado,
            notas: formData.notas
        };

        if (editingId) {
            await supabase
                .from("servicios_clientes")
                .update(dataToSave)
                .eq("id", editingId);
        } else {
            await supabase
                .from("servicios_clientes")
                .insert([dataToSave]);
        }

        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchData();
    };

    const handleEdit = (servicio: ServicioCliente) => {
        setEditingId(servicio.id);
        setFormData({
            tipo: servicio.servicio_id ? 'servicio' : 'plan',
            servicio_id: servicio.servicio_id || '',
            plan_id: servicio.plan_id || '',
            fecha_inicio: servicio.fecha_inicio,
            fecha_fin: servicio.fecha_fin || '',
            estado: servicio.estado,
            notas: servicio.notas || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            await supabase
                .from("servicios_clientes")
                .delete()
                .eq("id", id);
            fetchData();
        }
    };

    const handleChangeEstado = async (id: string, nuevoEstado: string) => {
        await supabase
            .from("servicios_clientes")
            .update({ estado: nuevoEstado })
            .eq("id", id);
        fetchData();
    };

    const resetForm = () => {
        setFormData({
            tipo: 'servicio',
            servicio_id: '',
            plan_id: '',
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            estado: 'activo',
            notas: ''
        });
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'activo': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'pausado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const calcularMRR = () => {
        return servicios
            .filter(s => s.estado === 'activo')
            .reduce((total, s) => {
                const precio = s.servicio?.precio || s.plan?.precio || 0;
                const unidad = s.servicio?.unidad || 'mensual';

                if (unidad === 'mensual' || !s.servicio) {
                    return total + precio;
                }
                return total;
            }, 0);
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Cargando servicios...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header con MRR */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Servicios Contratados
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            MRR: <span className="font-bold text-green-600">{formatPrice(calcularMRR())}</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            Total servicios: <span className="font-bold">{servicios.length}</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            Activos: <span className="font-bold text-green-600">
                                {servicios.filter(s => s.estado === 'activo').length}
                            </span>
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => { setShowModal(true); setEditingId(null); resetForm(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Servicio
                </button>
            </div>

            {/* Lista de servicios */}
            <div className="grid gap-4">
                {servicios.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No hay servicios contratados
                        </p>
                    </div>
                ) : (
                    servicios.map((servicio) => {
                        const nombre = servicio.servicio?.nombre || servicio.plan?.nombre || 'Sin nombre';
                        const precio = servicio.servicio?.precio || servicio.plan?.precio || 0;
                        const categoria = servicio.servicio?.categoria || 'plan';

                        return (
                            <div
                                key={servicio.id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {nombre}
                                            </h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(servicio.estado)}`}>
                                                {servicio.estado}
                                            </span>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 capitalize">
                                                {categoria}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 mr-1" />
                                                {formatPrice(precio)}
                                                {servicio.servicio?.unidad && ` / ${servicio.servicio.unidad}`}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Inicio: {new Date(servicio.fecha_inicio).toLocaleDateString('es-CO')}
                                            </div>
                                            {servicio.fecha_fin && (
                                                <div className="flex items-center">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    Fin: {new Date(servicio.fecha_fin).toLocaleDateString('es-CO')}
                                                </div>
                                            )}
                                        </div>

                                        {servicio.notas && (
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
                                                {servicio.notas}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {servicio.estado === 'activo' && (
                                            <button
                                                onClick={() => handleChangeEstado(servicio.id, 'pausado')}
                                                className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                                                title="Pausar"
                                            >
                                                <PauseCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {servicio.estado === 'pausado' && (
                                            <button
                                                onClick={() => handleChangeEstado(servicio.id, 'activo')}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Activar"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(servicio)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(servicio.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Editar Servicio' : 'Agregar Servicio'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="servicio"
                                            checked={formData.tipo === 'servicio'}
                                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                            className="mr-2"
                                        />
                                        Servicio Individual
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="plan"
                                            checked={formData.tipo === 'plan'}
                                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                            className="mr-2"
                                        />
                                        Plan
                                    </label>
                                </div>
                            </div>

                            {/* Servicio o Plan */}
                            {formData.tipo === 'servicio' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Servicio
                                    </label>
                                    <select
                                        value={formData.servicio_id}
                                        onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Seleccionar servicio...</option>
                                        {serviciosDisponibles.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.nombre} - {formatPrice(s.precio)} / {s.unidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Plan
                                    </label>
                                    <select
                                        value={formData.plan_id}
                                        onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Seleccionar plan...</option>
                                        {planesDisponibles.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} - {formatPrice(p.precio)} / mes
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Fechas */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fecha Fin (opcional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.fecha_fin}
                                        onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="activo">Activo</option>
                                    <option value="pausado">Pausado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                    placeholder="Notas adicionales sobre este servicio..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingId(null); resetForm(); }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {editingId ? 'Actualizar' : 'Agregar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
