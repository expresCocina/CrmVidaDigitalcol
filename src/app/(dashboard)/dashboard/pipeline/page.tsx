"use client";

import PipelineBoard from "@/components/pipeline/PipelineBoard";
import { LayoutGrid } from "lucide-react";

export default function PipelinePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <LayoutGrid className="w-6 h-6 mr-2" />
                        Pipeline de Ventas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Visualiza y gestiona el flujo de leads a través del proceso de ventas
                    </p>
                </div>
            </div>

            {/* Pipeline Board */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <PipelineBoard />
            </div>
        </div>
    );
}
