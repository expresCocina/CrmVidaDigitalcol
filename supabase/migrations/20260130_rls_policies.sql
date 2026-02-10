-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- CRM VIDA DIGITAL COL
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones_ia ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FUNCIONES HELPER PARA RLS
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT r.nombre
  FROM usuarios u
  JOIN roles r ON u.rol_id = r.id
  WHERE u.id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.id = auth.uid() AND r.nombre = 'Administrador'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA USUARIOS
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Administradores pueden ver todos los usuarios"
  ON usuarios FOR SELECT
  USING (is_admin());

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

-- Solo administradores pueden insertar usuarios
CREATE POLICY "Solo administradores pueden crear usuarios"
  ON usuarios FOR INSERT
  WITH CHECK (is_admin());

-- =====================================================
-- POLÍTICAS PARA LEADS
-- =====================================================

-- Todos los usuarios autenticados pueden ver leads
CREATE POLICY "Usuarios autenticados pueden ver leads"
  ON leads FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear leads
CREATE POLICY "Usuarios pueden crear leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar leads asignados a ellos o si son admin
CREATE POLICY "Usuarios pueden actualizar sus leads"
  ON leads FOR UPDATE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- Solo administradores pueden eliminar leads
CREATE POLICY "Solo administradores pueden eliminar leads"
  ON leads FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA CLIENTES
-- =====================================================

-- Todos los usuarios autenticados pueden ver clientes
CREATE POLICY "Usuarios autenticados pueden ver clientes"
  ON clientes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear clientes
CREATE POLICY "Usuarios pueden crear clientes"
  ON clientes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar clientes asignados a ellos o si son admin
CREATE POLICY "Usuarios pueden actualizar sus clientes"
  ON clientes FOR UPDATE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- Solo administradores pueden eliminar clientes
CREATE POLICY "Solo administradores pueden eliminar clientes"
  ON clientes FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA CONTACTOS
-- =====================================================

-- Los usuarios pueden ver contactos de clientes que pueden ver
CREATE POLICY "Usuarios pueden ver contactos"
  ON contactos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clientes c
      WHERE c.id = contactos.cliente_id
      AND (c.asignado_a = auth.uid() OR is_admin())
    )
  );

-- Los usuarios pueden crear contactos
CREATE POLICY "Usuarios pueden crear contactos"
  ON contactos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Los usuarios pueden actualizar contactos
CREATE POLICY "Usuarios pueden actualizar contactos"
  ON contactos FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLÍTICAS PARA CONVERSACIONES
-- =====================================================

-- Todos los usuarios pueden ver conversaciones
CREATE POLICY "Usuarios pueden ver conversaciones"
  ON conversaciones FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear conversaciones
CREATE POLICY "Usuarios pueden crear conversaciones"
  ON conversaciones FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar conversaciones asignadas a ellos
CREATE POLICY "Usuarios pueden actualizar sus conversaciones"
  ON conversaciones FOR UPDATE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA MENSAJES
-- =====================================================

-- Los usuarios pueden ver mensajes de conversaciones que pueden ver
CREATE POLICY "Usuarios pueden ver mensajes"
  ON mensajes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversaciones c
      WHERE c.id = mensajes.conversacion_id
      AND (c.asignado_a = auth.uid() OR is_admin() OR auth.uid() IS NOT NULL)
    )
  );

-- Usuarios pueden crear mensajes
CREATE POLICY "Usuarios pueden crear mensajes"
  ON mensajes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar mensajes que enviaron
CREATE POLICY "Usuarios pueden actualizar sus mensajes"
  ON mensajes FOR UPDATE
  USING (enviado_por = auth.uid() OR is_admin());

-- =====================================================
-- POLÍTICAS PARA CITAS
-- =====================================================

-- Todos los usuarios pueden ver citas
CREATE POLICY "Usuarios pueden ver citas"
  ON citas FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear citas
CREATE POLICY "Usuarios pueden crear citas"
  ON citas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar citas asignadas a ellos
CREATE POLICY "Usuarios pueden actualizar sus citas"
  ON citas FOR UPDATE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- Usuarios pueden eliminar citas asignadas a ellos
