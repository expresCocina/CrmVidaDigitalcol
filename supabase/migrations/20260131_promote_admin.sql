-- =====================================================
-- SCRIPT: PROMOVER USUARIO A ADMINISTRADOR
-- =====================================================

-- Actualizar el rol del usuario específico a 'Administrador'
UPDATE public.usuarios
SET rol_id = (SELECT id FROM public.roles WHERE nombre = 'Administrador' LIMIT 1)
WHERE email = 'vidadigitalcol3@gmail.com';  -- <--- CORREO DEL USUARIO

-- Verificación visual
DO $$
DECLARE
  v_usuario text;
  v_rol text;
BEGIN
  SELECT u.email, r.nombre INTO v_usuario, v_rol
  FROM public.usuarios u
  JOIN public.roles r ON u.rol_id = r.id
  WHERE u.email = 'vidadigitalcol3@gmail.com';

  RAISE NOTICE 'ÉXITO: El usuario % ahora tiene el rol de %', v_usuario, v_rol;
END $$;
