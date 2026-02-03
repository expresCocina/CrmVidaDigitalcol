import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-950 text-white selection:bg-blue-500 selection:text-white pt-24">
            <Navbar />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>Última actualización: {new Date().getFullYear()}</p>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Recopilación de Información</h2>
                        <p>Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono y nombre de la empresa cuando solicitas información o utilizas nuestros servicios.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Uso de la Información</h2>
                        <p>Utilizamos la información recopilada para:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Proveer, mantener y mejorar nuestros servicios.</li>
                            <li>Responder a tus comentarios y preguntas.</li>
                            <li>Enviar comunicaciones promocionales (si has dado tu consentimiento).</li>
                            <li>Analizar tendencias y uso para optimizar nuestra web.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Protección de Datos (Habeas Data)</h2>
                        <p>Cumplimos con la normativa colombiana de protección de datos personales. Tienes derecho a conocer, actualizar y rectificar tu información personal en cualquier momento enviando un correo a contacto@vidadigital.col.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Cookies</h2>
                        <p>Utilizamos cookies y tecnologías similares para mejorar la experiencia de usuario y analizar el tráfico del sitio. Puedes configurar tu navegador para rechazar cookies, pero algunas funciones del sitio podrían no funcionar correctamente.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Compartir Información</h2>
                        <p>No vendemos ni alquilamos tu información personal a terceros. Solo compartimos información con proveedores de servicios que nos ayudan a operar nuestro negocio, bajo estrictos acuerdos de confidencialidad.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Seguridad</h2>
                        <p>Tomamos medidas razonables para proteger tu información personal contra pérdida, robo y uso no autorizado.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
