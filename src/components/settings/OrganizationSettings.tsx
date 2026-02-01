"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Building, Save, Globe, DollarSign, MapPin, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

export default function OrganizationSettings() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        nombre_empresa: "",
        email_contacto: "",
        telefono_contacto: "",
        direccion: "",
        ciudad: "",
        pais: "",
        moneda: "COP",
        zona_horaria: "America/Bogota",
        logo_url: ""
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from("configuracion_organizacion")
                .select("*")
                .limit(1)
                .single();

            if (data) {
                setFormData({
                    id: data.id,
                    nombre_empresa: data.nombre_empresa || "",
                    email_contacto: data.email_contacto || "",
                    telefono_contacto: data.telefono_contacto || "",
                    direccion: data.direccion || "",
                    ciudad: data.ciudad || "",
                    pais: data.pais || "",
                    moneda: data.moneda || "COP",
                    zona_horaria: data.zona_horaria || "America/Bogota",
                    logo_url: data.logo_url || ""
                });
            } else if (error && error.code !== 'PGRST116') {
                // If error is NOT "no rows returned"
                console.error("Error fetching org config:", error);
            }
        } catch (error) {
            console.error("Error fetching org config:", error);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            let error;
            const payload = {
                nombre_empresa: formData.nombre_empresa,
                email_contacto: formData.email_contacto,
                telefono_contacto: formData.telefono_contacto,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                pais: formData.pais,
                moneda: formData.moneda,
                zona_horaria: formData.zona_horaria,
                updated_at: new Date().toISOString()
            };

            if (formData.id) {
                const { error: updateError } = await supabase
                    .from("configuracion_organizacion")
                    .update(payload)
                    .eq("id", formData.id);
                error = updateError;
            } else {
                const { error: insertError, data: newData } = await supabase
                    .from("configuracion_organizacion")
                    .insert([payload])
                    .select()
                    .single();

                if (newData) {
                    setFormData(prev => ({ ...prev, id: newData.id }));
                }
                error = insertError;
            }

            if (error) throw error;

            setMessage({ type: "success", text: "Configuración actualizada correctamente" });
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "Error al actualizar configuración" });
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `config/${fileName}`;

            setUploading(true);

            // 1. Upload file
            const { error: uploadError } = await supabase.storage
                .from('public') // Assuming 'public' bucket or adjust if you have a specific 'config' bucket
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('public')
                .getPublicUrl(filePath);

            // 3. Update state and DB
            setFormData(prev => ({ ...prev, logo_url: publicUrl }));

            if (formData.id) {
                await supabase
                    .from("configuracion_organizacion")
                    .update({ logo_url: publicUrl })
                    .eq("id", formData.id);
            }

            setMessage({ type: "success", text: "Logo actualizado correctamente" });

        } catch (error: any) {
            console.error("Error uploading logo:", error);
            setMessage({ type: "error", text: "Error al subir el logo" });
        } finally {
            setUploading(false);
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

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-500" />
                    Datos de la Organización
                </h3>

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Logo */}
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center relative overflow-hidden group">
                            {formData.logo_url ? (
                                <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building className="w-10 h-10 text-gray-400" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <label className="cursor-pointer p-2">
                                        <Upload className="w-6 h-6 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Logo de la Empresa</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recomendado: 500x500px, PNG o JPG</p>
                            <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                Subir Nuevo
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Empresa</label>
                            <input
                                type="text"
                                required
                                value={formData.nombre_empresa}
                                onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                                placeholder="Ej: Tech Solutions Ltd."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de Contacto</label>
                            <input
                                type="email"
                                value={formData.email_contacto}
                                onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                            <input
                                type="text"
                                value={formData.telefono_contacto}
                                onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                            />
                        </div>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-purple-500" />
                    Ubicación y Regionalización
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={formData.pais}
                                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                                className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                                placeholder="Ej: Colombia"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <select
                                value={formData.moneda}
                                onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}
                                className="w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                            >
                                <option value="COP">Peso Colombiano (COP)</option>
                                <option value="USD">Dólar Estadounidense (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                                <option value="MXN">Peso Mexicano (MXN)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zona Horaria</label>
                        <select
                            value={formData.zona_horaria}
                            onChange={(e) => setFormData({ ...formData, zona_horaria: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                        >
                            <option value="America/Bogota">Bogotá (GMT-5)</option>
                            <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                            <option value="America/New_York">New York (GMT-5)</option>
                            <option value="Europe/Madrid">Madrid (GMT+1)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Física</label>
                        <input
                            type="text"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white px-4 py-2"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                </button>
            </div>
        </div>
    );
}
