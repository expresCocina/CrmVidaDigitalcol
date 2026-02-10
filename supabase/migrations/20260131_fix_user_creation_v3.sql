-- =====================================================
-- CORRECCIÓN FINAL: RECREAR TRIGGER A PRUEBA DE FALLOS
-- =====================================================

-- 1. Asegurarnos que los roles existan (de nuevo)
INSERT INTO public.roles (nombre, descripcion)
VALUES 
  ('Administrador', 'Acceso total al sistema'),
  ('Vendedor', 'Acceso a gestión de leads, clientes y ventas'),
  ('Soporte', 'Acceso a gestión de tickets y clientes')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Reemplazar la función del trigger por una MÁS ROBUSTA
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Intentar buscar el rol, pero no fallar si no existe (usar NULL)
  BEGIN
    SELECT id INTO default_role_id
    FROM public.roles
    WHERE nombre = 'Vendedor'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    default_role_id := NULL;
  END;

  -- Insertar el usuario asegurando que no falle por nulos
  INSERT INTO public.usuarios (id, email, nombre_completo, rol_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario Sin Nombre'),
    default_role_id
  )
  ON CONFLICT (id) DO NOTHING; -- Si ya existe, no hacer nada (idempotente)
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En caso de error catastrófico, loguear pero NO detener el registro en Auth
  -- (Esto permite que el usuario se cree en Auth aunque falle en public.usuarios, útil para debug)
  RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asegurar permisos RLS (Idempotente)
DROP POLICY IF EXISTS "Permitir inserción de usuarios por sistema" ON public.usuarios;
CREATE POLICY "Permitir inserción de usuarios por sistema"
  ON public.usuarios FOR INSERT
  WITH CHECK (true);

-- 4. Asegurar permisos sobre la tabla ROLES para el sistema
GRANT SELECT ON public.roles TO postgres, authenticated, anon, service_role;
