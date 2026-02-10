-- Tabla de Planes
CREATE TABLE IF NOT EXISTS planes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  caracteristicas JSONB,
  destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100),
  unidad VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación Servicios-Clientes
CREATE TABLE IF NOT EXISTS servicios_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  servicio_id UUID REFERENCES servicios(id),
  plan_id UUID REFERENCES planes(id),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(50) DEFAULT 'activo',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes(activo);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_clientes_cliente ON servicios_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_servicios_clientes_estado ON servicios_clientes(estado);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_planes_updated_at BEFORE UPDATE ON planes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos iniciales de Planes
INSERT INTO planes (nombre, descripcion, precio, caracteristicas, destacado, orden) VALUES
(
  'Plan Vende en Automático',
  'Mientras paseas, vas al gym o duermes',
  990000,
  '["Página web y dominio", "Mensualidad de página", "CRM integrado", "Agente inteligente 24/7", "12 contenidos mensuales", "Historias diarias", "Creación de anuncios", "Nota: La pauta va a cargo del cliente"]'::jsonb,
  true,
  1
),
(
  'Plan Contenido Orgánico + Pautas',
  'Creación de contenido orgánico y pautas en Meta Ads',
  350000,
  '["12 contenidos mensuales", "Historias diarias", "Creación de anuncios publicitarios"]'::jsonb,
  false,
  2
),
(
  'Plan Anuncios Digitales',
  'Visibilidad, viralidad y ventas',
  180000,
  '["6 contenidos con estrategia", "Aumento de comunidad", "Creación de anuncios", "Visibilidad y ventas"]'::jsonb,
  false,
  3
),
(
  'Plan 2 Creativos',
  'Acompañamiento y mano de obra',
  99000,
  '["2 creativos con estrategia", "Acompañamiento profesional", "Montaje de anuncios digitales"]'::jsonb,
  false,
  4
);

-- Insertar datos iniciales de Servicios
INSERT INTO servicios (nombre, descripcion, precio, categoria, unidad) VALUES
('Página web mensual', 'Hosting y mantenimiento mensual (no incluye dominio)', 160000, 'web', 'mensual'),
('CRM mensual', 'Acceso y soporte del CRM', 220000, 'crm', 'mensual'),
('Pauta + Contenido', '1 pauta publicitaria y 1 contenido', 50000, 'contenido', 'único'),
('Video con IA', 'Video generado con inteligencia artificial', 30000, 'video', 'único'),
('Diseño gráfico', 'Diseño personalizado', 15000, 'diseño', 'único'),
('Video con CapCut', 'Edición de video profesional', 30000, 'video', 'único'),
('Creación de redes sociales', 'Setup completo de perfiles', 50000, 'social', 'único'),
('Asesoría', 'Consultoría personalizada', 50000, 'asesoría', 'por hora'),
('4 clases de 1.5h', 'Paquete de capacitación', 250000, 'asesoría', 'paquete'),
('3 videos con cámara pro', 'Grabación profesional', 250000, 'video', 'paquete'),
('3 videos con modelo', 'Producción con modelo profesional', 350000, 'video', 'paquete');

-- Políticas RLS (Row Level Security)
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_clientes ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para planes y servicios
CREATE POLICY "Planes son públicos" ON planes FOR SELECT USING (activo = true);
CREATE POLICY "Servicios son públicos" ON servicios FOR SELECT USING (activo = true);

-- Políticas de administración (solo usuarios autenticados)
CREATE POLICY "Admin puede gestionar planes" ON planes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar servicios" ON servicios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede gestionar servicios_clientes" ON servicios_clientes FOR ALL USING (auth.role() = 'authenticated');
