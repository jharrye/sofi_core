import requests
import json
import time

WEBHOOK_URL = "http://localhost:5678/webhook/whatsapp-webhook"

def trigger_webhook():
    payload = {
        "wa_phone": "573001234567",
        "wa_message_id": "wamid.test_" + str(time.time()),
        "body": "Hola Sofi, necesito ayuda"
    }
    
    print(f"Triggering Webhook: {WEBHOOK_URL}")
    try:
        r = requests.post(WEBHOOK_URL, json=payload)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_webhook()
