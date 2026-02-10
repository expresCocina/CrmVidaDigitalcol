import { createClient } from "@/lib/supabase/server";
import { Package, DollarSign } from "lucide-react";
import Link from "next/link";

interface Servicio {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: string;
    unidad: string;
}

export default async function ServiciosPage() {
    const supabase = await createClient();

    const { data: servicios } = await supabase
        .from("servicios" as any)
        .select("*")
        .eq("activo", true)
        .order("categoria, precio");

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Agrupar servicios por categoría
    const serviciosPorCategoria = servicios?.reduce((acc: any, servicio: any) => {
        const cat = servicio.categoria || 'otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(servicio);
        return acc;
    }, {});

    const categoriasNombres: Record<string, string> = {
        web: 'Desarrollo Web',
        crm: 'CRM y Gestión',
        contenido: 'Contenido Digital',
        video: 'Producción de Video',
        diseño: 'Diseño Gráfico',
        social: 'Redes Sociales',
        asesoría: 'Asesoría y Capacitación',
        otros: 'Otros Servicios'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
            <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Vida Digital
                        </Link>
                        <div className="flex items-center space-x-6">
                            <Link href="/planes" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Planes
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
                        Catálogo de{" "}
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Servicios
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                        Servicios individuales para complementar tu plan o contratar de forma independiente
                    </p>
                </div>
            </section>

            {/* Servicios por Categoría */}
            <section className="pb-20 px-4">
                <div className="max-w-7xl mx-auto space-y-16">
                    {Object.entries(serviciosPorCategoria || {}).map(([categoria, servicios]: [string, any]) => (
                        <div key={categoria}>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                                <Package className="w-8 h-8 mr-3 text-purple-600" />
                                {categoriasNombres[categoria] || categoria}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {servicios.map((servicio: any) => (
                                    <div
                                        key={servicio.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                                    >
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {servicio.nombre}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            {servicio.descripcion}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                    <DollarSign className="w-5 h-5" />
                                                    {formatPrice(servicio.precio)}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                    {servicio.unidad}
                                                </span>
                                            </div>
                                            <a
                                                href={`https://wa.me/573102345678?text=Hola,%20me%20interesa%20el%20servicio:%20${encodeURIComponent(servicio.nombre)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                                            >
                                                Cotizar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        ¿Prefieres un paquete completo?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Revisa nuestros planes todo incluido
                    </p>
                    <Link
                        href="/planes"
                        className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        Ver Planes
                    </Link>
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
                        <Link href="/planes" className="hover:text-white transition-colors">
                            Planes
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
