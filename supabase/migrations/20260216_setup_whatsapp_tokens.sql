-- ============================================================================
-- Configuración de Tokens de WhatsApp
-- ============================================================================
-- Instrucciones:
-- 1. Reemplaza los valores de los placeholders con tus tokens reales de Meta.
--    - "verify_token": Token que definiste en la configuración del Webhook de Meta.
--    - "access_token": Token de acceso permanente (o de larga duración) del usuario del sistema.
--    - "phone_number_id": ID del número de teléfono de WhatsApp Business.
-- 2. Ejecuta este script en el editor SQL de Supabase.
-- ============================================================================

DO $$
DECLARE
    v_verify_token TEXT := 'TU_VERIFY_TOKEN_AQUI';
    v_access_token TEXT := 'TU_ACCESS_TOKEN_AQUI';
    v_phone_number_id TEXT := 'TU_PHONE_NUMBER_ID_AQUI';
BEGIN
    -- Verificar si ya existe una integración de WhatsApp
    IF EXISTS (SELECT 1 FROM integraciones WHERE tipo = 'whatsapp') THEN
        -- Actualizar existente
        UPDATE integraciones
        SET
            activo = true,
            credenciales = jsonb_build_object(
                'verify_token', v_verify_token,
                'access_token', v_access_token,
                'phone_number_id', v_phone_number_id
            ),
            updated_at = NOW()
        WHERE tipo = 'whatsapp';
        
        RAISE NOTICE 'Integración de WhatsApp actualizada correctamente.';
    ELSE
        -- Insertar nueva
        INSERT INTO integraciones (nombre, tipo, activo, credenciales, configuracion)
        VALUES (
            'WhatsApp Business API',
            'whatsapp',
            true,
            jsonb_build_object(
                'verify_token', v_verify_token,
                'access_token', v_access_token,
                'phone_number_id', v_phone_number_id
            ),
            '{}'::jsonb
        );
        
        RAISE NOTICE 'Integración de WhatsApp creada correctamente.';
    END IF;
END $$;
