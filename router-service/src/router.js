const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handleIncomingMessage(payload) {
    const { wa_phone, wa_message_id, text, payload: rawPayload } = payload;

    if (!wa_phone || !wa_message_id) {
        throw new Error('Missing required fields: wa_phone, wa_message_id');
    }

    console.log(`Processing message from ${wa_phone}: ${wa_message_id}`);

    try {
        // 1. Call RPC for Routing Logic
        const { data: routerResult, error: rpcError } = await supabase.rpc('handle_router_logic', {
            p_wa_phone: wa_phone,
            p_wa_message_id: wa_message_id,
            p_payload: rawPayload || { body: text }
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw rpcError;
        }

        const { status, session_id, project_id, action } = routerResult;

        // 2. Fetch Project Name if available
        let projectName = null;
        if (project_id) {
            const { data: proj } = await supabase
                .from('projects')
                .select('name')
                .eq('id', project_id)
                .single();
            if (proj) projectName = proj.name;
        }

        // 3. Construct Reply / Response
        let replyText = '';
        if (action === 'show_main_menu') {
            const { data: menuProjects } = await supabase
                .from('projects')
                .select('menu_key, name')
                .eq('tenant_id', (await getTenantId())) // Helper or assume single tenant
                .eq('is_active', true)
                .order('menu_key');
            
            const menuList = menuProjects?.map(p => `${p.menu_key}. ${p.name}`).join('\n') || '';
            replyText = `Hola, bienvenido a EstiloPlus Holding.\nPor favor selecciona una opción:\n\n${menuList}\n9. Asesor Humano`;
        } else if (action === 'start_project_flow') {
             replyText = `[${projectName}] Has iniciado una nueva conversación. ¿En qué podemos ayudarte?`;
        } else {
             replyText = `[${projectName || 'Sofi'}] Recibido.`;
        }

        // Return standardized response
        return {
            status,
            action,
            session_id,
            project_id,
            project_name: projectName,
            reply_text: replyText
        };

    } catch (error) {
        console.error('Handler Error:', error);
        throw error; // Propagate to index.js
    }
}

// Helper to get Tenant ID (Cache this in production)
async function getTenantId() {
    const { data } = await supabase.from('tenants').select('id').eq('name', 'EstiloPlus Holding').single();
    return data?.id;
}

module.exports = { handleIncomingMessage };
