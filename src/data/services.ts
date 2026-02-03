import { Bot, Code2, LineChart, MessageSquare, Zap, Globe } from "lucide-react";

export const servicesData = [
    {
        slug: "inteligencia-artificial",
        icon: Bot,
        title: "Inteligencia Artificial Corporativa",
        subtitle: "Automatiza, Predice y Escala",
        description: "Transformamos tu empresa integrando soluciones de IA que no solo responden preguntas, sino que ejecutan acciones. Desde chatbots que cierran ventas hasta algoritmos que predicen tendencias de mercado.",
        features: [
            "Chatbots entrenados con tu propia data (RAG).",
            "Automatización de atención al cliente 24/7.",
            "Análisis de sentimientos en conversaciones.",
            "Generación de contenido automático para marketing."
        ],
        benefits: [
            "Reducción del 70% en costos operativos de soporte.",
            "Incremento en la tasa de conversión por respuesta inmediata.",
            "Disponibilidad total sin pausas ni descansos."
        ],
        ctaMessage: "Hola, quiero cotizar una solución de Inteligencia Artificial para mi empresa.",
        color: "purple"
    },
    {
        slug: "marketing-digital",
        icon: LineChart,
        title: "Marketing Digital & Growth",
        subtitle: "Estrategias que traen Retorno de Inversión (ROI)",
        description: "No hacemos 'posteo', hacemos estrategias de crecimiento. Utilizamos datos, experimentación rápida y canales digitales para escalar tus ventas de manera predecible.",
        features: [
            "Gestión de campañas en Meta Ads y Google Ads.",
            "Estrategias de SEO Técnico y de Contenidos.",
            "Email Marketing automatizado.",
            "Creación de Funnels de Venta de alta conversión."
        ],
        benefits: [
            "Campañas optimizadas para conversión, no solo likes.",
            "Reportes transparentes en tiempo real.",
            "Escalabilidad controlada de tu presupuesto publicitario."
        ],
        ctaMessage: "Hola, quiero escalar mis ventas con una estrategia de Marketing Digital.",
        color: "blue"
    },
    {
        slug: "desarrollo-software",
        icon: Code2,
        title: "Desarrollo de Software a Medida",
        subtitle: "Construimos el motor digital de tu negocio",
        description: "Desarrollamos soluciones robustas, seguras y escalables. Ya sea una plataforma SaaS, una aplicación móvil o un sistema interno, creamos software que se adapta a ti, no al revés.",
        features: [
            "Desarrollo de Aplicaciones Web (React, Next.js).",
            "Aplicaciones Móviles Nativas e Híbridas.",
            "Desarrollo de APIs y Microservicios.",
            "Sistemas de Gestión Empresarial (ERP/CRM) personalizados."
        ],
        benefits: [
            "Software propiedad 100% de tu empresa.",
            "Arquitectura diseñada para soportar alto tráfico.",
            "Seguridad de nivel bancario para tus datos."
        ],
        ctaMessage: "Hola, tengo un proyecto de software y necesito asesoría técnica.",
        color: "pink"
    },
    {
        slug: "chat-centers-crm",
        icon: MessageSquare,
        title: "Chat Center & CRM Omnicanal",
        subtitle: "Centraliza WhatsApp, Instagram y Facebook",
        description: "Deja de perder ventas por mensajes no respondidos. Nuestra plataforma unifica todos tus canales de chat en una sola bandeja de entrada compartida para todo tu equipo.",
        features: [
            "Bandeja de entrada unificada (WhatsApp, IG, FB).",
            "Asignación automática de conversaciones a agentes.",
            "Respuestas rápidas y automatizadas.",
            "Integración nativa con tu base de datos de clientes."
        ],
        benefits: [
            "Control total sobre la comunicación de tu equipo.",
            "Eliminación de tiempos muertos de respuesta.",
            "Visibilidad completa del pipeline de ventas por chat."
        ],
        ctaMessage: "Hola, quiero implementar el Chat Center y CRM en mi empresa.",
        color: "emerald"
    },
    {
        slug: "sitios-web",
        icon: Globe,
        title: "Diseño Web Premium",
        subtitle: "Webs que venden, no solo adornan",
        description: "El diseño web ha evolucionado. Creamos experiencias digitales inmersivas, rápidas y optimizadas para convertir visitantes en clientes potenciales desde el primer segundo.",
        features: [
            "Diseño UX/UI de alto impacto visual.",
            "Optimización extrema de velocidad (Core Web Vitals).",
            "Responsive Design perfecto en móviles.",
            "Integración con herramientas de analítica y pixeles."
        ],
        benefits: [
            "Primera impresión inolvidable para tus clientes.",
            "Mejor posicionamiento en Google por rendimiento.",
            "Estructura orientada 100% a la conversión."
        ],
        ctaMessage: "Hola, quiero renovar mi sitio web con un diseño premium.",
        color: "cyan"
    },
    {
        slug: "automatizacion",
        icon: Zap,
        title: "Automatización de Procesos",
        subtitle: "Deja que los robots hagan el trabajo aburrido",
        description: "Conectamos tus aplicaciones (Gmail, Trello, Slack, WhatsApp, Excel) para crear flujos de trabajo automáticos que ahorran cientos de horas hombre al mes.",
        features: [
            "Integraciones complejas con Zapier / Make (Integromat).",
            "Automatización de facturación y cobranza.",
            "Sincronización de datos entre plataformas.",
            "Alertas y notificaciones automáticas para tu equipo."
        ],
        benefits: [
            "Reducción de errores humanos a cero.",
            "Ahorro masivo de tiempo en tareas repetitivas.",
            "Tu equipo se enfoca en estrategias, no en carpintería."
        ],
        ctaMessage: "Hola, quiero automatizar los procesos operativos de mi negocio.",
        color: "yellow"
    }
];
