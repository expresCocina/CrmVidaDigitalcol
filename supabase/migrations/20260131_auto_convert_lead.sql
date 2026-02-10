-- =====================================================
-- MIGRACIÓN: Automatización de conversión Lead -> Cliente
-- =====================================================

-- 1. Eliminar el trigger anterior para evitar conflictos
DROP TRIGGER IF EXISTS trigger_marcar_lead_convertido ON leads;
DROP FUNCTION IF EXISTS marcar_lead_convertido();

-- 2. Crear nueva función unificada
CREATE OR REPLACE FUNCTION handle_lead_conversion_v2()
RETURNS TRIGGER AS $$
DECLARE
  new_client_id UUID;
BEGIN
  -- CASO 1: Se asignó un cliente manualmente -> Marcar como convertido
  IF NEW.convertido_a_cliente_id IS NOT NULL AND (OLD.convertido_a_cliente_id IS NULL OR OLD.convertido_a_cliente_id != NEW.convertido_a_cliente_id) THEN
    NEW.estado := 'convertido';
    NEW.fecha_conversion := COALESCE(NEW.fecha_conversion, NOW());
  
  -- CASO 2: Se marcó Estado = 'convertido' -> Crear Cliente automáticamente
  ELSIF NEW.estado = 'convertido' AND (OLD.estado IS NULL OR OLD.estado != 'convertido') AND NEW.convertido_a_cliente_id IS NULL THEN
    
    INSERT INTO clientes (
      nombre,
      email,
      telefono,
      empresa,
      asignado_a,
      tipo_cliente,
      estado,
      created_at,
      updated_at
    )
    VALUES (
      NEW.nombre,
      NEW.email,
      NEW.telefono,
      NEW.empresa,
      NEW.asignado_a,
      -- Si tiene empresa, asumimos tipo 'empresa', sino 'individual'
      CASE WHEN NEW.empresa IS NOT NULL AND NEW.empresa != '' THEN 'empresa' ELSE 'individual' END,
      'activo',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_client_id;
    
    -- Vincular el nuevo cliente al lead
    NEW.convertido_a_cliente_id := new_client_id;
    NEW.fecha_conversion := NOW();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el trigger
CREATE TRIGGER trigger_auto_convert_lead
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION handle_lead_conversion_v2();