CREATE POLICY "Usuarios pueden eliminar sus citas"
  ON citas FOR DELETE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA ACTIVIDADES
-- =====================================================

-- Todos los usuarios pueden ver actividades
CREATE POLICY "Usuarios pueden ver actividades"
  ON actividades FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear actividades
CREATE POLICY "Usuarios pueden crear actividades"
  ON actividades FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar actividades asignadas a ellos
CREATE POLICY "Usuarios pueden actualizar sus actividades"
  ON actividades FOR UPDATE
  USING (
    asignado_a = auth.uid() OR creado_por = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA OPORTUNIDADES
-- =====================================================

-- Todos los usuarios pueden ver oportunidades
CREATE POLICY "Usuarios pueden ver oportunidades"
  ON oportunidades FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear oportunidades
CREATE POLICY "Usuarios pueden crear oportunidades"
  ON oportunidades FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar oportunidades asignadas a ellos
CREATE POLICY "Usuarios pueden actualizar sus oportunidades"
  ON oportunidades FOR UPDATE
  USING (
    asignado_a = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA PRODUCTOS
-- =====================================================

-- Todos los usuarios pueden ver productos
CREATE POLICY "Usuarios pueden ver productos"
  ON productos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo administradores pueden gestionar productos
CREATE POLICY "Solo administradores pueden crear productos"
  ON productos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Solo administradores pueden actualizar productos"
  ON productos FOR UPDATE
  USING (is_admin());

CREATE POLICY "Solo administradores pueden eliminar productos"
  ON productos FOR DELETE
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA COTIZACIONES
-- =====================================================

-- Todos los usuarios pueden ver cotizaciones
CREATE POLICY "Usuarios pueden ver cotizaciones"
  ON cotizaciones FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear cotizaciones
CREATE POLICY "Usuarios pueden crear cotizaciones"
  ON cotizaciones FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar cotizaciones que crearon
CREATE POLICY "Usuarios pueden actualizar sus cotizaciones"
  ON cotizaciones FOR UPDATE
  USING (
    creado_por = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA PLANTILLAS DE MENSAJES
-- =====================================================

-- Todos los usuarios pueden ver plantillas
CREATE POLICY "Usuarios pueden ver plantillas"
  ON plantillas_mensajes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden crear plantillas
CREATE POLICY "Usuarios pueden crear plantillas"
  ON plantillas_mensajes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden actualizar plantillas que crearon
CREATE POLICY "Usuarios pueden actualizar sus plantillas"
  ON plantillas_mensajes FOR UPDATE
  USING (
    creado_por = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA ARCHIVOS
-- =====================================================

-- Todos los usuarios pueden ver archivos
CREATE POLICY "Usuarios pueden ver archivos"
  ON archivos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Usuarios pueden subir archivos
CREATE POLICY "Usuarios pueden subir archivos"
  ON archivos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden eliminar archivos que subieron
CREATE POLICY "Usuarios pueden eliminar sus archivos"
  ON archivos FOR DELETE
  USING (
    subido_por = auth.uid() OR is_admin()
  );

-- =====================================================
-- POLÍTICAS PARA CONFIGURACIÓN DE IA
-- =====================================================

-- Todos los usuarios pueden ver configuración de IA
CREATE POLICY "Usuarios pueden ver configuración IA"
  ON configuracion_ia FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Solo administradores pueden gestionar configuración de IA
CREATE POLICY "Solo administradores pueden gestionar IA"
  ON configuracion_ia FOR ALL
  USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA INTERACCIONES IA
-- =====================================================

-- Los usuarios pueden ver sus propias interacciones
CREATE POLICY "Usuarios pueden ver sus interacciones IA"
  ON interacciones_ia FOR SELECT
  USING (usuario_id = auth.uid() OR is_admin());

-- Los usuarios pueden crear interacciones
CREATE POLICY "Usuarios pueden crear interacciones IA"
  ON interacciones_ia FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- POLÍTICAS PARA ROLES (Solo lectura para no-admin)
-- =====================================================

CREATE POLICY "Usuarios pueden ver roles"
  ON roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Solo administradores pueden gestionar roles"
  ON roles FOR ALL
  USING (is_admin());
