"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ClientForm from "@/components/clientes/ClientForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchClient = async () => {
            const { data, error } = await supabase
                .from("clientes")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching client:", error);
                router.push("/dashboard/clientes");
            } else {
                setClient(data);
            }
            setLoading(false);
        };

        if (id) {
            fetchClient();
        }
    }, [id, router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando información del cliente...</div>;
    }

    if (!client) {
        return <div className="p-8 text-center text-red-500">Cliente no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard/clientes" className="hover:text-blue-600">Clientes</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900 dark:text-white">Editar Cliente</span>
            </nav>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Editar Cliente: {client.nombre}
                </h1>
            </div>

            <div className="w-full max-w-4xl">
                <ClientForm initialData={client} clientId={id} />
            </div>
        </div>
    );
}
