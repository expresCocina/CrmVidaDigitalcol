"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Save, X, AlertCircle } from "lucide-react";
import { convertLeadToClient } from "@/lib/actions/leads";

interface LeadFormProps {
    initialData?: any;
    leadId?: string;
}

export default function LeadForm({ initialData, leadId }: LeadFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fuentes, setFuentes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        cargo: "",
        estado: "nuevo",
        fuente_id: "",
        calificacion: "tibio",
        notas: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
        fetchFuentes();
    }, [initialData]);

    const fetchFuentes = async () => {
        const { data } = await supabase.from("fuentes_leads").select("*").eq("activo", true);
        if (data) setFuentes(data);
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
            console.log("[LeadForm] handleSubmit called");
            console.log("[LeadForm] formData.estado:", formData.estado);
            console.log("[LeadForm] leadId:", leadId);

            const { data: { user } } = await supabase.auth.getUser();
            const shouldConvert = formData.estado === "convertido";

            // Si es un nuevo lead con estado "convertido", primero créalo como "nuevo"
            // y luego conviértelo
            if (!leadId && shouldConvert) {
                console.log("[LeadForm] Creando nuevo lead para luego convertir...");

                const payload = {
                    ...formData,
                    estado: "nuevo", // Crear primero como "nuevo"
                    asignado_a: user?.id
                };

                const { data: newLead, error: insertError } = await supabase
                    .from("leads")
                    .insert([payload])
                    .select()
                    .single();

                if (insertError) throw insertError;
                if (!newLead) throw new Error("Lead creado pero no retornado");

                console.log("[LeadForm] Lead creado, ID:", newLead.id);
                console.log("[LeadForm] Iniciando conversión...");

                // Ahora convertir el lead recién creado
                try {
                    const result = await convertLeadToClient(newLead.id);
                    console.log("[LeadForm] Conversión exitosa:", result);
                } catch (conversionError: any) {
                    console.error("[LeadForm] Error en conversión:", conversionError);
                    throw conversionError;
                }

                console.log("[LeadForm] Redirigiendo a clientes...");
                router.push("/dashboard/clientes");
                router.refresh();
                return;
            }

            // Manejo especial para conversion de lead EXISTENTE
            if (leadId && shouldConvert) {
                console.log("[LeadForm] Iniciando conversión de lead existente...");

                // Llamar al Server Action
                try {
                    const result = await convertLeadToClient(leadId);
                    console.log("[LeadForm] Conversión exitosa:", result);
                } catch (conversionError: any) {
                    console.error("[LeadForm] Error en conversión:", conversionError);
                    throw conversionError;
                }

                // Actualizar resto de campos si hubo cambios antes de convertir
                const payload: any = {
                    ...formData,
                };
                delete payload.estado;
                delete payload.convertido_a_cliente_id;
                delete payload.fecha_conversion;

                const { error: updateError } = await supabase
                    .from("leads")
                    .update(payload)
                    .eq("id", leadId);
                if (updateError) throw updateError;

                console.log("[LeadForm] Redirigiendo a clientes...");
                router.push("/dashboard/clientes");
                router.refresh();
                return;
            }

            // Flujo normal para otros estados
            const payload = {
                ...formData,
                asignado_a: user?.id
            };

            if (leadId) {
                const { error: updateError } = await supabase
                    .from("leads")
                    .update(payload)
                    .eq("id", leadId);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("leads")
                    .insert([payload]);

                if (insertError) throw insertError;
            }

            router.push("/dashboard/leads");
            router.refresh();
        } catch (err: any) {
            console.error("Error saving lead:", err);
            setError(err.message || "Error al guardar el lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Principal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Empresa
                        </label>
                        <input
                            type="text"
                            name="empresa"
                            value={formData.empresa}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                            placeholder="Ej: Tech Solutions SAS"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                            placeholder="juan@empresa.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                            placeholder="+57 300 123 4567"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Cargo
                        </label>
                        <input
                            type="text"
                            name="cargo"
                            value={formData.cargo}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                            placeholder="Ej: Gerente Comercial"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Estado y Clasificación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                        >
                            <option value="nuevo">Nuevo</option>
                            <option value="contactado">Contactado</option>
                            <option value="calificado">Calificado</option>
                            <option value="no_calificado">No Calificado</option>
                            <option value="convertido">Convertido</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Calificación (Temperatura)
                        </label>
                        <select
                            name="calificacion"
                            value={formData.calificacion}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                        >
                            <option value="frio">Frío ❄️</option>
                            <option value="tibio">Tibio 🌤️</option>
                            <option value="caliente">Caliente 🔥</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fuente
                        </label>
                        <select
                            name="fuente_id"
                            value={formData.fuente_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                        >
                            <option value="">Seleccionar Fuente</option>
                            {fuentes.map(fuente => (
                                <option key={fuente.id} value={fuente.id}>{fuente.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notas Adicionales</h3>
                <textarea
                    name="notas"
                    rows={4}
                    value={formData.notas}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white py-2 px-3"
                    placeholder="Detalles importantes sobre este lead..."
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Guardando..." : "Guardar Lead"}
                </button>
            </div>
        </form>
    );
}
