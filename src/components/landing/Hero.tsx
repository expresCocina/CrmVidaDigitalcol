"use client";

import Link from "next/link";
import { ArrowRight, Bot, Rocket, Code2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const useTypewriter = (text: string, speed: number = 50, startDelay: number = 0) => {
    const [displayText, setDisplayText] = useState("");
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayText((prev) => text.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(timer);
                    setIsFinished(true);
                }
            }, speed);

            return () => clearInterval(timer);
        }, startDelay);

        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return { displayText, isFinished };
};

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "", start }: { end: number, duration?: number, prefix?: string, suffix?: string, start: boolean }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;

        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (easeOutExpo) for smooth effect
            const easeOut = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

            setCount(Math.floor(easeOut(progress) * end));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [end, duration, start]);

    return <span>{prefix}{count}{suffix}</span>;
}

export default function Hero() {
    const line1 = "El Futuro de tu";
    const line2 = "Negocio es Hoy";

    // Velocidad ajustada
    const { displayText: text1, isFinished: finished1 } = useTypewriter(line1, 70, 100);
    const { displayText: text2, isFinished: finished2 } = useTypewriter(line2, 70, 100 + (line1.length * 70) + 300);

    return (
        <section className="relative overflow-hidden bg-gray-950 min-h-screen flex items-center justify-center pt-24 md:pt-20">
            {/* Professional Background */}
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Gradient Blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-10 mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10 opacity-60" />

            <div className="container mx-auto px-4 relative z-10 text-center">

                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1 mb-8 rounded-full border border-blue-500/20 bg-blue-500/10 backdrop-blur-sm animate-fade-in">
                    <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                    <span className="text-sm font-medium text-blue-300">Innovación Digital para Empresas</span>
                </div>

                {/* Headline con Typewriter */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-1.1 min-h-[160px] md:min-h-[220px]">
                    <span className="inline-block">
                        {text1}
                        {!finished1 && <span className="animate-pulse ml-1 text-blue-500 inline-block align-middle h-[0.8em] w-1 bg-blue-500" />}
                    </span>
                    <br className="hidden md:block" />
                    <span className="relative inline-block mt-2 md:mt-0">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            {text2}
                        </span>

                        {(finished1 && !finished2) && (
                            <span className="animate-pulse ml-1 inline-block align-middle h-[0.8em] w-1 bg-purple-400" />
                        )}

                        <Sparkles
                            className={`absolute -top-6 -right-8 text-yellow-400 w-8 h-8 animate-bounce transition-all duration-700 ${finished2 ? 'opacity-80 scale-100' : 'opacity-0 scale-0'}`}
                        />
                    </span>
                </h1>

                {/* Subheadline */}
                <div className={`transition-all duration-1000 ${finished2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                        Transformamos empresas con <strong>Estrategias de Marketing</strong>, <strong>Software a Medida</strong> e <strong>Inteligencia Artificial</strong>. Escalabilidad real, resultados medibles.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://wa.me/573223844821?text=Hola,%20quiero%20acelerar%20el%20crecimiento%20de%20mi%20negocio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            <Rocket className="w-5 h-5 mr-2 text-blue-600" />
                            Acelerar Crecimiento
                        </a>
                        <Link
                            href="#servicios"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white border border-gray-800 rounded-full font-semibold text-lg hover:bg-gray-800 hover:border-gray-700 transition-all hover:scale-105 flex items-center justify-center"
                        >
                            Ver Soluciones
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>

                {/* Metrics / Trust Indicators */}
                <div className={`mt-20 pt-10 border-t border-gray-800/50 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 delay-500 ${finished2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="p-4 rounded-xl hover:bg-gray-900/50 transition-colors">
                        <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">
                            <AnimatedCounter end={500} prefix="+" suffix="%" start={finished2} />
                        </h4>
                        <p className="text-gray-500 text-sm font-medium">ROI Promedio</p>
                    </div>
                    <div className="p-4 rounded-xl hover:bg-gray-900/50 transition-colors">
                        <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">24/7</h4>
                        <p className="text-gray-500 text-sm font-medium">Soporte IA</p>
                    </div>
                    <div className="p-4 rounded-xl hover:bg-gray-900/50 transition-colors">
                        <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">
                            <AnimatedCounter end={100} suffix="%" start={finished2} />
                        </h4>
                        <p className="text-gray-500 text-sm font-medium">Personalizado</p>
                    </div>
                    <div className="p-4 rounded-xl hover:bg-gray-900/50 transition-colors">
                        <h4 className="text-3xl font-bold text-white mb-1 tracking-tight">Global</h4>
                        <p className="text-gray-500 text-sm font-medium">Alcance</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
