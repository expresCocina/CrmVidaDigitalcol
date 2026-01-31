-- =====================================================
-- FUNCIONES DE BASE DE DATOS
-- CRM VIDA DIGITAL COL
-- =====================================================

-- =====================================================
-- FUNCIÓN: Actualizar valor total del cliente
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_valor_total_cliente()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET valor_total = (
    SELECT COALESCE(SUM(total), 0)
    FROM cotizaciones
    WHERE cliente_id = NEW.cliente_id
    AND estado = 'aceptada'
  )
  WHERE id = NEW.cliente_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_valor_cliente
AFTER INSERT OR UPDATE ON cotizaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_valor_total_cliente();

-- =====================================================
-- FUNCIÓN: Actualizar último mensaje en conversación
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_ultimo_mensaje_conversacion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversaciones
  SET ultimo_mensaje_at = NEW.created_at
  WHERE id = NEW.conversacion_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_ultimo_mensaje
AFTER INSERT ON mensajes
FOR EACH ROW
EXECUTE FUNCTION actualizar_ultimo_mensaje_conversacion();

-- =====================================================
-- FUNCIÓN: Crear usuario en tabla usuarios al registrarse
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Obtener el ID del rol "Vendedor" por defecto
  SELECT id INTO default_role_id
  FROM roles
  WHERE nombre = 'Vendedor'
  LIMIT 1;

  INSERT INTO public.usuarios (id, email, nombre_completo, rol_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    default_role_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FUNCIÓN: Calcular subtotal de item de cotización
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_subtotal_item()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subtotal = (NEW.cantidad * NEW.precio_unitario) - NEW.descuento;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_subtotal_item
BEFORE INSERT OR UPDATE ON items_cotizacion
FOR EACH ROW
EXECUTE FUNCTION calcular_subtotal_item();

-- =====================================================
-- FUNCIÓN: Actualizar totales de cotización
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_totales_cotizacion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cotizaciones
  SET 
    subtotal = (
      SELECT COALESCE(SUM(subtotal), 0)
      FROM items_cotizacion
      WHERE cotizacion_id = NEW.cotizacion_id
    ),
    total = subtotal - descuento + impuestos
  WHERE id = NEW.cotizacion_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_totales_cotizacion
AFTER INSERT OR UPDATE OR DELETE ON items_cotizacion
FOR EACH ROW
EXECUTE FUNCTION actualizar_totales_cotizacion();

-- =====================================================
-- FUNCIÓN: Generar número de cotización automático
-- =====================================================
CREATE OR REPLACE FUNCTION generar_numero_cotizacion()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  next_number INTEGER;
BEGIN
  IF NEW.numero IS NULL THEN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(numero FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM cotizaciones
    WHERE numero LIKE 'COT-' || year_prefix || '-%';
    
    NEW.numero := 'COT-' || year_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_numero_cotizacion
BEFORE INSERT ON cotizaciones
FOR EACH ROW
EXECUTE FUNCTION generar_numero_cotizacion();

-- =====================================================
-- FUNCIÓN: Marcar lead como convertido al crear cliente
-- =====================================================
CREATE OR REPLACE FUNCTION marcar_lead_convertido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.convertido_a_cliente_id IS NOT NULL THEN
    NEW.estado = 'convertido';
    NEW.fecha_conversion = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_marcar_lead_convertido
BEFORE UPDATE ON leads
FOR EACH ROW
WHEN (NEW.convertido_a_cliente_id IS NOT NULL AND OLD.convertido_a_cliente_id IS NULL)
EXECUTE FUNCTION marcar_lead_convertido();

-- =====================================================
-- FUNCIÓN: Registrar métrica diaria
-- =====================================================
CREATE OR REPLACE FUNCTION registrar_metrica_diaria(
  p_tipo_metrica VARCHAR,
  p_valor DECIMAL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO metricas_diarias (fecha, tipo_metrica, valor)
  VALUES (CURRENT_DATE, p_tipo_metrica, p_valor)
  ON CONFLICT (fecha, tipo_metrica)
  DO UPDATE SET valor = metricas_diarias.valor + EXCLUDED.valor;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Obtener estadísticas del dashboard
-- =====================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_usuario_id UUID DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'leads_nuevos', (
      SELECT COUNT(*)
      FROM leads
      WHERE created_at::date BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    ),
    'leads_convertidos', (
      SELECT COUNT(*)
      FROM leads
      WHERE estado = 'convertido'
      AND fecha_conversion::date BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    ),
    'citas_programadas', (
      SELECT COUNT(*)
      FROM citas
      WHERE fecha_inicio::date BETWEEN p_fecha_inicio AND p_fecha_fin
      AND estado IN ('programada', 'confirmada')
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    ),
    'valor_oportunidades', (
      SELECT COALESCE(SUM(valor_estimado), 0)
      FROM oportunidades
      WHERE estado = 'abierta'
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    ),
    'conversaciones_activas', (
      SELECT COUNT(*)
      FROM conversaciones
      WHERE estado = 'abierta'
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    ),
    'actividades_pendientes', (
      SELECT COUNT(*)
      FROM actividades
      WHERE estado = 'pendiente'
      AND fecha_programada >= NOW()
      AND (p_usuario_id IS NULL OR asignado_a = p_usuario_id)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Buscar leads/clientes
-- =====================================================
CREATE OR REPLACE FUNCTION buscar_contactos(
  p_query TEXT
)
RETURNS TABLE (
  tipo TEXT,
  id UUID,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'lead'::TEXT as tipo,
    l.id,
    l.nombre,
    l.email,
    l.telefono,
    l.estado
  FROM leads l
  WHERE 
    l.nombre ILIKE '%' || p_query || '%'
    OR l.email ILIKE '%' || p_query || '%'
    OR l.telefono ILIKE '%' || p_query || '%'
  
  UNION ALL
  
  SELECT 
    'cliente'::TEXT as tipo,
    c.id,
    c.nombre,
    c.email,
    c.telefono,
    c.estado
  FROM clientes c
  WHERE 
    c.nombre ILIKE '%' || p_query || '%'
    OR c.email ILIKE '%' || p_query || '%'
    OR c.telefono ILIKE '%' || p_query || '%';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Obtener timeline de actividades
-- =====================================================
CREATE OR REPLACE FUNCTION get_timeline_actividades(
  p_lead_id UUID DEFAULT NULL,
  p_cliente_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  tipo TEXT,
  titulo TEXT,
  descripcion TEXT,
  fecha TIMESTAMP WITH TIME ZONE,
  usuario_nombre TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.tipo::TEXT,
    a.titulo,
    a.descripcion,
    a.created_at as fecha,
    u.nombre_completo as usuario_nombre
  FROM actividades a
  LEFT JOIN usuarios u ON a.creado_por = u.id
  WHERE 
    (p_lead_id IS NULL OR a.lead_id = p_lead_id)
    AND (p_cliente_id IS NULL OR a.cliente_id = p_cliente_id)
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
