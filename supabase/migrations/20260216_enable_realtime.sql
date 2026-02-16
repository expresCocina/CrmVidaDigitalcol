-- ============================================================================
-- INSTRUCCIONES: Ejecuta este script en Supabase Dashboard → SQL Editor
-- ============================================================================
-- Este script habilita Realtime para que los mensajes aparezcan automáticamente
-- sin recargar la página.
-- ============================================================================

-- Paso 1: Habilitar Realtime en la tabla de mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;

-- Paso 2: Habilitar Realtime en la tabla de conversaciones  
ALTER PUBLICATION supabase_realtime ADD TABLE conversaciones;

-- Paso 3: Verificar que se habilitó correctamente (opcional)
-- Ejecuta esta consulta para ver las tablas con Realtime habilitado:
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';

-- ============================================================================
-- RESULTADO ESPERADO:
-- Deberías ver 'mensajes' y 'conversaciones' en la lista
-- ============================================================================
