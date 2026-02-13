import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Services from "@/components/landing/Services";
import PlanesSection from "@/components/landing/PlanesSection";
import ServiciosSection from "@/components/landing/ServiciosSection";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "Inicio",
    description: "CRM Vida Digital Col - Sistema integral para gestión de clientes, ventas, facturas y cotizaciones. Automatiza tu negocio con nuestra solución empresarial.",
    openGraph: {
        title: "CRM Vida Digital Col - Sistema de Gestión Empresarial",
        description: "Sistema integral para gestión de clientes, ventas, facturas y cotizaciones.",
    }
};

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-900 text-white selection:bg-blue-500 selection:text-white">
            <Navbar />
            <Hero />
            <Services />
            <PlanesSection />
            <ServiciosSection />
            <Contact />
            <Footer />
        </main>
    );
}
