import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-900 text-gray-400 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-4">Vida Digital Col</h2>
                        <p className="max-w-xs mb-4">
                            Transformamos negocios a través de soluciones digitales innovadoras, inteligencia artificial y estrategias de marketing efectivas.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Servicios</h3>
                        <ul className="space-y-2">
                            <li><Link href="/planes" className="hover:text-blue-400 transition-colors">Planes</Link></li>
                            <li><Link href="/servicios" className="hover:text-blue-400 transition-colors">Catálogo de Servicios</Link></li>
                            <li><Link href="#servicios" className="hover:text-blue-400 transition-colors">Soluciones</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Compañía</h3>
                        <ul className="space-y-2">
                            <li><Link href="#contacto" className="hover:text-blue-400 transition-colors">Contacto</Link></li>
                            <li><Link href="/terminos-condiciones" className="hover:text-blue-400 transition-colors">Términos y Condiciones</Link></li>
                            <li><Link href="/login" className="hover:text-blue-400 transition-colors">Acceso CRM</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <div className="flex flex-col items-center md:items-start">
                        <p>&copy; {new Date().getFullYear()} Vida Digital Col. Todos los derechos reservados.</p>
                        <p className="text-gray-600 mt-2 flex items-center">
                            Hecho con <span className="text-red-500 mx-1">❤</span> por <a href="https://wa.me/573138537261" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white ml-1 transition-colors">Renting AMC Agency</a>
                        </p>
                    </div>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/terminos-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                        <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
