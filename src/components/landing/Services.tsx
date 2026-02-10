"use client";

import Link from "next/link";
import { servicesData } from "@/data/services";
import { ArrowUpRight } from "lucide-react";

const phoneNumber = "573223844821"; // Número de la agencia

// Usamos los datos compartidos
const services = servicesData.map(service => ({
    ...service,
    // Aseguramos que las propiedades visuales extras estén presentes o usamos defaults si faltan en data
    bg: `bg-${service.color}-500/10`,
    border: `border-${service.color}-500/20`,
    color: `text-${service.color}-400`,
    message: service.ctaMessage
}));

export default function Services() {
    return (
        <section id="servicios" className="py-24 bg-gray-900 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Soluciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Integrales</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Todo lo que necesitas para escalar tu negocio en la era digital, en un solo ecosistema.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(service.message)}`;

                        return (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl border ${service.border} bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800 transition-all hover:-translate-y-1 group flex flex-col`}
                            >
                                {/* Enlace absoluto que cubre toda la tarjeta excepto el botón de cotizar */}
                                <Link
                                    href={`/servicios/${service.slug}`}
                                    className="absolute inset-0 z-10"
                                    aria-label={`Ver detalles de ${service.title}`}
                                />

                                <div className={`w-14 h-14 rounded-xl ${service.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-0`}>
                                    <Icon className={`w-7 h-7 ${service.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 relative z-0">{service.title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-6 flex-1 relative z-0">
                                    {service.description}
                                </p>

                                {/* Botón de WhatsApp con z-index mayor para que sea clickeable independientemente */}
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative z-20 inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-gray-700/50 hover:bg-blue-600 text-white font-medium transition-colors group-hover:shadow-lg group-hover:shadow-blue-900/20"
                                >
                                    Cotizar Ahora
                                    <ArrowUpRight className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
