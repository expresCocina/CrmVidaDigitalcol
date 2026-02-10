const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local de forma manual
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed...');

    // 1. Obtener lead
    const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('id, nombre')
        .limit(1);

    if (leadError || !leads || leads.length === 0) {
        console.error('No leads found or error:', leadError);
        return;
    }
    const lead = leads[0];
    console.log('Using lead:', lead.nombre);

    // 2. Obtener usuario (para asignado_a / creado_por)
    const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error('No users found or error:', userError);
        return;
    }
    const user = users[0];
    console.log('Using user:', user.nombre_completo);

    // 3. Insertar Actividad
    const { error: actError } = await supabase.from('actividades').insert({
        tipo: 'llamada',
        titulo: 'Llamada de seguimiento inicial',
        descripcion: 'Contactar para validar interés',
        fecha_programada: new Date().toISOString(),
        estado: 'pendiente',
        lead_id: lead.id,
        creado_por: user.id,
        asignado_a: user.id
    });

    if (actError) console.error('Error creating activity:', actError);
    else console.log('Activity created successfully');

    // 4. Insertar Cita
    // Mañana a las 10am
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(11, 0, 0, 0);

    const { error: citaError } = await supabase.from('citas').insert({
        titulo: 'Presentación de Servicios',
        descripcion: 'Demo virtual de la plataforma',
        fecha_inicio: tomorrow.toISOString(),
        fecha_fin: tomorrowEnd.toISOString(),
        estado: 'programada',
        tipo: 'virtual',
        lead_id: lead.id,
        asignado_a: user.id
    });

    if (citaError) console.error('Error creating appointment:', citaError);
    else console.log('Appointment created successfully');
}

seed().catch(console.error);
