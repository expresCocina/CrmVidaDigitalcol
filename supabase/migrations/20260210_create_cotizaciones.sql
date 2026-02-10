-- Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida')),
    subtotal DECIMAL(12,2) DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    impuestos DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    valida_hasta DATE,
    notas TEXT,
    terminos_condiciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    enviada_at TIMESTAMPTZ,
    aceptada_at TIMESTAMPTZ
);

-- Crear tabla de items de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE NOT NULL,
    servicio_id UUID REFERENCES servicios(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES planes(id) ON DELETE SET NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('servicio', 'plan', 'personalizado')),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_cotizaciones_lead ON cotizaciones(lead_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_numero ON cotizaciones(numero);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_items_cotizacion ON cotizaciones_items(cotizacion_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_cotizaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cotizaciones_updated_at
    BEFORE UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_cotizaciones_updated_at();

-- Función para generar número de cotización automático
CREATE OR REPLACE FUNCTION generate_cotizacion_numero()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_str VARCHAR(4);
    numero_final VARCHAR(50);
BEGIN
    -- Obtener el año actual
    year_str := TO_CHAR(NOW(), 'YYYY');
    
    -- Obtener el siguiente número secuencial para este año
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'COT-' || year_str || '-(.*)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM cotizaciones
    WHERE numero LIKE 'COT-' || year_str || '-%';
    
    -- Generar el número final con formato COT-YYYY-NNNN
    numero_final := 'COT-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    
    NEW.numero := numero_final;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_cotizacion_numero
    BEFORE INSERT ON cotizaciones
    FOR EACH ROW
    WHEN (NEW.numero IS NULL OR NEW.numero = '')
    EXECUTE FUNCTION generate_cotizacion_numero();

-- RLS Policies
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones_items ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados (admin)
CREATE POLICY "Usuarios autenticados pueden ver todas las cotizaciones"
    ON cotizaciones FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cotizaciones"
    ON cotizaciones FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cotizaciones"
    ON cotizaciones FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar cotizaciones"
    ON cotizaciones FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para items
CREATE POLICY "Usuarios autenticados pueden ver items"
    ON cotizaciones_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear items"
    ON cotizaciones_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar items"
    ON cotizaciones_items FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar items"
    ON cotizaciones_items FOR DELETE
    TO authenticated
    USING (true);

-- Comentarios para documentación
COMMENT ON TABLE cotizaciones IS 'Tabla de cotizaciones para leads y clientes';
COMMENT ON TABLE cotizaciones_items IS 'Items individuales de cada cotización';
COMMENT ON COLUMN cotizaciones.numero IS 'Número único de cotización con formato COT-YYYY-NNNN';
COMMENT ON COLUMN cotizaciones.estado IS 'Estado actual: borrador, enviada, aceptada, rechazada, vencida';
