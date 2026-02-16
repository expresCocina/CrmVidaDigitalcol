-- ============================================================================
-- Habilitar Realtime en Tablas de Mensajería
-- ============================================================================
-- Este script habilita las publicaciones de Realtime en las tablas necesarias
-- para que las suscripciones en el frontend funcionen correctamente.
-- ============================================================================

-- Habilitar Realtime en la tabla de mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;

-- Habilitar Realtime en la tabla de conversaciones
ALTER PUBLICATION supabase_realtime ADD TABLE conversaciones;

-- Verificar que las tablas estén publicadas
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';
