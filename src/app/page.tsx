import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import Services from "@/components/landing/Services";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-900 text-white selection:bg-blue-500 selection:text-white">
            <Navbar />
            <Hero />
            <Services />
            <Contact />
            <Footer />
        </main>
    );
}
