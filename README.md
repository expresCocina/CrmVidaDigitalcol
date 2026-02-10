# CRM Vida Digital Col

Sistema CRM completo y funcional para Vida Digital Col con gestión de leads, clientes, citas, mensajería omnicanal (WhatsApp), módulo de IA con OpenAI, reportes y analíticas.

## 🚀 Características

### ✅ Gestión de Leads y Clientes
- Captura automática de leads desde múltiples fuentes (WhatsApp, Web, Redes Sociales)
- Pipeline de ventas visual con etapas personalizables
- Calificación automática de leads con IA
- Conversión de leads a clientes
- Historial completo de interacciones

### ✅ Mensajería Omnicanal
- Integración con WhatsApp Business API
- Bandeja de entrada unificada
- Respuestas automáticas con IA
- Plantillas de mensajes
- Historial de conversaciones

### ✅ Inteligencia Artificial
- Asistente de ventas con OpenAI GPT-4
- Clasificación automática de leads (caliente/tibio/frío)
- Análisis de sentimiento
- Sugerencias de respuestas
- Resúmenes de conversaciones

### ✅ Gestión de Citas
- Calendario integrado
- Recordatorios automáticos
- Sincronización con disponibilidad
- Citas presenciales y virtuales

### ✅ Reportes y Analíticas
- Dashboard con métricas en tiempo real
- Reportes personalizados
- Gráficos interactivos
- Exportación de datos

### ✅ Seguridad
- Autenticación con Supabase Auth
- Row Level Security (RLS)
- Roles y permisos
- Encriptación de datos sensibles

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita o pro)
- API Key de OpenAI
- WhatsApp Business API configurada (opcional)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd C:\Users\Cristhian S\.gemini\antigravity\scratch\crm-vida-digital
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local` y completa las variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# OpenAI
OPENAI_API_KEY=sk-tu-api-key-aqui

# WhatsApp Business API (opcional)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=tu-whatsapp-token-aqui
WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id-aqui
WHATSAPP_VERIFY_TOKEN=tu-verify-token-personalizado

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Configurar Supabase

#### 4.1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y las API keys

#### 4.2. Ejecutar migraciones SQL

1. Ve al SQL Editor en Supabase
2. Ejecuta los siguientes archivos en orden:
   - `supabase/migrations/20260130_initial_schema.sql`
   - `supabase/migrations/20260130_rls_policies.sql`
   - `supabase/migrations/20260130_functions.sql`

#### 4.3. Desplegar Edge Functions

Instala Supabase CLI:

```bash
npm install -g supabase
```

Inicia sesión:

```bash
supabase login
```

Vincula tu proyecto:

```bash
supabase link --project-ref tu-project-ref
```

Despliega las funciones:

```bash
supabase functions deploy whatsapp-inbound
supabase functions deploy whatsapp-outbound
supabase functions deploy ai-assistant
```

Configura los secretos:

```bash
supabase secrets set OPENAI_API_KEY=sk-tu-api-key
supabase secrets set WHATSAPP_ACCESS_TOKEN=tu-token
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=tu-phone-id
supabase secrets set WHATSAPP_VERIFY_TOKEN=tu-verify-token
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📱 Configurar WhatsApp Business API

### 1. Crear App en Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una nueva app
3. Agrega el producto "WhatsApp"
4. Configura un número de teléfono de prueba

### 2. Configurar Webhook

URL del webhook:
```
https://tu-proyecto.supabase.co/functions/v1/whatsapp-inbound
```

Verify Token: (el que configuraste en `WHATSAPP_VERIFY_TOKEN`)

Eventos a suscribir:
- `messages`

### 3. Obtener credenciales

- **Access Token**: En la sección de WhatsApp > API Setup
- **Phone Number ID**: En la sección de WhatsApp > API Setup

## 🤖 Configurar OpenAI

