# Guía de Recreación de Sofi Core en n8n

Este documento detalla los pasos exactos para implementar el flujo de Sofi Core en una nueva instancia de n8n.

## 1. Importar el Flujo
1. Abre n8n en el nuevo PC.
2. Crea un nuevo Workflow.
3. En el menú superior derecho, selecciona **Import from File**.
4. Selecciona el archivo **sofi_core_implementation.json**.

## 2. Configurar Credenciales

### Postgres (Supabase)
Debes crear una nueva credencial de tipo **Postgres** con los siguientes datos:
- **Host:** `db.otwrjisvqfmlwngbsoiq.supabase.co`
- **Port:** `6543`
- **Database:** `postgres`
- **User:** `n8n_app`
- **Password:** `YOUR_DATABASE_PASSWORD`
- **SSL:** `Require`

### Google Gemini
Debes crear una nueva credencial de tipo **Google Gemini API** (o **Google Palm API** según la versión de n8n):
- **API Key:** `YOUR_GEMINI_KEY` (See .env)

## 3. Ajustar Nodos
Una vez creadas las credenciales, asegúrate de asignarlas en los nodos correspondientes:
- El nodo **Execute a SQL query** debe usar la credencial de Postgres.
- El nodo **Google Gemini Chat Model** debe usar la credencial de Gemini.

## 4. Activar el Webhook
1. Haz clic en el botón **Execute Workflow** para probarlo manualmente.
2. Para producción, haz clic en el interruptor **Active** en la esquina superior derecha.
3. La URL de producción será: `http://<TU_IP_O_HOST>:5678/webhook/whatsapp-webhook`

---
> [!IMPORTANT]
> Asegúrate de que el puerto `5678` esté abierto en el nuevo PC si planeas recibir mensajes desde el exterior (Make.com / WhatsApp Cloud API).
