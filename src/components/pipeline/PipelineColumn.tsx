"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import LeadCard from "./LeadCard";

interface Lead {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
    pipeline_stage: string;
    created_at: string;
    ultima_interaccion?: string;
}

interface PipelineColumnProps {
    stage: string;
    title: string;
    leads: Lead[];
    color: string;
}

const stageIcons: Record<string, string> = {
    nuevo: "🆕",
    contactado: "📞",
    cotizado: "📄",
    negociacion: "🤝",
    ganado: "✅",
    perdido: "❌"
};

export default function PipelineColumn({ stage, title, leads, color }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });

    const leadIds = leads.map(lead => lead.id);

    return (
        <div className="flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {/* Column Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                        <span className="mr-2">{stageIcons[stage]}</span>
                        {title}
                    </h3>
                    <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${color}
                    `}>
                        {leads.length}
                    </span>
                </div>
                <div className={`h-1 rounded-full ${color.replace('text-', 'bg-').replace('dark:', '')}`} />
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className={`
                    min-h-[500px] rounded-lg transition-colors
                    ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400' : ''}
                `}
            >
                <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
                    {leads.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                            Sin leads
                        </div>
                    ) : (
                        leads.map((lead) => (
                            <LeadCard key={lead.id} lead={lead} />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
