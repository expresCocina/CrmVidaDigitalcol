"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import PipelineColumn from "./PipelineColumn";
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

const stages = [
    { id: "nuevo", title: "Nuevo", color: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800" },
    { id: "contactado", title: "Contactado", color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
    { id: "cotizado", title: "Cotizado", color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30" },
    { id: "negociacion", title: "Negociación", color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" },
    { id: "ganado", title: "Ganado", color: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" },
    { id: "perdido", title: "Perdido", color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30" },
];

export default function PipelineBoard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        const { data, error } = await (supabase as any)
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) {
            setLeads(data);
        }
        setLoading(false);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const leadId = active.id as string;
        const newStage = over.id as string;

        // Find the lead
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.pipeline_stage === newStage) {
            setActiveId(null);
            return;
        }

        // Optimistic update
        setLeads(prevLeads =>
            prevLeads.map(l =>
                l.id === leadId ? { ...l, pipeline_stage: newStage } : l
            )
        );

        // Persist to database
        try {
            const { error } = await (supabase as any)
                .from("leads")
                .update({ pipeline_stage: newStage })
                .eq("id", leadId);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating lead stage:", error);
            // Revert on error
            setLeads(prevLeads =>
                prevLeads.map(l =>
                    l.id === leadId ? { ...l, pipeline_stage: lead.pipeline_stage } : l
                )
            );
            alert("Error al mover el lead");
        }

        setActiveId(null);
    };

    const getLeadsByStage = (stage: string) => {
        return leads.filter(lead => lead.pipeline_stage === stage);
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando pipeline...</p>
                </div>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {stages.map((stage) => (
                    <PipelineColumn
                        key={stage.id}
                        stage={stage.id}
                        title={stage.title}
                        leads={getLeadsByStage(stage.id)}
                        color={stage.color}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? (
                    <div className="rotate-3 scale-105">
                        <LeadCard lead={activeLead} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
