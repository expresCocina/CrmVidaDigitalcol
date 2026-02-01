-- Test query to check if lead updates are working
-- Run this in Supabase SQL Editor

-- Check current state of leads
SELECT 
    id,
    nombre,
    estado,
    fecha_conversion,
    convertido_a_cliente_id,
    created_at
FROM leads
ORDER BY created_at DESC;

-- Try to manually update a lead to test permissions
-- Replace 'LEAD_ID_HERE' with an actual lead ID from above
UPDATE leads
SET 
    estado = 'convertido',
    fecha_conversion = NOW(),
    convertido_a_cliente_id = '00000000-0000-0000-0000-000000000000'
WHERE id = 'LEAD_ID_HERE';

-- Check if update worked
SELECT 
    id,
    nombre,
    estado,
    fecha_conversion,
    convertido_a_cliente_id
FROM leads
WHERE id = 'LEAD_ID_HERE';
