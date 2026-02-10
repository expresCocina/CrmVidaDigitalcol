"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    Plus, Trash2, Save, Send, X, Search, Calculator
} from "lucide-react";

interface CotizacionItem {
    id?: string;
    tipo: 'servicio' | 'plan' | 'personalizado';
    servicio_id?: string;
    plan_id?: string;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
}

interface FormData {
    lead_id: string;
    cliente_id: string;
    estado: string;
    valida_hasta: string;
    notas: string;
    terminos_condiciones: string;
    descuento: number;
}

export default function CotizacionForm({ cotizacionId }: { cotizacionId?: string }) {
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState<FormData>({
        lead_id: '',
        cliente_id: '',
        estado: 'borrador',
        valida_hasta: '',
        notas: '',
        terminos_condiciones: 'Cotización válida por 15 días.\nPrecios sujetos a cambios sin previo aviso.\nTiempo de entrega: según proyecto.',
        descuento: 0
    });

    const [items, setItems] = useState<CotizacionItem[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);
    const [servicios, setServicios] = useState<any[]>([]);
    const [planes, setPlanes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    const [newItem, setNewItem] = useState<CotizacionItem>({
        tipo: 'servicio',
        nombre: '',
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento: 0,
        subtotal: 0
    });

    useEffect(() => {
        fetchData();
        if (cotizacionId) {
            fetchCotizacion();
        }
    }, [cotizacionId]);

    const fetchData = async () => {
        // Fetch leads
        const { data: leadsData } = await (supabase as any)
            .from("leads")
            .select("id, nombre, email, telefono")
            .order("nombre");
        if (leadsData) setLeads(leadsData);

        // Fetch clientes
        const { data: clientesData } = await (supabase as any)
            .from("clientes")
            .select("id, nombre, email, telefono")
            .order("nombre");
        if (clientesData) setClientes(clientesData);

        // Fetch servicios
        const { data: serviciosData } = await (supabase as any)
            .from("servicios")
            .select("*")
            .eq("activo", true)
            .order("nombre");
        if (serviciosData) setServicios(serviciosData);

        // Fetch planes
        const { data: planesData } = await (supabase as any)
            .from("planes")
            .select("*")
            .eq("activo", true)
            .order("orden");
        if (planesData) setPlanes(planesData);
    };

    const fetchCotizacion = async () => {
        if (!cotizacionId) return;

        const { data: cotData } = await (supabase as any)
            .from("cotizaciones")
            .select("*")
            .eq("id", cotizacionId)
            .single();

        if (cotData) {
            setFormData({
                lead_id: cotData.lead_id || '',
                cliente_id: cotData.cliente_id || '',
                estado: cotData.estado,
                valida_hasta: cotData.valida_hasta || '',
                notas: cotData.notas || '',
                terminos_condiciones: cotData.terminos_condiciones || '',
                descuento: cotData.descuento || 0
            });
        }

        const { data: itemsData } = await (supabase as any)
            .from("cotizaciones_items")
            .select("*")
            .eq("cotizacion_id", cotizacionId);

        if (itemsData) setItems(itemsData);
    };

    const handleAddItem = () => {
        setNewItem({
            tipo: 'servicio',
            nombre: '',
            descripcion: '',
            cantidad: 1,
            precio_unitario: 0,
            descuento: 0,
            subtotal: 0
        });
        setEditingItemIndex(null);
        setShowItemModal(true);
    };

    const handleEditItem = (index: number) => {
        setNewItem(items[index]);
        setEditingItemIndex(index);
        setShowItemModal(true);
    };

    const handleSaveItem = () => {
        const subtotal = (newItem.cantidad * newItem.precio_unitario) - newItem.descuento;
        const itemToSave = { ...newItem, subtotal };

        if (editingItemIndex !== null) {
            const updatedItems = [...items];
            updatedItems[editingItemIndex] = itemToSave;
            setItems(updatedItems);
        } else {
            setItems([...items, itemToSave]);
        }

        setShowItemModal(false);
    };

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSelectServicio = (servicioId: string) => {
        const servicio = servicios.find(s => s.id === servicioId);
        if (servicio) {
            setNewItem({
                ...newItem,
                servicio_id: servicio.id,
                plan_id: undefined,
                nombre: servicio.nombre,
                descripcion: servicio.descripcion || '',
                precio_unitario: servicio.precio
            });
        }
    };

    const handleSelectPlan = (planId: string) => {
        const plan = planes.find(p => p.id === planId);
        if (plan) {
            setNewItem({
                ...newItem,
                plan_id: plan.id,
                servicio_id: undefined,
                nombre: plan.nombre,
                descripcion: plan.descripcion || '',
                precio_unitario: plan.precio
            });
        }
    };

    const calcularTotales = () => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const descuentoTotal = formData.descuento;
        const total = subtotal - descuentoTotal;

        return { subtotal, descuentoTotal, total };
    };

    const handleSubmit = async (enviar: boolean = false) => {
        setLoading(true);

        const { subtotal, descuentoTotal, total } = calcularTotales();

        const cotizacionData = {
            lead_id: formData.lead_id || null,
            cliente_id: formData.cliente_id || null,
            estado: enviar ? 'enviada' : formData.estado,
            subtotal,
            descuento: descuentoTotal,
            total,
            valida_hasta: formData.valida_hasta || null,
            notas: formData.notas,
            terminos_condiciones: formData.terminos_condiciones,
            enviada_at: enviar ? new Date().toISOString() : null
        };

        let cotId = cotizacionId;

        if (cotizacionId) {
            // Update existing
            await (supabase as any)
                .from("cotizaciones")
                .update(cotizacionData)
                .eq("id", cotizacionId);

            // Delete old items
            await (supabase as any)
                .from("cotizaciones_items")
                .delete()
                .eq("cotizacion_id", cotizacionId);
        } else {
            // Create new
            const { data, error } = await (supabase as any)
                .from("cotizaciones")
                .insert([cotizacionData])
                .select()
                .single();

            if (error) {
                console.error("Error creating cotizacion:", error);
                setLoading(false);
                return;
            }
            cotId = data.id;
        }

        // Insert items
        const itemsToInsert = items.map(item => ({
            cotizacion_id: cotId,
            tipo: item.tipo,
            servicio_id: item.servicio_id || null,
            plan_id: item.plan_id || null,
            nombre: item.nombre,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            descuento: item.descuento,
            subtotal: item.subtotal
        }));

        await (supabase as any)
            .from("cotizaciones_items")
            .insert(itemsToInsert);

        if (enviar) {
            // TODO: Enviar por WhatsApp
            alert("Cotización guardada y marcada como enviada");
        }

        setLoading(false);
        router.push("/dashboard/cotizaciones");
    };

    const handleEnviarWhatsApp = async () => {
        await handleSubmit(true);

        // Get phone number
        const telefono = formData.cliente_id
            ? clientes.find(c => c.id === formData.cliente_id)?.telefono
            : leads.find(l => l.id === formData.lead_id)?.telefono;

        if (!telefono) {
            alert("No hay número de teléfono registrado");
            return;
        }

        const { total } = calcularTotales();
        const mensaje = `Hola! Te envío la cotización solicitada.\n\nTotal: ${formatPrice(total)}\n\nPuedes revisarla en detalle en el siguiente enlace.`;

        const whatsappUrl = `https://wa.me/${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const { subtotal, descuentoTotal, total } = calcularTotales();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cotizacionId ? 'Editar Cotización' : 'Nueva Cotización'}
                </h1>
                <button
                    onClick={() => router.back()}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cliente/Lead Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cliente o Lead</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cliente
                                </label>
                                <select
                                    value={formData.cliente_id}
                                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value, lead_id: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lead
                                </label>
                                <select
                                    value={formData.lead_id}
                                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value, cliente_id: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccionar lead...</option>
                                    {leads.map(l => (
                                        <option key={l.id} value={l.id}>{l.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
                            <button
                                onClick={handleAddItem}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Item
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay items agregados
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">{item.nombre}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.descripcion}</p>
                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                    <span>Cantidad: {item.cantidad}</span>
                                                    <span>Precio: {formatPrice(item.precio_unitario)}</span>
                                                    {item.descuento > 0 && <span>Descuento: {formatPrice(item.descuento)}</span>}
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        Subtotal: {formatPrice(item.subtotal)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditItem(index)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notas y Términos */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información Adicional</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notas
                                </label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                    placeholder="Notas internas..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Términos y Condiciones
                                </label>
                                <textarea
                                    value={formData.terminos_condiciones}
                                    onChange={(e) => setFormData({ ...formData, terminos_condiciones: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Totales */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Calculator className="w-5 h-5 mr-2" />
                            Resumen
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatPrice(descuentoTotal)}</span>
                                </div>
                                <input
                                    type="number"
                                    value={formData.descuento}
                                    onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                                    <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuración */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={formData.estado}
                                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="borrador">Borrador</option>
                                    <option value="enviada">Enviada</option>
                                    <option value="aceptada">Aceptada</option>
                                    <option value="rechazada">Rechazada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Válida hasta
                                </label>
                                <input
                                    type="date"
                                    value={formData.valida_hasta}
                                    onChange={(e) => setFormData({ ...formData, valida_hasta: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading || items.length === 0}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Guardando...' : 'Guardar Cotización'}
                        </button>
                        <button
                            onClick={handleEnviarWhatsApp}
                            disabled={loading || items.length === 0 || (!formData.cliente_id && !formData.lead_id)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingItemIndex !== null ? 'Editar Item' : 'Agregar Item'}
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
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
                                            checked={newItem.tipo === 'servicio'}
                                            onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value as any })}
                                            className="mr-2"
                                        />
                                        Servicio
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="plan"
                                            checked={newItem.tipo === 'plan'}
                                            onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value as any })}
                                            className="mr-2"
                                        />
                                        Plan
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="personalizado"
                                            checked={newItem.tipo === 'personalizado'}
                                            onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value as any })}
                                            className="mr-2"
                                        />
                                        Personalizado
                                    </label>
                                </div>
                            </div>

                            {/* Selección de servicio/plan */}
                            {newItem.tipo === 'servicio' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Servicio
                                    </label>
                                    <select
                                        onChange={(e) => handleSelectServicio(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Seleccionar servicio...</option>
                                        {servicios.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre} - {formatPrice(s.precio)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {newItem.tipo === 'plan' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Plan
                                    </label>
                                    <select
                                        onChange={(e) => handleSelectPlan(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Seleccionar plan...</option>
                                        {planes.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre} - {formatPrice(p.precio)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Nombre y Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={newItem.nombre}
                                    onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={newItem.descripcion}
                                    onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    rows={3}
                                />
                            </div>

                            {/* Cantidad y Precio */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        value={newItem.cantidad}
                                        onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Precio Unitario
                                    </label>
                                    <input
                                        type="number"
                                        value={newItem.precio_unitario}
                                        onChange={(e) => setNewItem({ ...newItem, precio_unitario: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        min="0"
                                        step="1000"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descuento
                                </label>
                                <input
                                    type="number"
                                    value={newItem.descuento}
                                    onChange={(e) => setNewItem({ ...newItem, descuento: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    min="0"
                                    step="1000"
                                />
                            </div>

                            {/* Subtotal Preview */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {formatPrice((newItem.cantidad * newItem.precio_unitario) - newItem.descuento)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowItemModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveItem}
                                disabled={!newItem.nombre || newItem.precio_unitario <= 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editingItemIndex !== null ? 'Actualizar' : 'Agregar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
