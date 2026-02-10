"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Cliente {
    id: string;
    nombre: string;
}

export default function NewFacturaPage() {
    const router = useRouter();
    const supabase = createClient();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cliente_id: "",
        fecha_emision: new Date().toISOString().split('T')[0],
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: 0,
        impuestos: 0,
        descuento: 0,
        notas: ""
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        const { data } = await (supabase as any)
            .from("clientes")
            .select("id, nombre")
            .order("nombre");

        if (data) setClientes(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const total = formData.subtotal + formData.impuestos - formData.descuento;

        const { data, error } = await (supabase as any)
            .from("facturas")
            .insert({
                ...formData,
                total
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating factura:", error);
            alert("Error al crear la factura");
        } else {
            router.push(`/dashboard/facturas/${data.id}`);
        }

        setLoading(false);
    };

    const total = formData.subtotal + formData.impuestos - formData.descuento;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/facturas"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Factura</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Crea una nueva factura para un cliente
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                {/* Cliente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cliente *
                    </label>
                    <select
                        required
                        value={formData.cliente_id}
                        onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Seleccionar cliente...</option>
                        {clientes.map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                                {cliente.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de Emisión *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fecha_emision}
                            onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de Vencimiento *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fecha_vencimiento}
                            onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Montos */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subtotal *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.subtotal}
                            onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Impuestos
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.impuestos}
                                onChange={(e) => setFormData({ ...formData, impuestos: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descuento
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.descuento}
                                onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                }).format(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notas
                    </label>
                    <textarea
                        rows={3}
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Notas adicionales..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Creando...' : 'Crear Factura'}
                    </button>
                </div>
            </form>
        </div>
    );
}
