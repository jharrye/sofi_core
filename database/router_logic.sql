-- Router Logic for WhatsApp Multi-client
-- Handles 24h session window and project routing

CREATE OR REPLACE FUNCTION handle_router_logic(
    p_wa_phone TEXT,
    p_wa_message_id TEXT,
    p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_name TEXT := 'EstiloPlus Holding';
    v_tenant_id UUID;
    v_contact_id UUID;
    v_session_id UUID;
    v_project_id UUID;
    v_current_project_id UUID;
    v_menu_key TEXT;
    v_msg_content TEXT;
    v_session_status TEXT;
    v_session_created_at TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- 1. Get Tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE name = v_tenant_name LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant % not found', v_tenant_name;
    END IF;

    -- 2. Find or Create Contact
    INSERT INTO wa_contacts (tenant_id, wa_phone)
    VALUES (v_tenant_id, p_wa_phone)
    ON CONFLICT (tenant_id, wa_phone) DO UPDATE
    SET last_menu_at = CASE WHEN wa_contacts.last_menu_at IS NULL THEN NOW() ELSE wa_contacts.last_menu_at END
    RETURNING id INTO v_contact_id;

    -- 3. Check for Active Open Session (created within last 24h)
    SELECT id, project_id, created_at
    INTO v_session_id, v_current_project_id, v_session_created_at
    FROM wa_sessions
    WHERE contact_id = v_contact_id
      AND status = 'open'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Check if session expired (older than 24h)
    IF v_session_id IS NOT NULL THEN
        IF v_session_created_at < NOW() - INTERVAL '24 hours' THEN
            -- Close expired session
            UPDATE wa_sessions SET status = 'closed' WHERE id = v_session_id;
            v_session_id := NULL;
            v_current_project_id := NULL;
        END IF;
    END IF;

    -- 4. Routing Logic
    IF v_session_id IS NOT NULL THEN
        -- Active session exists, continue it
        RETURN jsonb_build_object(
            'status', 'active_session',
            'session_id', v_session_id,
            'project_id', v_current_project_id,
            'action', 'process_message'
        );
    ELSE
        -- No active session. 
        -- Check if message is a menu selection (1, 2, 3...)
        -- Or default to "Menu Principal" project if not a valid selection
        
        v_msg_content := TRIM(p_payload->>'body'); -- Assuming payload has body
        
        -- Try to find project by menu_key
        SELECT id INTO v_project_id
        FROM projects
        WHERE tenant_id = v_tenant_id
          AND menu_key = v_msg_content
          AND is_active = TRUE;
          
        IF v_project_id IS NOT NULL THEN
            -- User selected a valid project
            INSERT INTO wa_sessions (tenant_id, project_id, contact_id, status)
            VALUES (v_tenant_id, v_project_id, v_contact_id, 'open')
            RETURNING id INTO v_session_id;
            
            RETURN jsonb_build_object(
                'status', 'new_session',
                'session_id', v_session_id,
                'project_id', v_project_id,
                'action', 'start_project_flow'
            );
        ELSE
            -- Invalid selection or new user -> Assign to "Menu Principal" project
            -- Find "Menu Principal" project ID (assuming key '0')
            SELECT id INTO v_project_id
            FROM projects
            WHERE tenant_id = v_tenant_id
              AND menu_key = '0'; -- Menu Principal
              
            IF v_project_id IS NULL THEN
                 -- Fallback if Menu Principal not found, maybe pick first one or error
                 -- For now, error or try key '2' (Sofi)
                 SELECT id INTO v_project_id FROM projects WHERE tenant_id = v_tenant_id LIMIT 1;
            END IF;

            -- Create session for Menu Principal
            INSERT INTO wa_sessions (tenant_id, project_id, contact_id, status)
            VALUES (v_tenant_id, v_project_id, v_contact_id, 'open')
            RETURNING id INTO v_session_id;

            RETURN jsonb_build_object(
                'status', 'menu_session',
                'session_id', v_session_id,
                'project_id', v_project_id,
                'action', 'show_main_menu'
            );
        END IF;
    END IF;
END;
$$;
