"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Bot, AlertCircle, CheckCircle2, Power, ExternalLink, Settings } from "lucide-react";

interface Integration {
    id: string;
    nombre: string;
    tipo: string;
    activo: boolean;
    configuracion: any;
    ultimo_sync?: string;
}

export default function IntegrationsSettings() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

    // Initial state matching the 'integraciones' table structure roughly
    const defaultIntegrations = [
        { tipo: 'whatsapp', nombre: 'WhatsApp Business API', icon: MessageSquare, color: 'text-green-500', description: 'Conecta tu número de WhatsApp para enviar y recibir mensajes automáticamente.' },
        { tipo: 'openai', nombre: 'OpenAI (ChatGPT)', icon: Bot, color: 'text-purple-500', description: 'Potencia tu CRM con inteligencia artificial para respuestas automáticas y análisis.' },
    ];

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const { data, error } = await supabase
                .from("integraciones")
                .select("*")
                .order("nombre");

            if (data) {
                setIntegrations(data);
            }
        } catch (error) {
            console.error("Error fetching integrations:", error);
        }
    };

    const toggleIntegration = async (tipo: string, currentState: boolean) => {
        setLoading(true);
        setMessage(null);

        try {
            // Find existing
            const existing = integrations.find(i => i.tipo === tipo);

            if (existing) {
                // Update
                const { error } = await supabase
                    .from("integraciones")
                    .update({ activo: !currentState, updated_at: new Date().toISOString() })
                    .eq("id", existing.id);

                if (error) throw error;
            } else {
                // Create default entry if not exists
                const defaultData = defaultIntegrations.find(i => i.tipo === tipo);
                if (!defaultData) return;

                const { error } = await supabase
                    .from("integraciones")
                    .insert([{
                        nombre: defaultData.nombre,
                        tipo: tipo,
                        activo: true,
                        configuracion: {},
                        credenciales: {}
                    }]);

                if (error) throw error;
            }

            await fetchIntegrations();
            setMessage({ type: "success", text: `Integración ${currentState ? "desactivada" : "activada"} correctamente` });

        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al cambiar estado" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg flex items-center ${message.type === "success" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conexiones Activas</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona los servicios externos conectados a tu CRM.</p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {defaultIntegrations.map((def) => {
                        const integration = integrations.find(i => i.tipo === def.tipo);
                        const isActive = integration?.activo || false;
                        const Icon = def.icon;

                        return (
                            <div key={def.tipo} className="p-6 flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${def.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center">
                                            {def.nombre}
                                            {isActive ? (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                                                    Inactivo
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                                            {def.description}
                                        </p>

                                        {isActive && integration && (
                                            <div className="pt-2 flex items-center space-x-4">
                                                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                                                    <Settings className="w-4 h-4 mr-1" />
                                                    Configurar
                                                </button>
                                                {/* <span className="text-xs text-gray-400">Última sinc: {integration.ultimo_sync ? new Date(integration.ultimo_sync).toLocaleDateString() : "Nunca"}</span> */}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleIntegration(def.tipo, isActive)}
                                    disabled={loading}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">¿Necesitas más integraciones?</span>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center">
                            Ver documentación <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
