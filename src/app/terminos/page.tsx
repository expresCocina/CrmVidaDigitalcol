import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-gray-950 text-white selection:bg-blue-500 selection:text-white pt-24">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>Última actualización: {new Date().getFullYear()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Introducción</h2>
                        <p>Bienvenido a Vida Digital Col. Al acceder a nuestro sitio web y utilizar nuestros servicios, aceptas cumplir y estar sujeto a los siguientes términos y condiciones.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Servicios</h2>
                        <p>Vida Digital Col ofrece servicios de marketing digital, desarrollo de software, inteligencia artificial y automatización. Nos reservamos el derecho de modificar o discontinuar cualquier servicio en cualquier momento.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Propiedad Intelectual</h2>
                        <p>Todo el contenido, diseños, logotipos y código fuente desarrollados por Vida Digital Col son propiedad exclusiva de la agencia, a menos que se estipule lo contrario en un contrato específico con el cliente.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Pagos y Facturación</h2>
                        <p>Los pagos por nuestros servicios se realizarán según lo acordado en la propuesta comercial o contrato. Nos reservamos el derecho de suspender servicios por falta de pago.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Limitación de Responsabilidad</h2>
                        <p>Vida Digital Col no será responsable por daños indirectos, incidentales o consecuentes que surjan del uso de nuestros servicios o la imposibilidad de usarlos.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Ley Aplicable</h2>
                        <p>Estos términos se rigen e interpretan de acuerdo con las leyes de la República de Colombia.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Contacto</h2>
                        <p>Si tienes preguntas sobre estos términos, contáctanos en contacto@vidadigital.col.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
