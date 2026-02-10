import { servicesData } from "@/data/services";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Esto es necesario para generar las rutas estáticas al hacer build, 
// o simplemente para que Next sepa qué params esperar.
export async function generateStaticParams() {
    return servicesData.map((service) => ({
        slug: service.slug,
    }));
}

const phoneNumber = "573223844821";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const service = servicesData.find((s) => s.slug === slug);

    if (!service) {
        notFound();
    }

    const Icon = service.icon;
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(service.ctaMessage)}`;

    // Mapeo de colores para estilos dinámicos
    const colorClasses: Record<string, string> = {
        purple: "from-purple-600 to-indigo-600 text-purple-400 bg-purple-500/10 border-purple-500/20",
        blue: "from-blue-600 to-cyan-600 text-blue-400 bg-blue-500/10 border-blue-500/20",
        pink: "from-pink-600 to-rose-600 text-pink-400 bg-pink-500/10 border-pink-500/20",
        emerald: "from-emerald-600 to-teal-600 text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        cyan: "from-cyan-600 to-blue-600 text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        yellow: "from-yellow-400 to-orange-500 text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    };

    const theme = colorClasses[service.color] || colorClasses.blue;
    const gradientBg = `bg-gradient-to-r ${theme.split(" ").slice(0, 2).join(" ")}`;
    const iconColor = theme.split(" ")[2]; // e.g., text-purple-400

    return (
        <main className="min-h-screen bg-gray-950 text-white pt-20">
            <Navbar />

            {/* Hero de Servicio */}
            <section className="relative py-20 overflow-hidden">
                <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${gradientBg} opacity-10 rounded-full blur-[120px] -z-10`} />
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-8 ${theme.split(" ").slice(3).join(" ")} backdrop-blur-sm`}>
                            <Icon className={`w-12 h-12 ${iconColor}`} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.title}</h1>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">{service.subtitle}</p>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                            {service.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Características y Beneficios */}
            <section className="py-16 bg-gray-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">

                        {/* Features List */}
                        <div>
                            <h2 className="text-3xl font-bold mb-8">Lo que incluimos</h2>
                            <ul className="space-y-6">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                        <div className={`mt-1 mr-4 p-1 rounded-full ${iconColor} bg-white/5`}>
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-300 text-lg">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* High Impact Card */}
                        <div className={`p-8 rounded-3xl border border-gray-800 bg-gray-900 relative overflow-hidden group hover:shadow-2xl hover:shadow-${service.color}-900/20 transition-all`}>
                            <div className={`absolute inset-0 ${gradientBg} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-6">¿Por qué elegirnos?</h3>
                                <ul className="space-y-4 mb-10">
                                    {service.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-center text-gray-300">
                                            <ArrowRight className={`w-5 h-5 mr-3 ${iconColor}`} />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-4">
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full py-4 text-center rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${gradientBg}`}
                                    >
                                        <MessageCircle className="w-6 h-6" />
                                        Cotizar este Servicio
                                    </a>
                                    <p className="text-center text-sm text-gray-500">
                                        Respuesta inmediata garantizada
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Strip */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">¿Listo para llevar tu negocio al siguiente nivel?</h2>
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
                    >
                        Contactar Soporte de Ventas
                        <MessageCircle className="ml-2 w-5 h-5" />
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
