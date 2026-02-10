import { createClient } from "@/lib/supabase/server";
import { Check, Sparkles, Phone } from "lucide-react";
import Link from "next/link";

interface Plan {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    caracteristicas: string[];
    destacado: boolean;
}

export default async function PlanesPage() {
    const supabase = await createClient();

    const { data: planes } = await supabase
        .from("planes" as any)
        .select("*")
        .eq("activo", true)
        .order("orden");

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
            <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Vida Digital
                        </Link>
                        <div className="flex items-center space-x-6">
                            <Link href="/servicios" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Servicios
                            </Link>
                            <Link href="/terminos-condiciones" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Términos
                            </Link>
                            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Planes que se adaptan a{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            tu negocio
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                        Desde automatización completa hasta servicios específicos. Elige el plan perfecto para hacer crecer tu presencia digital.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {planes?.map((plan: any) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-8 ${plan.destacado
                                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl scale-105"
                                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
                                    }`}
                            >
                                {plan.destacado && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center">
                                        <Sparkles className="w-4 h-4 mr-1" />
                                        Más Popular
                                    </div>
                                )}

                                <h3 className={`text-2xl font-bold mb-2 ${plan.destacado ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                    {plan.nombre}
                                </h3>
                                <p className={`text-sm mb-6 ${plan.destacado ? "text-blue-100" : "text-gray-600 dark:text-gray-400"}`}>
                                    {plan.descripcion}
                                </p>

                                <div className="mb-6">
                                    <span className={`text-4xl font-bold ${plan.destacado ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                        {formatPrice(plan.precio)}
                                    </span>
                                    <span className={`text-sm ${plan.destacado ? "text-blue-100" : "text-gray-600 dark:text-gray-400"}`}>
                                        /mes
                                    </span>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.caracteristicas?.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${plan.destacado ? "text-green-300" : "text-green-500"}`} />
                                            <span className={`text-sm ${plan.destacado ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="https://wa.me/573102345678?text=Hola,%20me%20interesa%20el%20plan%20de%20Vida%20Digital"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center ${plan.destacado
                                            ? "bg-white text-blue-600 hover:bg-gray-100"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Contactar por WhatsApp
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ¿Necesitas algo personalizado?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Contáctanos y creamos un plan a tu medida
                    </p>
                    <a
                        href="https://wa.me/573102345678?text=Hola,%20necesito%20un%20plan%20personalizado"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Phone className="w-5 h-5 mr-2" />
                        Hablar con un asesor
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="mb-4">© 2026 Vida Digital. Todos los derechos reservados.</p>
                    <div className="flex justify-center space-x-6">
                        <Link href="/terminos-condiciones" className="hover:text-white transition-colors">
                            Términos y Condiciones
                        </Link>
                        <Link href="/servicios" className="hover:text-white transition-colors">
                            Servicios
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
