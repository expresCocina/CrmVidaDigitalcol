# Guía de Deployment - CRM Vida Digital Col

Esta guía te llevará paso a paso para desplegar el CRM completo en producción.

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta de Supabase (gratuita o pro)
- [ ] Cuenta de Vercel (gratuita)
- [ ] API Key de OpenAI
- [ ] WhatsApp Business API configurada (opcional)
- [ ] Git instalado
- [ ] Node.js 18+ instalado

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Click en "New Project"
3. Completa:
   - **Name**: CRM Vida Digital
   - **Database Password**: (guarda esta contraseña de forma segura)
   - **Region**: South America (São Paulo) - más cercano a Colombia
4. Click en "Create new project"
5. Espera 2-3 minutos mientras se crea el proyecto

### 1.2 Obtener Credenciales

1. Ve a **Settings** > **API**
2. Copia y guarda:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Mantén esto secreto)

### 1.3 Ejecutar Migraciones SQL

1. Ve a **SQL Editor** en el panel de Supabase
2. Click en "New query"
3. Copia y pega el contenido de `supabase/migrations/20260130_initial_schema.sql`
4. Click en "Run"
5. Espera a que termine (puede tomar 1-2 minutos)
6. Repite para:
   - `20260130_rls_policies.sql`
   - `20260130_functions.sql`

### 1.4 Verificar Tablas

1. Ve a **Table Editor**
2. Deberías ver todas las tablas creadas:
   - usuarios, roles, leads, clientes, conversaciones, mensajes, citas, etc.
3. Ve a la tabla `roles` y verifica que hay 4 roles creados

### 1.5 Desplegar Edge Functions

Instala Supabase CLI:

```bash
npm install -g supabase
```

Inicia sesión:

```bash
supabase login
```

Vincula tu proyecto (reemplaza `xxxxx` con tu Project Reference ID):

```bash
cd C:\Users\Cristhian S\.gemini\antigravity\scratch\crm-vida-digital
supabase link --project-ref xxxxx
```

Despliega las funciones:

```bash
supabase functions deploy whatsapp-inbound
supabase functions deploy whatsapp-outbound
supabase functions deploy ai-assistant
```

Configura los secretos (reemplaza con tus valores reales):

```bash
supabase secrets set OPENAI_API_KEY=sk-tu-api-key-real
supabase secrets set WHATSAPP_ACCESS_TOKEN=tu-token-real
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=tu-phone-id-real
supabase secrets set WHATSAPP_VERIFY_TOKEN=mi-token-secreto-123
```

Verifica que las funciones estén desplegadas:

```bash
supabase functions list
```

## 🌐 Paso 2: Desplegar Frontend en Vercel

### 2.1 Preparar el Proyecto

1. Crea un repositorio en GitHub (si no lo has hecho):

```bash
cd C:\Users\Cristhian S\.gemini\antigravity\scratch\crm-vida-digital
git init
git add .
git commit -m "Initial commit - CRM Vida Digital"
git branch -M main
git remote add origin https://github.com/tu-usuario/crm-vida-digital.git
git push -u origin main
```

### 2.2 Desplegar en Vercel

**Opción A: Desde la Web**

1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New..." > "Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Agrega las variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
OPENAI_API_KEY=sk-tu-api-key
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

6. Click en "Deploy"
7. Espera 2-3 minutos

**Opción B: Desde CLI**

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las instrucciones y agrega las variables de entorno cuando se te solicite.

### 2.3 Configurar Dominio (Opcional)

1. En Vercel Dashboard, ve a tu proyecto
2. Click en "Settings" > "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

## 📱 Paso 3: Configurar WhatsApp Business API

### 3.1 Crear App en Meta for Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Click en "My Apps" > "Create App"
3. Selecciona "Business" como tipo de app
4. Completa:
   - **App Name**: CRM Vida Digital WhatsApp
   - **App Contact Email**: tu@email.com
5. Click en "Create App"

### 3.2 Agregar WhatsApp

1. En el dashboard de tu app, busca "WhatsApp"
2. Click en "Set up"
3. Selecciona tu Business Account o crea uno nuevo

### 3.3 Configurar Número de Prueba

1. En "WhatsApp" > "Getting Started"
2. Verás un número de prueba de WhatsApp
3. Agrega tu número personal para recibir mensajes de prueba
4. Envía un mensaje de prueba para verificar

### 3.4 Configurar Webhook

1. Ve a "WhatsApp" > "Configuration"
2. En "Webhook", click en "Edit"
3. Completa:
   - **Callback URL**: `https://xxxxx.supabase.co/functions/v1/whatsapp-inbound`
   - **Verify Token**: el mismo que configuraste en `WHATSAPP_VERIFY_TOKEN`
4. Click en "Verify and Save"
5. Suscríbete al campo "messages"

### 3.5 Obtener Credenciales

1. En "WhatsApp" > "API Setup":
   - **Phone Number ID**: Copia este valor
   - **WhatsApp Business Account ID**: Copia este valor
2. En "WhatsApp" > "Getting Started":
   - **Temporary Access Token**: Copia este valor (válido por 24 horas)

### 3.6 Generar Token Permanente (Producción)

1. Ve a "Settings" > "Basic"
2. Copia el **App ID** y **App Secret**
3. Genera un System User Token:
   - Ve a Business Settings > System Users
   - Crea un nuevo System User
   - Asigna permisos de WhatsApp
   - Genera un token permanente

