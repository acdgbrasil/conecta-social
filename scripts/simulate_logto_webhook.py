import hmac
import hashlib
import json
import requests
import sys
import os
from datetime import datetime

def simulate_webhook(endpoint_url, secret, logto_user_id, email, name):
    """
    Simula o envio de um webhook assinado do Logto.
    """
    payload = {
        "hookId": "hook_test_123",
        "event": "User.Created",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "user": {
            "id": logto_user_id,
            "username": email.split('@')[0],
            "primaryEmail": email,
            "name": name,
            "customData": {}
        }
    }

    body = json.dumps(payload, separators=(',', ':'))
    
    # Gerar assinatura HMAC SHA-256
    signature = hmac.new(
        secret.encode('utf-8'),
        body.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    headers = {
        "Content-Type": "application/json",
        "logto-signature-sha-256": signature,
        "user-agent": "Logto (https://logto.io/)"
    }

    print(f"[INFO] Enviando Webhook para {endpoint_url}...")
    print(f"[INFO] Payload: {body}")
    
    try:
        response = requests.post(endpoint_url, data=body, headers=headers)
        print(f"[RESULT] Status Code: {response.status_code}")
        print(f"[RESULT] Body: {response.text}")
        
        if response.status_code == 200:
            print("[SUCCESS] Webhook processado com sucesso!")
        else:
            print("[ERROR] Falha ao processar webhook.")
            
    except Exception as e:
        print(f"[CRITICAL] Erro de conexão: {e}")

if __name__ == "__main__":
    # Configurações padrão para teste local
    URL = "http://localhost:3000/webhooks/logto"
    # Pegar secret do ambiente ou usar fallback para teste
    SECRET = os.getenv("LOGTO_WEBHOOK_SECRET", "test_secret_123")
    
    USER_ID = "logto_user_001"
    EMAIL = "teste@acdgbrasil.com.br"
    NAME = "Usuario de Teste Logto"

    simulate_webhook(URL, SECRET, USER_ID, EMAIL, NAME)
