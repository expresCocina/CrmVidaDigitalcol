# Bucket de Supabase Storage para Mensajes

Este bucket almacena las imágenes y audios enviados a través de WhatsApp.

## Configuración Requerida

1. **Crear el bucket en Supabase:**
   - Ve a Storage en el Dashboard de Supabase
   - Crea un nuevo bucket llamado `mensajes`
   - Configúralo como **público** para que las URLs sean accesibles

2. **Políticas de Seguridad (RLS):**
   - Permitir INSERT para usuarios autenticados
   - Permitir SELECT público (para ver imágenes/audios en el chat)

## Estructura de Archivos

```
mensajes/
└── whatsapp/
    └── {conversacion_id}/
        ├── {timestamp}_{media_id}.jpg  (imágenes)
        └── {timestamp}_{media_id}.ogg  (audios)
```

## Comandos SQL para Políticas

```sql
-- Permitir a usuarios autenticados subir archivos
CREATE POLICY "Usuarios pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mensajes');

-- Permitir lectura pública
CREATE POLICY "Lectura pública de archivos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mensajes');
```
