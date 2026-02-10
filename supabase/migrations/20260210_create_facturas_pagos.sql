-- Migration: Create invoices and payments tables
-- Created: 2026-02-10

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create facturas table
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(50) UNIQUE NOT NULL,
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
    
    -- Fechas
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    
    -- Montos
    subtotal DECIMAL(12,2) NOT NULL,
    impuestos DECIMAL(12,2) DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    pagado DECIMAL(12,2) DEFAULT 0,
    saldo DECIMAL(12,2) GENERATED ALWAYS AS (total - pagado) STORED,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'cancelada', 'parcial')),
    
    -- Metadata
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    pagada_at TIMESTAMPTZ
);

-- Create pagos table
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE NOT NULL,
    
    -- Información del pago
    monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    metodo VARCHAR(50) NOT NULL 
        CHECK (metodo IN ('efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro')),
    referencia VARCHAR(100),
    
    -- Metadata
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_factura_numero()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_str VARCHAR(4);
    numero_final VARCHAR(50);
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'FAC-' || year_str || '-(.*)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM facturas
    WHERE numero LIKE 'FAC-' || year_str || '-%';
    
    numero_final := 'FAC-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    NEW.numero := numero_final;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating invoice number
CREATE TRIGGER trigger_generate_factura_numero
    BEFORE INSERT ON facturas
    FOR EACH ROW
    WHEN (NEW.numero IS NULL OR NEW.numero = '')
    EXECUTE FUNCTION generate_factura_numero();

-- Function to update invoice on payment
CREATE OR REPLACE FUNCTION update_factura_on_pago()
RETURNS TRIGGER AS $$
DECLARE
    total_pagado DECIMAL(12,2);
    factura_total DECIMAL(12,2);
    factura_id_var UUID;
BEGIN
    -- Determine factura_id based on operation
    IF TG_OP = 'DELETE' THEN
        factura_id_var := OLD.factura_id;
    ELSE
        factura_id_var := NEW.factura_id;
    END IF;
    
    -- Calculate total paid
    SELECT COALESCE(SUM(monto), 0) INTO total_pagado
    FROM pagos
    WHERE factura_id = factura_id_var;
    
    -- Get invoice total
    SELECT total INTO factura_total
    FROM facturas
    WHERE id = factura_id_var;
    
    -- Update invoice
    UPDATE facturas
    SET 
        pagado = total_pagado,
        estado = CASE
            WHEN total_pagado >= factura_total THEN 'pagada'
            WHEN total_pagado > 0 THEN 'parcial'
            WHEN fecha_vencimiento < CURRENT_DATE THEN 'vencida'
            ELSE 'pendiente'
        END,
        pagada_at = CASE
            WHEN total_pagado >= factura_total THEN NOW()
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = factura_id_var;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating invoice when payment is added/updated/deleted
CREATE TRIGGER trigger_update_factura_on_pago
    AFTER INSERT OR UPDATE OR DELETE ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION update_factura_on_pago();

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_facturas_updated_at
    BEFORE UPDATE ON facturas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_vencimiento ON facturas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_facturas_cotizacion ON facturas(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_factura ON pagos(factura_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);

-- Add RLS policies
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON facturas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON pagos
    FOR ALL USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE facturas IS 'Facturas generadas para clientes';
COMMENT ON TABLE pagos IS 'Pagos registrados contra facturas';
COMMENT ON COLUMN facturas.saldo IS 'Saldo pendiente calculado automáticamente (total - pagado)';
COMMENT ON COLUMN facturas.estado IS 'Estado de la factura: pendiente, parcial, pagada, vencida, cancelada';
