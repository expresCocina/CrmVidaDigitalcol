"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Settings,
    MessageSquare,
    BarChart3,
    Save,
    Plus,
    Trash2,
    Edit,
    Brain
} from "lucide-react";

interface ConfiguracionIA {
    id: string;
    nombre: string;
    tipo: string;
    modelo: string;
    temperatura: number;
    max_tokens: number;
    activo: boolean;
    created_at: string;
}

export default function IAPage() {
    const [activeTab, setActiveTab] = useState<"configuracion" | "prompts" | "historial">("configuracion");
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionIA[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingConfig, setEditingConfig] = useState<ConfiguracionIA | null>(null);
    const [showForm, setShowForm] = useState(false);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "asistente",
        modelo: "gpt-4",
        temperatura: 0.7,
        max_tokens: 1000,
        activo: true
    });

    useEffect(() => {
        fetchConfiguraciones();
    }, []);

    const fetchConfiguraciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("configuracion_ia" as any)
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setConfiguraciones(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingConfig) {
                const { error } = await supabase
                    .from("configuracion_ia" as any)
                    .update(formData)
                    .eq("id", editingConfig.id);

                if (error) throw error;
            } else {
                // Validación básica antes de crear
                if (!formData.nombre) {
                    alert("El nombre es obligatorio");
                    return;
                }

                // @ts-ignore
                const { error } = await supabase
                    .from("configuracion_ia" as any)
                    .insert([formData]);

                if (error) throw error;
            }

            await fetchConfiguraciones();
            setShowForm(false);
            setEditingConfig(null);
            resetForm();
        } catch (error: any) {
            console.error("Error saving configuration:", error);
            alert(`Error al guardar: ${error.message || error}`);
        }
    };

    const handleEdit = (config: ConfiguracionIA) => {
        setEditingConfig(config);
        setFormData({
            nombre: config.nombre,
            tipo: config.tipo,
            modelo: config.modelo,
            temperatura: config.temperatura,
            max_tokens: config.max_tokens,
            activo: config.activo
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta configuración? Esta acción no se puede deshacer.")) return;

        try {
            const { error } = await supabase
                .from("configuracion_ia" as any)
                .delete()
                .eq("id", id);

            if (error) throw error;

            await fetchConfiguraciones();
        } catch (error: any) {
            console.error("Error deleting configuration:", error);
            alert(`Error al eliminar: ${error.message || error}`);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            tipo: "asistente",
            modelo: "gpt-4",
            temperatura: 0.7,
            max_tokens: 1000,
            activo: true
        });
    };

    const tabs = [
        { id: "configuracion" as const, label: "Configuración", icon: Settings },
        { id: "prompts" as const, label: "Prompts", icon: MessageSquare },
        { id: "historial" as const, label: "Historial", icon: BarChart3 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Brain className="w-8 h-8 mr-3 text-purple-600" />
                    Configuración de IA
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gestiona la configuración del asistente de inteligencia artificial
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors`}
                            >
                                <Icon className="w-5 h-5 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {activeTab === "configuracion" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Configuraciones de IA
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(!showForm);
                                    setEditingConfig(null);
                                    resetForm();
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Configuración
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="Ej: Asistente Principal"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={formData.tipo}
                                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="asistente">Asistente</option>
                                            <option value="clasificador">Clasificador</option>
                                            <option value="analizador">Analizador</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Modelo
                                        </label>
                                        <select
                                            value={formData.modelo}
                                            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="gpt-4">GPT-4</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Temperatura: {formData.temperatura}
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formData.temperatura}
                                            onChange={(e) => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            0 = Preciso, 1 = Creativo
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Max Tokens
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.max_tokens}
                                            onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.activo}
                                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900 dark:text-white cursor-pointer" htmlFor="activo-check">
                                            Activo
                                        </label>
                                    </div>

                                    {editingConfig && (
                                        <div className="col-span-full bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                                            Editando: <strong>{editingConfig.nombre}</strong> (ID: {editingConfig.id.substring(0, 8)}...)
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingConfig(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 inline mr-2" />
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Lista de Configuraciones */}
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-center text-gray-500 py-8">Cargando configuraciones...</p>
                            ) : configuraciones.length > 0 ? (
                                configuraciones.map((config) => (
                                    <div key={config.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {config.nombre}
                                                </h3>
                                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{config.tipo}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Modelo:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{config.modelo}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Temperatura:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{config.temperatura}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Max Tokens:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">{config.max_tokens}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.activo
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                                    }`}>
                                                    {config.activo ? "Activo" : "Inactivo"}
                                                </span>
                                                <button
                                                    onClick={() => handleEdit(config)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(config.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Brain className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay configuraciones</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Comienza creando tu primera configuración de IA.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "prompts" && (
                    <PromptsTab configuraciones={configuraciones} />
                )}

                {activeTab === "historial" && (
                    <HistorialTab />
                )}
            </div>
        </div >
    );
}

// Componente para gestión de prompts
function PromptsTab({ configuraciones }: { configuraciones: ConfiguracionIA[] }) {
    const supabase = createClient();
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<any>(null);
    const [formData, setFormData] = useState({
        configuracion_ia_id: "",
        nombre: "",
        prompt_sistema: "",
        prompt_usuario: "",
        activo: true
    });

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("prompts_sistema" as any)
            .select(`
                *,
                configuracion_ia (nombre)
            `)
            .order("created_at", { ascending: false });

        if (!error && data) {
            setPrompts(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPrompt) {
                const { error } = await supabase
                    .from("prompts_sistema" as any)
                    .update(formData)
                    .eq("id", editingPrompt.id);

                if (error) throw error;
            } else {
                // @ts-ignore
                const { error } = await supabase
                    .from("prompts_sistema" as any)
                    .insert([formData]);

                if (error) throw error;
            }

            fetchPrompts();
            setShowForm(false);
            setEditingPrompt(null);
            resetForm();
        } catch (error: any) {
            console.error("Error saving prompt:", error);
            alert("Error al guardar el prompt");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este prompt?")) return;

        const { error } = await supabase
            .from("prompts_sistema" as any)
            .delete()
            .eq("id", id);

        if (!error) {
            fetchPrompts();
        }
    };

    const resetForm = () => {
        setFormData({
            configuracion_ia_id: "",
            nombre: "",
            prompt_sistema: "",
            prompt_usuario: "",
            activo: true
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Prompts del Sistema
                </h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingPrompt(null);
                        resetForm();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Prompt
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Configuración de IA *
                            </label>
                            <select
                                required
                                value={formData.configuracion_ia_id}
                                onChange={(e) => setFormData({ ...formData, configuracion_ia_id: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Seleccionar...</option>
                                {configuraciones.map(config => (
                                    <option key={config.id} value={config.id}>{config.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nombre del Prompt *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Ej: Clasificación de Leads"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prompt del Sistema *
                            </label>
                            <textarea
                                required
                                value={formData.prompt_sistema}
                                onChange={(e) => setFormData({ ...formData, prompt_sistema: e.target.value })}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                placeholder="Eres un asistente de ventas experto..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prompt del Usuario (Template)
                            </label>
                            <textarea
                                value={formData.prompt_usuario}
                                onChange={(e) => setFormData({ ...formData, prompt_usuario: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                                placeholder="Clasifica este lead: {lead_data}"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                                Activo
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingPrompt(null);
                                resetForm();
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 inline mr-2" />
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            {/* Lista de Prompts */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-8">Cargando prompts...</p>
                ) : prompts.length > 0 ? (
                    prompts.map((prompt) => (
                        <div key={prompt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {prompt.nombre}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Configuración: {prompt.configuracion_ia?.nombre || "N/A"}
                                    </p>
                                    <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                        <p className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {prompt.prompt_sistema.substring(0, 200)}
                                            {prompt.prompt_sistema.length > 200 && "..."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${prompt.activo
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                        }`}>
                                        {prompt.activo ? "Activo" : "Inactivo"}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setEditingPrompt(prompt);
                                            setFormData({
                                                configuracion_ia_id: prompt.configuracion_ia_id,
                                                nombre: prompt.nombre,
                                                prompt_sistema: prompt.prompt_sistema,
                                                prompt_usuario: prompt.prompt_usuario || "",
                                                activo: prompt.activo
                                            });
                                            setShowForm(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prompt.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay prompts</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Comienza creando tu primer prompt del sistema.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente para historial de interacciones
function HistorialTab() {
    const supabase = createClient();
    const [interacciones, setInteracciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInteracciones();
    }, []);

    const fetchInteracciones = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("interacciones_ia" as any)
            .select(`
                *,
                configuracion_ia (nombre),
                usuarios (nombre_completo)
            `)
            .order("created_at", { ascending: false })
            .limit(50);

        if (!error && data) {
            setInteracciones(data);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Historial de Interacciones
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Últimas 50 interacciones
                </div>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 py-8">Cargando historial...</p>
            ) : interacciones.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Configuración
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Prompt
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tokens
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tiempo (ms)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {interacciones.map((interaccion) => (
                                <tr key={interaccion.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {format(new Date(interaccion.created_at), "d MMM, HH:mm", { locale: es })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {interaccion.configuracion_ia?.nombre || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {interaccion.usuarios?.nombre_completo || "Sistema"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                                        {interaccion.prompt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {interaccion.tokens_usados || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {interaccion.tiempo_respuesta_ms || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay interacciones</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        El historial de interacciones con IA aparecerá aquí.
                    </p>
                </div>
            )}
        </div>
    );
}
