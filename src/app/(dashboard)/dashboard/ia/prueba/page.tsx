"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Brain, Send, Loader2 } from "lucide-react";

export default function PruebaIAPage() {
    const [mensaje, setMensaje] = useState("");
    const [tipo, setTipo] = useState<"respuesta_automatica" | "clasificacion" | "sentimiento" | "resumen" | "sugerencia">("respuesta_automatica");
    const [loading, setLoading] = useState(false);
    const [respuesta, setRespuesta] = useState<any>(null);
    const [error, setError] = useState("");
    const supabase = createClient();

    const probarIA = async () => {
        if (!mensaje.trim()) {
            setError("Por favor escribe un mensaje");
            return;
        }

        setLoading(true);
        setError("");
        setRespuesta(null);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('ai-assistant', {
                body: {
                    mensaje: mensaje,
                    tipo: tipo
                }
            });

            if (invokeError) {
                // Intentar leer el cuerpo del error si existe
                console.error("Error de invocación:", invokeError);
                let detailMsg = invokeError.message;

                if (invokeError instanceof Error) {
                    detailMsg = `${invokeError.name}: ${invokeError.message}`;
                }

                // Si es un error HTTP, intentar dar más contexto
                // @ts-ignore
                if (invokeError.context?.response) {
                    // @ts-ignore
                    const status = invokeError.context.response.status;
                    // @ts-ignore
                    const statusText = invokeError.context.response.statusText;
                    detailMsg += ` (Status: ${status} ${statusText})`;

                    if (status === 404) {
                        detailMsg = "La función 'ai-assistant' no fue encontrada (Error 404). Posiblemente no está desplegada en Supabase.";
                    } else if (status === 500) {
                        detailMsg = "Error interno en la función (Error 500). Verifica los logs en Supabase o la API Key.";
                    }
                }

                throw new Error(detailMsg);
            }

            setRespuesta(data);
        } catch (err: any) {
            console.error("Error al llamar a la IA:", err);
            setError(err.message || "Error al conectar con la IA");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-purple-600" />
                    Prueba de IA
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Prueba las funciones de inteligencia artificial de tu CRM
                </p>
            </div>

            {/* Formulario */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-4">
                    {/* Selector de Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de IA
                        </label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="respuesta_automatica">Respuesta Automática</option>
                            <option value="clasificacion">Clasificación de Lead</option>
                            <option value="sentimiento">Análisis de Sentimiento</option>
                            <option value="resumen">Resumen de Conversación</option>
                            <option value="sugerencia">Sugerencias de Respuesta</option>
                        </select>
                    </div>

                    {/* Campo de Mensaje */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mensaje de Prueba
                        </label>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Escribe un mensaje para probar la IA..."
                        />
                    </div>

                    {/* Ejemplos según tipo */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                            💡 Ejemplo para {tipo}:
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            {tipo === "respuesta_automatica" && "Hola, quiero información sobre sus servicios de marketing digital"}
                            {tipo === "clasificacion" && "Necesito una página web urgente, tengo presupuesto aprobado de $5000"}
                            {tipo === "sentimiento" && "Estoy muy molesto, llevo 3 días esperando respuesta"}
                            {tipo === "resumen" && "Cliente preguntó por desarrollo web, mencionó presupuesto de $3000, quiere integración con pasarelas de pago"}
                            {tipo === "sugerencia" && "¿Cuánto cuesta una página web?"}
                        </p>
                    </div>

                    {/* Botón */}
                    <button
                        onClick={probarIA}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Probar IA
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900 dark:text-red-300">
                        ❌ Error: {error}
                    </p>
                </div>
            )}

            {/* Respuesta */}
            {respuesta && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ✅ Respuesta de la IA
                    </h2>

                    <div className="space-y-4">
                        {/* Respuesta Principal */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                                Respuesta:
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                                {typeof respuesta.respuesta === 'string'
                                    ? respuesta.respuesta
                                    : JSON.stringify(respuesta.respuesta, null, 2)}
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tokens Usados</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {respuesta.tokens_usados || 0}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Tipo</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {respuesta.tipo}
                                </p>
                            </div>
                        </div>

                        {/* Envío Automático */}
                        {respuesta.enviar_automaticamente !== undefined && (
                            <div className={`rounded-lg p-3 ${respuesta.enviar_automaticamente
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                                }`}>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {respuesta.enviar_automaticamente
                                        ? '🤖 Envío Automático: Activado'
                                        : '👤 Envío Automático: Desactivado (requiere aprobación)'}
                                </p>
                            </div>
                        )}

                        {/* JSON Completo */}
                        <details className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                            <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                Ver respuesta completa (JSON)
                            </summary>
                            <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                                {JSON.stringify(respuesta, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            )}

            {/* Instrucciones */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    📖 Cómo usar esta página de prueba:
                </h3>
                <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                    <li>Selecciona el tipo de IA que quieres probar</li>
                    <li>Escribe un mensaje de prueba (o usa el ejemplo sugerido)</li>
                    <li>Haz clic en "Probar IA"</li>
                    <li>Verás la respuesta de la IA y los tokens consumidos</li>
                </ol>
            </div>
        </div>
    );
}
