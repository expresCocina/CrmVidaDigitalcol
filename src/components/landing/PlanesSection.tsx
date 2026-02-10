import { createClient } from "@/lib/supabase/server";
import { Check, Sparkles, Phone } from "lucide-react";

export default async function PlanesSection() {
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

    const phoneNumber = "573223844821";

    return (
        <section id="planes" className="py-24 bg-gray-900 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Planes que Impulsan{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            tu Crecimiento
                        </span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Desde automatización completa hasta servicios específicos. Elige el plan perfecto para hacer crecer tu presencia digital.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {planes?.map((plan: any) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl p-6 lg:p-8 transition-all hover:-translate-y-2 ${plan.destacado
                                    ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-900/50 scale-105"
                                    : "bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/20"
                                }`}
                        >
                            {plan.destacado && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg">
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Más Popular
                                </div>
                            )}

                            <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${plan.destacado ? "text-white" : "text-white"}`}>
                                {plan.nombre}
                            </h3>
                            <p className={`text-sm mb-6 ${plan.destacado ? "text-blue-100" : "text-gray-400"}`}>
                                {plan.descripcion}
                            </p>

                            <div className="mb-6">
                                <span className={`text-3xl lg:text-4xl font-bold ${plan.destacado ? "text-white" : "text-white"}`}>
                                    {formatPrice(plan.precio)}
                                </span>
                                <span className={`text-sm ml-1 ${plan.destacado ? "text-blue-100" : "text-gray-400"}`}>
                                    /mes
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.caracteristicas?.slice(0, 5).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-sm">
                                        <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${plan.destacado ? "text-green-300" : "text-green-400"}`} />
                                        <span className={plan.destacado ? "text-white" : "text-gray-300"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                                {plan.caracteristicas?.length > 5 && (
                                    <li className={`text-sm italic ${plan.destacado ? "text-blue-100" : "text-gray-500"}`}>
                                        +{plan.caracteristicas.length - 5} más...
                                    </li>
                                )}
                            </ul>

                            <a
                                href={`https://wa.me/${phoneNumber}?text=Hola,%20me%20interesa%20el%20${encodeURIComponent(plan.nombre)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center ${plan.destacado
                                        ? "bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Contactar
                            </a>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <a
                        href="/planes"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Ver todos los detalles
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
