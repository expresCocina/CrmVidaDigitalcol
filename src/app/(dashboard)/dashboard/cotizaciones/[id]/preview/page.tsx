"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Printer, Download, ArrowLeft, Send } from "lucide-react";

interface CotizacionItem {
    id: string;
    nombre: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
}

interface Cotizacion {
    id: string;
    numero: string;
    lead_id?: string;
    cliente_id?: string;
    estado: string;
    subtotal: number;
    descuento: number;
    total: number;
    valida_hasta?: string;
    notas?: string;
    terminos_condiciones?: string;
    created_at: string;
    lead?: {
        nombre: string;
        email?: string;
        telefono?: string;
    };
    cliente?: {
        nombre: string;
        email?: string;
        telefono?: string;
    };
}

export default function CotizacionPreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const [id, setId] = useState<string>("");
    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
    const [items, setItems] = useState<CotizacionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then((resolvedParams) => {
            setId(resolvedParams.id);
            fetchCotizacion(resolvedParams.id);
        });
    }, []);

    const fetchCotizacion = async (cotizacionId: string) => {
        setLoading(true);

        // Fetch cotizacion
        const { data: cotData } = await (supabase as any)
            .from("cotizaciones")
            .select(`
                *,
                lead:leads(nombre, email, telefono),
                cliente:clientes(nombre, email, telefono)
            `)
            .eq("id", cotizacionId)
            .single();

        if (cotData) {
            setCotizacion(cotData);
        }

        // Fetch items
        const { data: itemsData } = await (supabase as any)
            .from("cotizaciones_items")
            .select("*")
            .eq("cotizacion_id", cotizacionId);

        if (itemsData) {
            setItems(itemsData);
        }

        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando cotización...</p>
                </div>
            </div>
        );
    }

    if (!cotizacion) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600 dark:text-gray-400">Cotización no encontrada</p>
            </div>
        );
    }

    const nombreCliente = cotizacion.cliente?.nombre || cotizacion.lead?.nombre || "Cliente";
    const emailCliente = cotizacion.cliente?.email || cotizacion.lead?.email;
    const telefonoCliente = cotizacion.cliente?.telefono || cotizacion.lead?.telefono;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Action Bar - No se imprime */}
            <div className="print:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir / PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Cotización - Se imprime */}
            <div className="max-w-5xl mx-auto p-8 print:p-0">
                <div className="bg-white shadow-lg print:shadow-none">
                    {/* Header */}
                    <div className="p-8 border-b-2 border-blue-600">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">COTIZACIÓN</h1>
                                <p className="text-xl font-semibold text-blue-600">{cotizacion.numero}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-gray-900">Vida Digital</h2>
                                <p className="text-sm text-gray-600">Marketing Digital & Desarrollo Web</p>
                                <p className="text-sm text-gray-600 mt-2">www.vidadigitalco.com</p>
                                <p className="text-sm text-gray-600">contacto@vidadigitalco.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-8 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Cliente</h3>
                            <p className="text-lg font-semibold text-gray-900">{nombreCliente}</p>
                            {emailCliente && <p className="text-sm text-gray-600">{emailCliente}</p>}
                            {telefonoCliente && <p className="text-sm text-gray-600">{telefonoCliente}</p>}
                        </div>
                        <div className="text-right">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Fecha de Emisión</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(cotizacion.created_at)}</p>
                            </div>
                            {cotizacion.valida_hasta && (
                                <div>
                                    <p className="text-sm text-gray-500">Válida Hasta</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(cotizacion.valida_hasta)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-8 pb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="text-left py-3 text-sm font-semibold text-gray-700">Descripción</th>
                                    <th className="text-center py-3 text-sm font-semibold text-gray-700">Cant.</th>
                                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Precio Unit.</th>
                                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Descuento</th>
                                    <th className="text-right py-3 text-sm font-semibold text-gray-700">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-4">
                                            <p className="font-medium text-gray-900">{item.nombre}</p>
                                            {item.descripcion && (
                                                <p className="text-sm text-gray-600 mt-1">{item.descripcion}</p>
                                            )}
                                        </td>
                                        <td className="text-center py-4 text-gray-900">{item.cantidad}</td>
                                        <td className="text-right py-4 text-gray-900">{formatPrice(item.precio_unitario)}</td>
                                        <td className="text-right py-4 text-gray-900">
                                            {item.descuento > 0 ? formatPrice(item.descuento) : '-'}
                                        </td>
                                        <td className="text-right py-4 font-semibold text-gray-900">{formatPrice(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="px-8 pb-8">
                        <div className="flex justify-end">
                            <div className="w-80">
                                <div className="flex justify-between py-2 text-gray-700">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">{formatPrice(cotizacion.subtotal)}</span>
                                </div>
                                {cotizacion.descuento > 0 && (
                                    <div className="flex justify-between py-2 text-gray-700">
                                        <span>Descuento:</span>
                                        <span className="font-semibold">-{formatPrice(cotizacion.descuento)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-3 border-t-2 border-gray-300 text-lg">
                                    <span className="font-bold text-gray-900">Total:</span>
                                    <span className="font-bold text-blue-600">{formatPrice(cotizacion.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {cotizacion.notas && (
                        <div className="px-8 pb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{cotizacion.notas}</p>
                        </div>
                    )}

                    {/* Terms */}
                    {cotizacion.terminos_condiciones && (
                        <div className="px-8 pb-8">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Términos y Condiciones</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{cotizacion.terminos_condiciones}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-600">
                            Gracias por su preferencia. Para cualquier consulta, no dude en contactarnos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        margin: 0.5cm;
                    }
                }
            `}</style>
        </div>
    );
}
