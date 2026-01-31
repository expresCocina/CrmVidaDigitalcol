-- =====================================================
-- CRM VIDA DIGITAL COL - ESQUEMA DE BASE DE DATOS
-- Migración Inicial: 25+ Tablas
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- AUTENTICACIÓN Y USUARIOS
-- =====================================================

-- Tabla de roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  telefono VARCHAR(20),
  rol_id UUID REFERENCES roles(id),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  configuracion JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEADS Y CLIENTES
-- =====================================================

-- Tabla de fuentes de leads
CREATE TABLE fuentes_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  empresa VARCHAR(255),
  cargo VARCHAR(100),
  fuente_id UUID REFERENCES fuentes_leads(id),
  estado VARCHAR(50) DEFAULT 'nuevo', -- nuevo, contactado, calificado, no_calificado, convertido
  calificacion VARCHAR(20), -- frio, tibio, caliente
  puntuacion INTEGER DEFAULT 0,
  asignado_a UUID REFERENCES usuarios(id),
  notas TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  convertido_a_cliente_id UUID,
  fecha_conversion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(20),
  empresa VARCHAR(255),
  tipo_documento VARCHAR(20), -- NIT, CC, CE
  numero_documento VARCHAR(50),
  direccion TEXT,
  ciudad VARCHAR(100),
  departamento VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Colombia',
  tipo_cliente VARCHAR(50) DEFAULT 'individual', -- individual, empresa
  estado VARCHAR(50) DEFAULT 'activo', -- activo, inactivo, suspendido
  asignado_a UUID REFERENCES usuarios(id),
  valor_total DECIMAL(15,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar referencia de lead a cliente
ALTER TABLE leads ADD CONSTRAINT fk_lead_cliente 
  FOREIGN KEY (convertido_a_cliente_id) REFERENCES clientes(id);

-- Tabla de contactos (múltiples contactos por cliente/empresa)
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(20),
  es_principal BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PIPELINE Y OPORTUNIDADES
-- =====================================================

-- Tabla de etapas del pipeline
CREATE TABLE etapas_pipeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL,
  probabilidad INTEGER DEFAULT 0, -- 0-100%
  color VARCHAR(7) DEFAULT '#3B82F6',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de oportunidades/deals
CREATE TABLE oportunidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  etapa_id UUID REFERENCES etapas_pipeline(id) NOT NULL,
  valor_estimado DECIMAL(15,2) DEFAULT 0,
  probabilidad INTEGER DEFAULT 0,
  fecha_cierre_estimada DATE,
  fecha_cierre_real DATE,
  estado VARCHAR(50) DEFAULT 'abierta', -- abierta, ganada, perdida, cancelada
  razon_perdida TEXT,
  asignado_a UUID REFERENCES usuarios(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACTIVIDADES Y TAREAS
-- =====================================================

-- Tabla de actividades
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL, -- llamada, email, reunion, tarea, nota
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_programada TIMESTAMP WITH TIME ZONE,
  fecha_completada TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, completada, cancelada
  prioridad VARCHAR(20) DEFAULT 'media', -- baja, media, alta
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  oportunidad_id UUID REFERENCES oportunidades(id),
  asignado_a UUID REFERENCES usuarios(id),
  creado_por UUID REFERENCES usuarios(id),
  resultado TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CITAS Y CALENDARIO
-- =====================================================

-- Tabla de citas
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  ubicacion TEXT,
  tipo VARCHAR(50) DEFAULT 'presencial', -- presencial, virtual, telefonica
  estado VARCHAR(50) DEFAULT 'programada', -- programada, confirmada, completada, cancelada, no_asistio
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  asignado_a UUID REFERENCES usuarios(id),
  recordatorio_enviado BOOLEAN DEFAULT false,
  url_reunion TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de disponibilidad de usuarios
CREATE TABLE disponibilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL, -- 0=Domingo, 6=Sábado
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENSAJERÍA OMNICANAL
-- =====================================================

-- Tabla de conversaciones
CREATE TABLE conversaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  canal VARCHAR(50) NOT NULL, -- whatsapp, email, chat, sms
  identificador_externo VARCHAR(255), -- número de teléfono, email, etc.
  estado VARCHAR(50) DEFAULT 'abierta', -- abierta, cerrada, en_espera
  asignado_a UUID REFERENCES usuarios(id),
  ultimo_mensaje_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'texto', -- texto, imagen, audio, video, documento
  direccion VARCHAR(20) NOT NULL, -- entrante, saliente
  enviado_por UUID REFERENCES usuarios(id),
  leido BOOLEAN DEFAULT false,
  entregado BOOLEAN DEFAULT false,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas de mensajes
CREATE TABLE plantillas_mensajes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  canal VARCHAR(50), -- whatsapp, email, sms, null=todos
  categoria VARCHAR(100),
  variables JSONB DEFAULT '[]'::jsonb,
  activo BOOLEAN DEFAULT true,
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MÓDULO DE IA
-- =====================================================

-- Tabla de configuración de IA
CREATE TABLE configuracion_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- asistente, clasificador, analizador
  modelo VARCHAR(100) DEFAULT 'gpt-4',
  temperatura DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  activo BOOLEAN DEFAULT true,
  configuracion JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de prompts del sistema
CREATE TABLE prompts_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  configuracion_ia_id UUID REFERENCES configuracion_ia(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  prompt_sistema TEXT NOT NULL,
  prompt_usuario TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de interacciones con IA
CREATE TABLE interacciones_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  configuracion_ia_id UUID REFERENCES configuracion_ia(id),
  usuario_id UUID REFERENCES usuarios(id),
  conversacion_id UUID REFERENCES conversaciones(id),
  prompt TEXT NOT NULL,
  respuesta TEXT,
  tokens_usados INTEGER,
  tiempo_respuesta_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTOS Y SERVICIOS
-- =====================================================

-- Tabla de productos/servicios
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  sku VARCHAR(100) UNIQUE,
  tipo VARCHAR(50) DEFAULT 'servicio', -- producto, servicio
  categoria VARCHAR(100),
  precio DECIMAL(15,2) DEFAULT 0,
  costo DECIMAL(15,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cotizaciones
CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  oportunidad_id UUID REFERENCES oportunidades(id),
  fecha_emision DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  subtotal DECIMAL(15,2) DEFAULT 0,
  descuento DECIMAL(15,2) DEFAULT 0,
  impuestos DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'borrador', -- borrador, enviada, aceptada, rechazada, vencida
  notas TEXT,
  terminos_condiciones TEXT,
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de cotización
CREATE TABLE items_cotizacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10,2) DEFAULT 1,
  precio_unitario DECIMAL(15,2) DEFAULT 0,
  descuento DECIMAL(15,2) DEFAULT 0,
  subtotal DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTES Y MÉTRICAS
-- =====================================================

-- Tabla de métricas diarias
CREATE TABLE metricas_diarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  tipo_metrica VARCHAR(100) NOT NULL,
  valor DECIMAL(15,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fecha, tipo_metrica)
);

-- Tabla de objetivos
CREATE TABLE objetivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- ventas, leads, actividades
  valor_objetivo DECIMAL(15,2) NOT NULL,
  valor_actual DECIMAL(15,2) DEFAULT 0,
  periodo VARCHAR(50) NOT NULL, -- mensual, trimestral, anual
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  estado VARCHAR(50) DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ARCHIVOS Y DOCUMENTOS
-- =====================================================

-- Tabla de archivos
CREATE TABLE archivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(100),
  tamano_bytes BIGINT,
  url TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  lead_id UUID REFERENCES leads(id),
  oportunidad_id UUID REFERENCES oportunidades(id),
  subido_por UUID REFERENCES usuarios(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONFIGURACIÓN DEL SISTEMA
-- =====================================================

-- Tabla de configuración de la organización
CREATE TABLE configuracion_organizacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_empresa VARCHAR(255) NOT NULL,
  logo_url TEXT,
  email_contacto VARCHAR(255),
  telefono_contacto VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100),
  moneda VARCHAR(10) DEFAULT 'COP',
  zona_horaria VARCHAR(50) DEFAULT 'America/Bogota',
  configuracion JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de integraciones
CREATE TABLE integraciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- whatsapp, openai, email, etc.
  activo BOOLEAN DEFAULT false,
  credenciales JSONB DEFAULT '{}'::jsonb, -- Encriptado
  configuracion JSONB DEFAULT '{}'::jsonb,
  ultimo_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contactos_updated_at BEFORE UPDATE ON contactos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oportunidades_updated_at BEFORE UPDATE ON oportunidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_actividades_updated_at BEFORE UPDATE ON actividades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON conversaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plantillas_mensajes_updated_at BEFORE UPDATE ON plantillas_mensajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en leads
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_asignado_a ON leads(asignado_a);
CREATE INDEX idx_leads_fuente_id ON leads(fuente_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Índices en clientes
CREATE INDEX idx_clientes_estado ON clientes(estado);
CREATE INDEX idx_clientes_asignado_a ON clientes(asignado_a);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_telefono ON clientes(telefono);

-- Índices en conversaciones
CREATE INDEX idx_conversaciones_cliente_id ON conversaciones(cliente_id);
CREATE INDEX idx_conversaciones_lead_id ON conversaciones(lead_id);
CREATE INDEX idx_conversaciones_canal ON conversaciones(canal);
CREATE INDEX idx_conversaciones_estado ON conversaciones(estado);

-- Índices en mensajes
CREATE INDEX idx_mensajes_conversacion_id ON mensajes(conversacion_id);
CREATE INDEX idx_mensajes_created_at ON mensajes(created_at DESC);

-- Índices en citas
CREATE INDEX idx_citas_fecha_inicio ON citas(fecha_inicio);
CREATE INDEX idx_citas_asignado_a ON citas(asignado_a);
CREATE INDEX idx_citas_estado ON citas(estado);

-- Índices en actividades
CREATE INDEX idx_actividades_fecha_programada ON actividades(fecha_programada);
CREATE INDEX idx_actividades_asignado_a ON actividades(asignado_a);
CREATE INDEX idx_actividades_estado ON actividades(estado);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar roles predeterminados
INSERT INTO roles (nombre, descripcion, permisos) VALUES
  ('Administrador', 'Acceso completo al sistema', '["*"]'::jsonb),
  ('Gerente', 'Gestión de equipo y reportes', '["leads.*", "clientes.*", "reportes.*"]'::jsonb),
  ('Vendedor', 'Gestión de leads y clientes', '["leads.*", "clientes.read", "citas.*"]'::jsonb),
  ('Soporte', 'Atención al cliente', '["mensajes.*", "clientes.read", "citas.read"]'::jsonb);

-- Insertar fuentes de leads predeterminadas
INSERT INTO fuentes_leads (nombre, descripcion) VALUES
  ('Sitio Web', 'Formulario de contacto del sitio web'),
  ('WhatsApp', 'Mensajes entrantes de WhatsApp'),
  ('Referido', 'Referido por cliente existente'),
  ('Redes Sociales', 'Facebook, Instagram, LinkedIn'),
  ('Email Marketing', 'Campañas de email'),
  ('Llamada Directa', 'Llamada telefónica entrante'),
  ('Evento', 'Ferias, conferencias, eventos'),
  ('Otro', 'Otras fuentes');

-- Insertar etapas del pipeline predeterminadas
INSERT INTO etapas_pipeline (nombre, descripcion, orden, probabilidad, color) VALUES
  ('Prospecto', 'Contacto inicial realizado', 1, 10, '#94A3B8'),
  ('Calificación', 'Lead calificado y con interés', 2, 25, '#60A5FA'),
  ('Propuesta', 'Propuesta o cotización enviada', 3, 50, '#FBBF24'),
  ('Negociación', 'En proceso de negociación', 4, 75, '#FB923C'),
  ('Cierre', 'Listo para cerrar', 5, 90, '#34D399'),
  ('Ganado', 'Venta cerrada exitosamente', 6, 100, '#10B981');

-- Insertar configuración de IA predeterminada
INSERT INTO configuracion_ia (nombre, tipo, modelo, temperatura, max_tokens, configuracion) VALUES
  ('Asistente de Ventas', 'asistente', 'gpt-4', 0.7, 1500, '{"rol": "asistente_ventas"}'::jsonb),
  ('Clasificador de Leads', 'clasificador', 'gpt-3.5-turbo', 0.3, 500, '{"categorias": ["caliente", "tibio", "frio"]}'::jsonb),
  ('Analizador de Sentimiento', 'analizador', 'gpt-3.5-turbo', 0.5, 300, '{"tipo": "sentimiento"}'::jsonb);

-- Insertar configuración de organización inicial
INSERT INTO configuracion_organizacion (nombre_empresa, moneda, zona_horaria) VALUES
  ('Vida Digital Col', 'COP', 'America/Bogota');

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema CRM';
COMMENT ON TABLE leads IS 'Leads o prospectos de ventas';
COMMENT ON TABLE clientes IS 'Clientes activos del negocio';
COMMENT ON TABLE conversaciones IS 'Conversaciones omnicanal (WhatsApp, Email, etc)';
COMMENT ON TABLE mensajes IS 'Mensajes individuales dentro de conversaciones';
COMMENT ON TABLE citas IS 'Citas y reuniones programadas';
COMMENT ON TABLE oportunidades IS 'Oportunidades de venta en el pipeline';
COMMENT ON TABLE configuracion_ia IS 'Configuración de módulos de IA';
COMMENT ON TABLE interacciones_ia IS 'Registro de interacciones con IA';
