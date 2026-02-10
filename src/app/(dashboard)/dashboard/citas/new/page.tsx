import AppointmentForm from "@/components/appointments/AppointmentForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewAppointmentPage() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard/citas" className="hover:text-gray-700 dark:hover:text-gray-200 flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Citas
                </Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-white">Nueva Cita</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Cita</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Programa una nueva reunión o llamada
                </p>
            </div>

            {/* Form */}
            <AppointmentForm />
        </div>
    );
}
