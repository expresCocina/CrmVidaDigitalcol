"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LeadForm from "@/components/leads/LeadForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [lead, setLead] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchLead = async () => {
            const { data, error } = await supabase
                .from("leads")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching lead:", error);
                router.push("/dashboard/leads"); // Redirect on error
            } else {
                setLead(data);
            }
            setLoading(false);
        };

        if (id) {
            fetchLead();
        }
    }, [id, router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando información del lead...</div>;
    }

    if (!lead) {
        return <div className="p-8 text-center text-red-500">Lead no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard/leads" className="hover:text-blue-600">Leads</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900 dark:text-white">Editar Lead</span>
            </nav>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Lead: {lead.nombre}
                </h1>
            </div>

            <div className="w-full max-w-4xl">
                <LeadForm initialData={lead} leadId={id} />
            </div>
        </div>
    );
}
