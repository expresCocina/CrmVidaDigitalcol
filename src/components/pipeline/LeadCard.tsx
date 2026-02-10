"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mail, Phone, Calendar, DollarSign, Eye, Edit2 } from "lucide-react";
import Link from "next/link";

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

interface LeadCardProps {
    lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getDaysAgo = (date: string) => {
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return "Hoy";
        if (days === 1) return "Ayer";
        return `Hace ${days} días`;
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3
                cursor-grab active:cursor-grabbing
                hover:shadow-md transition-shadow
                ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {lead.nombre}
                    </h3>
                    {lead.empresa && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {lead.empresa}
                        </p>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1.5 mb-3">
                {lead.email && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                    </div>
                )}
                {lead.telefono && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <Phone className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        <span>{lead.telefono}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {getDaysAgo(lead.ultima_interaccion || lead.created_at)}
                </div>
                <div className="flex gap-1">
                    <Link
                        href={`/dashboard/leads/${lead.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
