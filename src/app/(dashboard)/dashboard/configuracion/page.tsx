"use client";

import { useState } from "react";
import { User, Building, Radio, Users, Settings } from "lucide-react";
import ProfileSettings from "@/components/settings/ProfileSettings";
import OrganizationSettings from "@/components/settings/OrganizationSettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import TeamSettings from "@/components/settings/TeamSettings";

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState("perfil");

    const tabs = [
        { id: "perfil", label: "Perfil", icon: User, component: ProfileSettings },
        { id: "organizacion", label: "Organización", icon: Building, component: OrganizationSettings },
        { id: "integraciones", label: "Integraciones", icon: Radio, component: IntegrationsSettings },
        { id: "equipo", label: "Equipo", icon: Users, component: TeamSettings },
    ];


    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Settings className="w-8 h-8 mr-3 text-gray-700 dark:text-gray-300" />
                    Configuración
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Administra tu perfil, la organización y las integraciones del sistema.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar de Navegación */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? "text-blue-500" : "text-gray-400"
                                        }`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
}
