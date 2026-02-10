"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Plus, Calendar, Send } from "lucide-react";
import Link from "next/link";

interface Factura {
    id: string;
    numero: string;
    cliente_id: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    subtotal: number;
    total: number;
    pagado: number;
    saldo: number;
    estado: string;
    notas?: string;
    cliente?: {
        nombre: string;
        email?: string;
        telefono?: string;
    };
}

interface Pago {
    id: string;
    monto: number;
    fecha: string;
    metodo: string;
    referencia?: string;
    notas?: string;
}

export default function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const [id, setId] = useState<string>("");
    const [factura, setFactura] = useState<Factura | null>(null);
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPagoForm, setShowPagoForm] = useState(false);
    const [pagoForm, setPagoForm] = useState({
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        metodo: "transferencia",
        referencia: "",
        notas: ""
    });

    useEffect(() => {
        params.then((resolvedParams) => {
            setId(resolvedParams.id);
            fetchFactura(resolvedParams.id);
            fetchPagos(resolvedParams.id);
        });
    }, []);

    const fetchFactura = async (facturaId: string) => {
        setLoading(true);
        const { data } = await (supabase as any)
            .from("facturas")
            .select(`*, cliente:clientes(nombre, email, telefono)`)
            .eq("id", facturaId)
            .single();

        if (data) setFactura(data);
        setLoading(false);
    };

    const fetchPagos = async (facturaId: string) => {
        const { data } = await (supabase as any)
            .from("pagos")
            .select("*")
            .eq("factura_id", facturaId)
            .order("fecha", { ascending: false });

        if (data) setPagos(data);
    };

    const handleRegistrarPago = async (e: React.FormEvent) => {
        e.preventDefault();

        const { error } = await (supabase as any)
            .from("pagos")
            .insert({
                factura_id: id,
                ...pagoForm
            });

        if (!error) {
            // Registrar actividad
            await (supabase as any)
                .from("actividades")
                .insert({
                    tipo: "pago_registrado",
                    descripcion: `Pago registrado de ${formatPrice(pagoForm.monto)} para factura ${factura?.numero}`,
                    cliente_id: factura?.cliente_id,
                    metadata: {
                        factura_id: id,
                        monto: pagoForm.monto,
                        metodo: pagoForm.metodo
                    }
                });

            setShowPagoForm(false);
            setPagoForm({
                monto: 0,
                fecha: new Date().toISOString().split('T')[0],
                metodo: "transferencia",
                referencia: "",
                notas: ""
            });
            fetchFactura(id);
            fetchPagos(id);
        }
    };

    const handleEnviarWhatsApp = () => {
        if (!factura?.cliente?.telefono) {
            alert("El cliente no tiene número de teléfono registrado");
            return;
        }

        const mensaje = `
🧾 *FACTURA ${factura.numero}*

Hola ${factura.cliente.nombre},

Te enviamos el detalle de tu factura:

📅 *Fecha de emisión:* ${new Date(factura.fecha_emision).toLocaleDateString('es-CO')}
📅 *Vencimiento:* ${new Date(factura.fecha_vencimiento).toLocaleDateString('es-CO')}

💰 *Total:* ${formatPrice(factura.total)}
${factura.pagado > 0 ? `✅ *Pagado:* ${formatPrice(factura.pagado)}` : ''}
${factura.saldo > 0 ? `⚠️ *Saldo pendiente:* ${formatPrice(factura.saldo)}` : ''}

${factura.notas ? `📝 *Notas:* ${factura.notas}` : ''}

¡Gracias por tu preferencia!
        `.trim();

        const telefono = factura.cliente.telefono.replace(/\D/g, '');
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

        // Registrar actividad
        (supabase as any)
            .from("actividades")
            .insert({
                tipo: "factura_enviada",
                descripcion: `Factura ${factura.numero} enviada por WhatsApp a ${factura.cliente.nombre}`,
                cliente_id: factura.cliente_id,
                metadata: {
                    factura_id: id,
                    telefono: factura.cliente.telefono
                }
            });

        window.open(url, '_blank');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading || !factura) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando factura...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/facturas"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{factura.numero}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {factura.cliente?.nombre}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información de la Factura */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Información de la Factura
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Emisión</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(factura.fecha_emision).toLocaleDateString('es-CO')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Vencimiento</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(factura.fecha_vencimiento).toLocaleDateString('es-CO')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Subtotal</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {formatPrice(factura.subtotal)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatPrice(factura.total)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Pagado</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    {formatPrice(factura.pagado)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Pendiente</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                    {formatPrice(factura.saldo)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pagos */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Historial de Pagos
                            </h2>
                            {factura.saldo > 0 && (
                                <button
                                    onClick={() => setShowPagoForm(!showPagoForm)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar Pago
                                </button>
                            )}
                        </div>

                        {showPagoForm && (
                            <form onSubmit={handleRegistrarPago} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Monto *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max={factura.saldo}
                                            step="0.01"
                                            value={pagoForm.monto}
                                            onChange={(e) => setPagoForm({ ...pagoForm, monto: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Fecha *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={pagoForm.fecha}
                                            onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Método *
                                        </label>
                                        <select
                                            required
                                            value={pagoForm.metodo}
                                            onChange={(e) => setPagoForm({ ...pagoForm, metodo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="efectivo">Efectivo</option>
                                            <option value="transferencia">Transferencia</option>
                                            <option value="tarjeta">Tarjeta</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Referencia
                                        </label>
                                        <input
                                            type="text"
                                            value={pagoForm.referencia}
                                            onChange={(e) => setPagoForm({ ...pagoForm, referencia: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Guardar Pago
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPagoForm(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        {pagos.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No hay pagos registrados
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {pagos.map((pago) => (
                                    <div key={pago.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {formatPrice(pago.monto)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {pago.metodo.charAt(0).toUpperCase() + pago.metodo.slice(1)}
                                                {pago.referencia && ` - ${pago.referencia}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(pago.fecha).toLocaleDateString('es-CO')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Estado</h3>
                        <div className={`
                            px-4 py-2 rounded-lg text-center font-medium
                            ${factura.estado === 'pagada' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${factura.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                            ${factura.estado === 'parcial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            ${factura.estado === 'vencida' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        `}>
                            {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                        </div>
                    </div>

                    {/* WhatsApp Button */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Acciones</h3>
                        <button
                            onClick={handleEnviarWhatsApp}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
