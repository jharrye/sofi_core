# WhatsApp Central Router (Sofi Core)

This project implements a central router for WhatsApp messages using **Supabase** as the core database and **Node.js** as the routing service.

## Components

1.  **Supabase Database**: Stores Tenants, Projects, WA Contacts, Sessions, and Messages.
    *   **Tables**: `tenants`, `projects`, `wa_contacts`, `wa_sessions`, `wa_messages`, `wa_inbox_messages`.
2.  **Router Service (`/router-service`)**: Node.js Express app that processes incoming messages and decides where to route them (Menu or Specific Project).
3.  **n8n Workflow**: Orchestrator that receives WhatsApp Webhooks and calls the Router Service.

## Setup

1.  Go to your Supabase SQL Editor.
2.  Run the contents of `database/schema.sql` to create the `wa_*` tables.
3.  Run the contents of `database/seed.sql` to populate initial tenants and projects.
4.  Run the contents of `database/router_logic.sql` to create the `handle_router_logic` RPC.

### 2. Router Service

1.  Navigate to `router-service/`.
2.  Copy `.env.example` to `.env` and fill in your Supabase credentials:
    ```env
    SUPABASE_URL=your_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```
    > **Note**: Use the SERVICE ROLE key because the router runs server-side and needs to bypass RLS.
3.  Install dependencies:
    ```bash
    cd router-service
    npm install
    ```
4.  Start the server:
    ```bash
    npm start
    ```
    The server listens on port 3000 by default.

## API Usage

**POST** `/incoming`

**Body**:
```json
{
  "wa_phone": "573001234567",
  "wa_message_id": "wamid.HBg...",
  "text": "Hello",
  "payload": { ... }
}
```

**Response**:
```json
{
  "reply_text": "Respuesta del bot...",
  "project_name": "Estilo Plus",
  "session_id": "uuid..."
}
```
