-- Migration: Add factura_id to cotizaciones table
-- Created: 2026-02-10

-- Add factura_id column to cotizaciones
ALTER TABLE cotizaciones 
ADD COLUMN IF NOT EXISTS factura_id UUID REFERENCES facturas(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cotizaciones_factura ON cotizaciones(factura_id);

-- Comment
COMMENT ON COLUMN cotizaciones.factura_id IS 'Factura generada desde esta cotización';
