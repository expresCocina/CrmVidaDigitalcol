
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeads() {
    console.log("Checking leads...");

    // Get all leads
    const { data: leads, error } = await supabase
        .from("leads")
        .select("id, nombre, estado, created_at, fecha_conversion, convertido_a_cliente_id")
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching leads:", error);
        return;
    }

    console.table(leads);

    const convertedCount = leads?.filter(l => l.estado === 'convertido').length;
    console.log(`Leads with state 'convertido' in last 10: ${convertedCount}`);

    const convertedWithDateCount = leads?.filter(l => l.estado === 'convertido' && l.fecha_conversion).length;
    console.log(`Leads with state 'convertido' AND date in last 10: ${convertedWithDateCount}`);
}

checkLeads();