4. Actualiza los secretos en Supabase:

```bash
supabase secrets set WHATSAPP_ACCESS_TOKEN=tu-token-permanente
supabase secrets set WHATSAPP_PHONE_NUMBER_ID=tu-phone-number-id
```

### 3.7 Registrar en la Base de Datos

1. Ve a Supabase > Table Editor > `integraciones`
2. Inserta un nuevo registro:

```sql
INSERT INTO integraciones (nombre, tipo, activo, credenciales, configuracion)
VALUES (
  'WhatsApp Business',
  'whatsapp',
  true,
  '{"access_token": "tu-token", "phone_number_id": "tu-phone-id"}'::jsonb,
  '{"webhook_url": "https://xxxxx.supabase.co/functions/v1/whatsapp-inbound"}'::jsonb
);
```

## 🤖 Paso 4: Configurar OpenAI

### 4.1 Crear Cuenta y Obtener API Key

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Click en "Create new secret key"
5. Dale un nombre: "CRM Vida Digital"
6. Copia la key (solo se muestra una vez)

### 4.2 Agregar Créditos

1. Ve a "Billing" > "Payment methods"
2. Agrega un método de pago
3. Agrega créditos (mínimo $5 USD)

### 4.3 Configurar en Supabase

```bash
supabase secrets set OPENAI_API_KEY=sk-tu-api-key-real
```

### 4.4 Registrar en la Base de Datos

```sql
INSERT INTO integraciones (nombre, tipo, activo, credenciales, configuracion)
VALUES (
  'OpenAI',
  'openai',
  true,
  '{"api_key": "sk-tu-api-key"}'::jsonb,
  '{"modelo": "gpt-4", "temperatura": 0.7}'::jsonb
);
```

## ✅ Paso 5: Verificación y Pruebas

### 5.1 Verificar Frontend

1. Abre tu URL de Vercel: `https://tu-app.vercel.app`
2. Deberías ver la página de login
3. Intenta registrarte con un email
4. Revisa tu email para confirmar la cuenta

### 5.2 Verificar Base de Datos

1. Inicia sesión en la app
2. Ve a Dashboard
3. Deberías ver las métricas (todas en 0 inicialmente)

### 5.3 Probar WhatsApp

1. Envía un mensaje al número de WhatsApp de prueba
2. Ve a Supabase > Table Editor > `conversaciones`
3. Deberías ver una nueva conversación creada
4. Ve a `mensajes` y verifica que el mensaje se guardó
5. Ve a `leads` y verifica que se creó un lead automáticamente

### 5.4 Probar IA

1. En la app, ve a Dashboard > Mensajes
2. Selecciona la conversación
3. La IA debería sugerir respuestas automáticas
4. Verifica en `interacciones_ia` que se registró la interacción

## 🔧 Paso 6: Configuración Inicial

### 6.1 Crear Usuario Administrador

1. Regístrate con tu email principal
2. Ve a Supabase > Table Editor > `usuarios`
3. Encuentra tu usuario
4. Actualiza el `rol_id` al ID del rol "Administrador"

### 6.2 Configurar Organización

1. Ve a Dashboard > Configuración
2. Completa los datos de tu empresa:
   - Nombre: Vida Digital Col
   - Email de contacto
   - Teléfono
   - Dirección
   - Logo (opcional)

### 6.3 Crear Usuarios del Equipo

1. Ve a Dashboard > Configuración > Usuarios
2. Invita a los miembros de tu equipo
3. Asigna roles apropiados

## 🚀 Paso 7: Puesta en Producción

### 7.1 Actualizar URLs

1. En Vercel, actualiza la variable de entorno:
   ```
   NEXT_PUBLIC_APP_URL=https://tu-dominio-real.com
   ```

2. En WhatsApp, actualiza el webhook si cambió el dominio

### 7.2 Configurar Monitoreo

1. En Vercel, habilita Analytics
2. En Supabase, habilita Database Webhooks para notificaciones
3. Configura alertas de errores

### 7.3 Backup y Seguridad

1. En Supabase, habilita backups automáticos
2. Descarga un backup manual de la base de datos
3. Guarda todas las credenciales en un gestor de contraseñas

## 📊 Paso 8: Primeros Pasos

### 8.1 Crear Datos de Prueba

1. Crea algunos leads de prueba
2. Crea productos/servicios
3. Configura plantillas de mensajes
4. Personaliza los prompts de IA

### 8.2 Capacitar al Equipo

1. Comparte el README con el equipo
2. Realiza una sesión de capacitación
3. Crea documentación interna adicional si es necesario

## 🆘 Solución de Problemas

### Error: "Invalid API key" en OpenAI

- Verifica que la API key esté correcta
- Confirma que tienes créditos en OpenAI
- Revisa que el secreto esté configurado en Supabase

### Error: "Webhook verification failed" en WhatsApp

- Verifica que el `WHATSAPP_VERIFY_TOKEN` coincida
- Confirma que la URL del webhook sea correcta
- Revisa los logs de la Edge Function

### Error: "Row Level Security policy violation"

- Verifica que las políticas RLS estén activas
- Confirma que el usuario tenga el rol correcto
- Revisa los logs de Supabase

## 📞 Soporte

Si necesitas ayuda adicional:

1. Revisa los logs en Vercel Dashboard
2. Revisa los logs en Supabase > Logs
3. Contacta al equipo de desarrollo

---

**¡Felicidades! Tu CRM está en producción 🎉**
