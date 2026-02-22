-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- 1) TENANTS (Clientes)
-- =========================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- 2) PROJECTS (Negocios / Proyectos dentro del tenant)
-- =========================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  menu_key TEXT NOT NULL,                  -- "1", "2", "3" (opciones del menú)
  prompt_system TEXT DEFAULT '',           -- instrucciones del bot por proyecto
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, menu_key)
);

-- =========================
-- 3) WhatsApp Contacts
-- =========================
CREATE TABLE IF NOT EXISTS wa_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wa_phone TEXT NOT NULL,                  -- número del cliente final (quien escribe)
  display_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, wa_phone)
);

-- =========================
-- 4) WhatsApp Sessions
-- 1 sesión abierta por contacto+proyecto
-- =========================
CREATE TABLE IF NOT EXISTS wa_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES wa_contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_session
ON wa_sessions(contact_id, project_id)
WHERE status = 'open';

-- =========================
-- 5) WhatsApp Messages (Memories)
-- =========================
CREATE TABLE IF NOT EXISTS wa_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES wa_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_session_time
ON wa_messages(session_id, created_at);

-- =========================
-- 6) Inbox Dedup (anti mensajes duplicados)
-- =========================
CREATE TABLE IF NOT EXISTS wa_inbox_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES wa_contacts(id) ON DELETE SET NULL,
  wa_message_id TEXT NOT NULL,              -- id único del mensaje de WhatsApp
  direction TEXT DEFAULT 'inbound',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (wa_message_id)
);

CREATE INDEX IF NOT EXISTS idx_inbox_wa_message_id
ON wa_inbox_messages(wa_message_id);

-- =========================
-- 7) “Menu state” (para saber si el usuario ya eligió proyecto)
-- Guardado simple por contacto
-- =========================
ALTER TABLE wa_contacts
ADD COLUMN IF NOT EXISTS current_project_id UUID NULL,
ADD COLUMN IF NOT EXISTS last_menu_at TIMESTAMPTZ NULL;
