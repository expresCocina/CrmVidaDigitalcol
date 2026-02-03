-- =====================================================
-- SCRIPT DE CORRECCIÓN DE PERMISOS (IA)
-- Ejecutar en Supabase -> SQL Editor
-- =====================================================

-- 1. Corregir permisos para CONFIGURACIÓN DE IA
-- Permitir que cualquier usuario autenticado pueda crear, editar y borrar configuraciones
DROP POLICY IF EXISTS "Solo administradores pueden gestionar IA" ON configuracion_ia;

CREATE POLICY "Usuarios autenticados pueden gestionar IA"
  ON configuracion_ia
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 2. Corregir permisos para PROMPTS DEL SISTEMA (Faltaban policies)
-- Permitir acceso completo a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver prompts"
  ON prompts_sistema FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden gestionar prompts"
  ON prompts_sistema FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 3. Asegurar que RLS está habilitado
ALTER TABLE configuracion_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts_sistema ENABLE ROW LEVEL SECURITY;
