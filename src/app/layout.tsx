import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MetaPixel from "@/components/analytics/MetaPixel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "CRM Vida Digital Col - Sistema de Gestión Empresarial",
        template: "%s | CRM Vida Digital Col"
    },
    description: "Sistema CRM completo para gestión de clientes, ventas, facturas y cotizaciones. Automatiza tu negocio con nuestro software de gestión empresarial integral.",
    keywords: [
        "CRM",
        "sistema de gestión",
        "gestión de clientes",
        "facturas",
        "cotizaciones",
        "ventas",
        "CRM Colombia",
        "software empresarial",
        "automatización",
        "Vida Digital"
    ],
    authors: [{ name: "Vida Digital Col" }],
    creator: "Vida Digital Col",
    publisher: "Vida Digital Col",
    metadataBase: new URL("https://crm-vida-digitalcol.vercel.app"),
    alternates: {
        canonical: "/"
    },
    openGraph: {
        type: "website",
        locale: "es_CO",
        url: "https://crm-vida-digitalcol.vercel.app",
        title: "CRM Vida Digital Col - Sistema de Gestión Empresarial",
        description: "Sistema CRM completo para gestión de clientes, ventas, facturas y cotizaciones. Automatiza tu negocio con nuestro software de gestión empresarial integral.",
        siteName: "CRM Vida Digital Col",
        images: [
            {
                url: "/og-image.svg",
                width: 1200,
                height: 630,
                alt: "CRM Vida Digital Col"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "CRM Vida Digital Col - Sistema de Gestión Empresarial",
        description: "Sistema CRM completo para gestión de clientes, ventas, facturas y cotizaciones.",
        images: ["/og-image.svg"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                {/* AMC Agency Web Protection */}
                <Script 
                    src="https://amcagencyweb.com/api/protect?domain=crm-vida-digitalcol.vercel.app"
                    strategy="afterInteractive"
                />
            </head>
            <body className={inter.className}>
                <AuthProvider>
                    <MetaPixel />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
