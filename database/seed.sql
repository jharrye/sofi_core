-- Seed Data

DO $$
DECLARE
    new_tenant_id UUID;
BEGIN
    -- 1. Create Tenant (simple check if exists to avoid dupes in seed rerun scenarios if not using truncate)
    IF NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'EstiloPlus Holding') THEN
        INSERT INTO tenants (name, status)
        VALUES ('EstiloPlus Holding', 'active')
        RETURNING id INTO new_tenant_id;
    ELSE
        SELECT id INTO new_tenant_id FROM tenants WHERE name = 'EstiloPlus Holding';
    END IF;

    -- 2. Create Projects for this Tenant
    -- Conflict DO NOTHING to avoid errors on re-run
    INSERT INTO projects (tenant_id, name, menu_key, prompt_system, is_active)
    VALUES 
    (new_tenant_id, 'Estilo Plus', '1', 'Eres un asistente de Estilo Plus. Vendes ropa y accesorios.', TRUE),
    (new_tenant_id, 'Sofi te Acompaña', '2', 'Eres Sofi, una acompañante empática y útil.', TRUE),
    (new_tenant_id, 'Servicios Web/Marketing', '3', 'Ofreces servicios de desarrollo web y marketing digital.', TRUE),
    (new_tenant_id, 'Asesor humano', '9', 'Redireccionando a un asesor humano...', TRUE),
    (new_tenant_id, 'Menu Principal', '0', 'Menu Principal de seleccion de servicios.', TRUE)
    ON CONFLICT (tenant_id, menu_key) DO NOTHING;

END $$;
