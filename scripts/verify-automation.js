const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);

async function verify() {
    console.log('--- Verifying Auto Conversion ---');

    // 1. Create a Lead
    const leadData = {
        nombre: 'Auto Convert Test ' + Date.now(),
        email: 'autoconvert' + Date.now() + '@test.com',
        empresa: 'Auto Corp ' + Date.now(),
        estado: 'nuevo'
    };

    const { data: lead, error: createError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

    if (createError) {
        console.error('Error creating lead:', createError);
        return;
    }
    console.log('1. Created Lead:', lead.id, lead.nombre);

    // 2. Update Lead to 'convertido'
    const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update({ estado: 'convertido' })
        .eq('id', lead.id)
        .select()
        .single();

    if (updateError) {
        console.error('Error updating lead:', updateError);
        return;
    }
    console.log('2. Updated Lead Status:', updatedLead.estado);

    // 3. Verify Client created
    if (updatedLead.convertido_a_cliente_id) {
        console.log('3. Lead has client ID:', updatedLead.convertido_a_cliente_id);

        const { data: client, error: clientError } = await supabase
            .from('clientes')
            .select('*')
            .eq('id', updatedLead.convertido_a_cliente_id)
            .single();

        if (client) {
            console.log('4. SUCCESS: Client found:', client.nombre, client.empresa);
        } else {
            console.error('4. FAILURE: Client not found in DB', clientError);
        }
    } else {
        console.error('3. FAILURE: Lead has no client ID');
    }
}

verify().catch(console.error);
