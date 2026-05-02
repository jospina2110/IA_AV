# SmartSite IA_AV — Sistema de Vigilancia Inteligente para Obras

> Detección de personas y cascos de seguridad en tiempo real mediante ESP32-CAM + YOLOv8 + FastAPI

---

## Descripción

SmartSite es un sistema de seguridad industrial que procesa imágenes capturadas por una cámara ESP32-CAM en sitios de construcción. Detecta personas y verifica el uso de cascos (EPP) mediante inteligencia artificial, enviando alertas por Telegram cuando se detectan infracciones de seguridad.

---

## Arquitectura

```
ESP32-CAM  →  WiFi  →  Backend FastAPI  →  YOLOv8 (personas + EPP)
                              ↓
                     Persistencia JSON
                              ↓
                    Alertas Telegram
                              ↓
                   Dashboard React (live)
```

---

## Stack tecnológico

| Capa | Tecnología |

Dispositivo- ESP32-CAM AI-Thinker
Backend- Python 3.11 · FastAPI · Uvicorn
IA- YOLOv8n (personas) · YOLOv8 EPP (cascos)
Frontend - React 19 · Vite · Axios
Servidor web- Nginx
Contenedores- Docker · Docker Compose
Autenticación- JWT (dashboard) · API Key (ESP32)
Alertas-Telegram Bot API

---

## Requisitos

- Docker Desktop instalado
- Python 3.11+ (solo para desarrollo local)
- Node.js 20+ (solo para desarrollo local)
- Arduino IDE (para programar el ESP32-CAM)

---

## Instalación y despliegue

### Con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/jospina2110/IA_AV.git
cd IA_AV

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar backend/.env con tus credenciales

# 3. Construir y arrancar
docker-compose up --build
```

El sistema estará disponible en:

- **Dashboard:** `http://localhost`
- **API:** `http://localhost:8000`
- **Documentación API:** `http://localhost:8000/docs`

### Desarrollo local

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev -- --host
```

---

## Configuración

### `backend/.env`

```ini
# Storage
UPLOAD_DIR=data/images
PROCESSED_DIR=data/processed
EVENTS_FILE=data/events.json

# YOLO
YOLO_MODEL=yolov8n.pt
YOLO_PPE_MODEL=keremberke/yolov8n-hard-hat-detection
YOLO_CONF=0.35
YOLO_IOU=0.5

# Autenticación ESP32
DEVICE_API_KEY=tu_clave_secreta_aqui

# JWT
SECRET_KEY=tu_jwt_secret_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Admin dashboard
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password_aqui

# Telegram
TG_BOT_TOKEN=token_de_tu_bot
TG_CHAT_ID=tu_chat_id
TG_ANTI_SPAM_SECONDS=10

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://192.168.1.8:8000
```

### `frontend/.env`

```ini
# Desarrollo local
VITE_API_URL=http://127.0.0.1:8000/api

# Red local con ESP32
# VITE_API_URL=http://192.168.1.8:8000/api

# Docker
# VITE_API_URL=http://192.168.1.8/api
```

---

## ESP32-CAM

### Configuración

Crea el archivo `esp32/secret.h` (ignorado por git):

```cpp
#pragma once
#define WIFI_SSID       "nombre_de_tu_red"
#define WIFI_PASS       "contraseña_wifi"
#define DEVICE_API_KEY  "tu_clave_secreta_aqui"
#define SERVER_URL      "http://192.168.1.8:8000/api/upload"
```

### Subir el código

1. Abrir `esp32/camera_code/camera_code.ino` en Arduino IDE
2. Seleccionar placa: `AI Thinker ESP32-CAM`
3. Seleccionar puerto COM correspondiente
4. Subir — mantener presionado `IO0` durante la carga

### Dependencias Arduino

- `ArduinoJson` (gestor de librerías)

---

## API Endpoints

| Método   | Ruta                 | Descripción             | Auth    |
| -------- | -------------------- | ----------------------- | ------- |
| `POST`   | `/api/upload`        | Recibe imagen del ESP32 | API Key |
| `GET`    | `/api/events`        | Lista eventos paginados | —       |
| `GET`    | `/api/events/latest` | Último evento           | —       |
| `GET`    | `/api/events/stats`  | Estadísticas            | —       |
| `DELETE` | `/api/events`        | Limpiar historial       | —       |
| `POST`   | `/api/auth/login`    | Login admin             | —       |
| `GET`    | `/health`            | Estado del servidor     | —       |

---

## Detección de EPP

El sistema usa dos modelos en cadena:

- **Modelo 1 — Personas:** `yolov8n.pt` detecta personas en la escena
- **Modelo 2 — EPP:** `keremberke/yolov8n-hard-hat-detection` detecta cascos

### Estados de `helmet_status`

| Estado            | Significado                                 |
| ----------------- | ------------------------------------------- |
| `no_persons`      | No hay personas en la imagen                |
| `detected`        | Todas las personas tienen casco             |
| `partial`         | Algunas personas sin casco                  |
| `not_detected`    | Ninguna persona tiene casco — alerta activa |
| `not_implemented` | Modelo EPP no disponible                    |

---

## Estructura del proyecto

```
IA_AV/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # upload, events, auth, devices
│   │   ├── core/             # config, security, cache
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # detector, telegram, events, image
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Dashboard, Login, LiveFeed, EventsPanel
│   │   └── api/axios.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── esp32/
│   ├── camera_code/
│   │   └── camera_code.ino
│   └── .gitignore            # ignora secret.h
└── docker-compose.yml
```

---

## Seguridad

- Las credenciales WiFi van en `esp32/secret.h` — nunca en el repositorio
- El `.env` del backend nunca se versiona — usar `.env.example` como plantilla
- El ESP32 se autentica con `X-API-Key` en cada petición
- El dashboard usa JWT con expiración configurable
- Las imágenes y eventos de producción están en `data/` — ignorado por git

---

## Comandos útiles Docker

```bash
# Arrancar en background
docker-compose up -d

# Ver logs del backend
docker-compose logs -f backend

# Detener
docker-compose down

# Rebuild completo
docker-compose down && docker-compose build --no-cache && docker-compose up
```

---

## Autor

Desarrollado por **Jean Ospina** — SmartSite IA_AV  
Sistema de vigilancia inteligente para sitios de construcción
