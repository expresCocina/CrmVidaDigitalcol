import { createClient } from "@/lib/supabase/server";
import { Package, DollarSign, ArrowUpRight } from "lucide-react";

export default async function ServiciosSection() {
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

    const categoriasColores: Record<string, string> = {
        web: 'from-blue-500 to-cyan-500',
        crm: 'from-purple-500 to-pink-500',
        contenido: 'from-green-500 to-emerald-500',
        video: 'from-red-500 to-orange-500',
        diseño: 'from-yellow-500 to-amber-500',
        social: 'from-indigo-500 to-blue-500',
        asesoría: 'from-teal-500 to-cyan-500',
        otros: 'from-gray-500 to-slate-500'
    };

    const phoneNumber = "573223844821";

    // Mostrar solo las primeras 6 servicios más destacados
    const serviciosDestacados = servicios?.slice(0, 6) || [];

    return (
        <section id="servicios-catalogo" className="py-24 bg-gray-800/50 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Servicios{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Individuales
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Complementa tu plan o contrata servicios específicos según tus necesidades
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviciosDestacados.map((servicio: any) => {
                        const gradiente = categoriasColores[servicio.categoria] || categoriasColores.otros;

                        return (
                            <div
                                key={servicio.id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradiente} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                                        {servicio.categoria}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">
                                    {servicio.nombre}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                    {servicio.descripcion}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                    <div>
                                        <div className="flex items-center text-2xl font-bold text-purple-400">
                                            <DollarSign className="w-5 h-5" />
                                            {formatPrice(servicio.precio)}
                                        </div>
                                        <span className="text-xs text-gray-500 capitalize">
                                            {servicio.unidad}
                                        </span>
                                    </div>
                                    <a
                                        href={`https://wa.me/${phoneNumber}?text=Hola,%20me%20interesa%20el%20servicio:%20${encodeURIComponent(servicio.nombre)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold flex items-center"
                                    >
                                        Cotizar
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-12">
                    <a
                        href="/servicios"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/30"
                    >
                        Ver Catálogo Completo
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
