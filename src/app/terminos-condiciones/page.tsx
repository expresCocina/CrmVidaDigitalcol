import { FileText, AlertCircle, CheckCircle, DollarSign, Shield } from "lucide-react";
import Link from "next/link";

export default function TerminosCondicionesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                            <Link href="/servicios" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Servicios
                            </Link>
                            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center">
                    <FileText className="w-16 h-16 text-white mx-auto mb-6" />
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Términos y Condiciones
                    </h1>
                    <p className="text-xl text-blue-100">
                        Políticas de trabajo y condiciones del servicio
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Propuesta Creativa */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-start mb-4">
                            <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Propuesta Creativa
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Antes de la realización de cualquier diseño o video, se presentará una <strong>propuesta creativa o conceptual</strong> que será revisada y aprobada de manera conjunta entre el cliente y el diseñador, con el fin de definir la versión final del proyecto.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ajustes y Cambios */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-start mb-4">
                            <AlertCircle className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Ajustes y Modificaciones
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    Los ajustes solicitados deberán ser <strong>mínimos</strong>. En caso de requerirse cambios extensos que impliquen rehacer el diseño o el video, estos generarán un <strong>costo adicional</strong>.
                                </p>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <strong>Importante:</strong> Una vez el equipo de trabajo inicie actividades como diseño, edición, desarrollo creativo o definición de estrategias, <strong>no se realizarán devoluciones de dinero bajo ninguna circunstancia</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Condiciones de Pago */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="flex items-start mb-4">
                            <DollarSign className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Condiciones de Pago
                                </h2>
                                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="leading-relaxed">
                                            Para el inicio del proyecto se requiere un <strong>anticipo del 50%</strong> del valor total del servicio.
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="leading-relaxed">
                                            Los creativos y estrategias serán entregados una vez se complete esta primera fase.
                                        </p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <p className="leading-relaxed">
                                            Para la entrega final del proyecto, el cliente deberá realizar el pago del <strong>100% del valor acordado</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Política de Respeto */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 border border-red-200 dark:border-red-800 shadow-lg">
                        <div className="flex items-start mb-4">
                            <Shield className="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    Política de Respeto Profesional
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Es importante aclarar que <strong>cualquier falta de respeto hacia el equipo de trabajo</strong> dará lugar a la <strong>terminación inmediata de la relación comercial</strong>. En dicho caso, el proyecto se considerará cerrado sin pendientes por parte de nuestro equipo.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                        <h3 className="text-2xl font-bold mb-4">Resumen de Condiciones</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>Propuesta creativa aprobada antes de iniciar</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>Ajustes mínimos incluidos, cambios extensos tienen costo adicional</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>50% de anticipo para iniciar, 100% para entrega final</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>No hay devoluciones una vez iniciado el trabajo</span>
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>Respeto mutuo es fundamental para la relación comercial</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        ¿Tienes alguna pregunta?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Estamos aquí para ayudarte
                    </p>
                    <a
                        href="https://wa.me/573102345678?text=Hola,%20tengo%20una%20pregunta%20sobre%20los%20términos%20y%20condiciones"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                    >
                        Contactar por WhatsApp
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="mb-4">© 2026 Vida Digital. Todos los derechos reservados.</p>
                    <div className="flex justify-center space-x-6">
                        <Link href="/planes" className="hover:text-white transition-colors">
                            Planes
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
