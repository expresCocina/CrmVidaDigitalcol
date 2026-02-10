"use client";

import ClientForm from "@/components/clientes/ClientForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewClientPage() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard/clientes" className="hover:text-blue-600">Clientes</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-medium text-gray-900 dark:text-white">Nuevo Cliente</span>
            </nav>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Nuevo Cliente</h1>
            </div>

            <div className="w-full max-w-4xl">
                <ClientForm />
            </div>
        </div>
    );
}
