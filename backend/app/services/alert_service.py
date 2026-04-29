import time
import os
import requests

# =========================
# CONFIG TELEGRAM (.env)
# =========================
BOT_TOKEN = os.getenv("TG_BOT_TOKEN")
CHAT_ID = os.getenv("TG_CHAT_ID")

# =========================
# VALIDACIÓN CRÍTICA
# =========================
if not BOT_TOKEN or not CHAT_ID:
    print("⚠️ ERROR: Telegram no configurado en .env")


# =========================
# ANTI-SPAM INTELIGENTE
# =========================
LAST_ALERT = {}
COOLDOWN = 10  # segundos


# =========================
# FUNCIÓN PRINCIPAL
# =========================
def send_telegram(message, image=None, key="default"):
    now = time.time()

    # anti-spam por evento
    last_time = LAST_ALERT.get(key)

    if last_time and (now - last_time < COOLDOWN):
        print("⛔ Anti-spam activado")
        return False

    LAST_ALERT[key] = now

    try:
        # =========================
        # ENVÍO FOTO
        # =========================
        if image and os.path.exists(image):
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"

            with open(image, "rb") as photo:
                r = requests.post(
                    url,
                    data={"chat_id": CHAT_ID, "caption": message},
                    files={"photo": photo},
                    timeout=10,
                )

        # =========================
        # ENVÍO TEXTO
        # =========================
        else:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

            r = requests.post(
                url, data={"chat_id": CHAT_ID, "text": message}, timeout=10
            )

        print("📤 Telegram status:", r.status_code)
        return r.status_code == 200

    except Exception as e:
        print("❌ Telegram error:", e)
        return False