1. Crea una cuenta en [platform.openai.com](https://platform.openai.com)
2. Genera una API key
3. Agrégala a tu `.env.local`

## 🗄️ Estructura del Proyecto

```
crm-vida-digital/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Páginas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/      # Páginas del dashboard
│   │   │   ├── dashboard/    # Dashboard principal
│   │   │   ├── leads/        # Gestión de leads
│   │   │   ├── clientes/     # Gestión de clientes
│   │   │   ├── citas/        # Calendario de citas
│   │   │   ├── mensajes/     # Mensajería omnicanal
│   │   │   ├── ia/           # Configuración de IA
│   │   │   ├── reportes/     # Reportes y analíticas
│   │   │   └── configuracion/ # Configuración
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── leads/            # Componentes de leads
│   │   ├── clientes/         # Componentes de clientes
│   │   ├── citas/            # Componentes de citas
│   │   ├── mensajes/         # Componentes de mensajería
│   │   ├── ia/               # Componentes de IA
│   │   └── ui/               # Componentes UI reutilizables
│   ├── lib/
│   │   ├── supabase/         # Clientes de Supabase
│   │   └── utils.ts          # Utilidades
│   └── types/
│       └── database.types.ts # Tipos de TypeScript
├── supabase/
│   ├── functions/            # Edge Functions
│   │   ├── whatsapp-inbound/
│   │   ├── whatsapp-outbound/
│   │   └── ai-assistant/
│   └── migrations/           # Migraciones SQL
│       ├── 20260130_initial_schema.sql
│       ├── 20260130_rls_policies.sql
│       └── 20260130_functions.sql
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚢 Deployment

### Vercel (Recomendado para Frontend)

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Despliega:
```bash
vercel
```

3. Configura las variables de entorno en Vercel Dashboard

### Supabase (Backend ya está desplegado)

Las Edge Functions ya están desplegadas en Supabase. Solo necesitas:
1. Configurar los secretos (ya hecho en instalación)
2. Verificar que las funciones estén activas

## 📚 Uso

### Crear un Lead

1. Ve a Dashboard > Leads
2. Click en "Nuevo Lead"
3. Completa el formulario
4. El lead aparecerá en la lista

### Gestionar Conversaciones de WhatsApp

1. Los mensajes entrantes se crean automáticamente como leads
2. Ve a Dashboard > Mensajes
3. Selecciona una conversación
4. Responde directamente o usa plantillas
5. La IA puede sugerir respuestas automáticas

### Ver Reportes

1. Ve a Dashboard > Reportes
2. Selecciona el rango de fechas
3. Visualiza métricas y gráficos
4. Exporta datos si es necesario

## 🔧 Personalización

### Agregar nuevos roles

Edita la tabla `roles` en Supabase:

```sql
INSERT INTO roles (nombre, descripcion, permisos) VALUES
  ('Nuevo Rol', 'Descripción', '["permiso1", "permiso2"]'::jsonb);
```

### Personalizar prompts de IA

1. Ve a Dashboard > IA
2. Edita los prompts del sistema
3. Guarda cambios

### Agregar nuevas fuentes de leads

```sql
INSERT INTO fuentes_leads (nombre, descripcion) VALUES
  ('Nueva Fuente', 'Descripción de la fuente');
```

## 🐛 Solución de Problemas

### Error de autenticación

- Verifica que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
- Revisa que las políticas RLS estén activas

### WhatsApp no recibe mensajes

- Verifica que el webhook esté configurado correctamente
- Revisa los logs de la Edge Function `whatsapp-inbound`
- Confirma que el `WHATSAPP_VERIFY_TOKEN` coincida

### IA no responde

- Verifica que `OPENAI_API_KEY` esté configurada
- Revisa los logs de la Edge Function `ai-assistant`
- Confirma que tengas créditos en OpenAI

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para Vida Digital Col.

## 👥 Soporte

Para soporte técnico, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para Vida Digital Col**
