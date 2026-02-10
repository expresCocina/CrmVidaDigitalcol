-- =====================================================
-- CORRECCIÓN DEFINITIVA: FIX PARA CREACIÓN DE USUARIOS
-- =====================================================

-- 1. Insertar roles por defecto (seguro de ejecutar múltiples veces)
INSERT INTO public.roles (nombre, descripcion)
VALUES 
  ('Administrador', 'Acceso total al sistema'),
  ('Vendedor', 'Acceso a gestión de leads, clientes y ventas'),
  ('Soporte', 'Acceso a gestión de tickets y clientes')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Asegurar que las políticas estén limpias y correctas
-- Primero borramos las políticas viejas si existen para evitar el error "already exists"
DROP POLICY IF EXISTS "Solo administradores pueden crear usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Permitir inserción de usuarios por sistema" ON public.usuarios;

-- Ahora creamos la política limpia
CREATE POLICY "Permitir inserción de usuarios por sistema"
  ON public.usuarios FOR INSERT
  WITH CHECK (true);

-- Confirmación visual
DO $$
BEGIN
  RAISE NOTICE 'Corrección aplicada con éxito. Ya puedes registrar usuarios.';
END $$;
