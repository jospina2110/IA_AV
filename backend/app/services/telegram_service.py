import requests
import time
import os
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

BOT_TOKEN = settings.TG_BOT_TOKEN
CHAT_ID = settings.TG_CHAT_ID
ANTI_SPAM_SECONDS = settings.TG_ANTI_SPAM_SECONDS

# Dict con timestamp del último envío por cada key.
# Permite cooldowns independientes por dispositivo o tipo de alerta.
_last_sent: dict[str, float] = {}


def send_telegram_alert(
    message: str, image_path: str | None = None, key: str = "default"
) -> bool:
    if not BOT_TOKEN or not CHAT_ID:
        print("⚠️ Telegram no configurado en .env (TG_BOT_TOKEN / TG_CHAT_ID)")
        return False

    now = time.time()
    if now - _last_sent.get(key, 0) < ANTI_SPAM_SECONDS:
        print(f"⛔ Anti-spam activo para key '{key}' ({ANTI_SPAM_SECONDS}s)")
        return False

    _last_sent[key] = now  # reservar slot antes del intento

    try:
        if image_path and os.path.exists(image_path):
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
            with open(image_path, "rb") as photo:
                r = requests.post(
                    url,
                    data={"chat_id": CHAT_ID, "caption": message},
                    files={"photo": photo},
                    timeout=15,
                )
        else:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            r = requests.post(
                url,
                data={"chat_id": CHAT_ID, "text": message},
                timeout=5,
            )

        if r.status_code == 200:
            print(f"📤 Telegram OK — key '{key}'")
            return True

        _last_sent[key] = 0  # liberar slot para reintentar
        print(f"❌ Telegram error {r.status_code}: {r.text}")
        return False

    except requests.exceptions.Timeout:
        _last_sent[key] = 0
        print("❌ Telegram: timeout")
        return False

    except Exception as e:
        _last_sent[key] = 0
        print(f"❌ Telegram: error inesperado — {e}")
        return False
