#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "secret.h"  // ✅ credenciales separadas

// ===========================
// WIFI
// ===========================
const char* ssid     = WIFI_SSID;
const char* password = WIFI_PASS;

// ===========================
// BACKEND
// ===========================
const char* serverUrl = SERVER_URL;  // ✅ desde secret.h
const char* API_KEY   = DEVICE_API_KEY;
const char* DEVICE_ID = "CAMARA_OBRA_1";

// ===========================
// AI THINKER PINS
// ===========================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// ===========================
// VARIABLES
// ===========================
unsigned long lastCaptureTime = 0;
const int captureInterval     = 700;

// ===========================
// PROTOTYPES
// ===========================
bool initCamera();
void connectWiFi();
void captureAndSend();
void parseResponse(String payload);

// ===========================
// SETUP
// ===========================
void setup() {
  Serial.begin(115200);
  Serial.println("\n ESP32-CAM Secure Boot...");

  if (!initCamera()) {
    Serial.println("Camera init failed");
    return;
  }

  connectWiFi();

  Serial.println("Secure device ready");
  Serial.print("Backend: ");
  Serial.println(serverUrl);
}

// ===========================
// LOOP
// ===========================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi reconnecting...");
    connectWiFi();
    delay(1000);
    return;
  }

  if (millis() - lastCaptureTime >= captureInterval) {
    captureAndSend();
    lastCaptureTime = millis();
  }
}

// ===========================
// WIFI
// ===========================
void connectWiFi() {
  Serial.print("Connecting WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi failed — check secret.h");
  }
}

// ===========================
// CAMERA INIT
// ===========================
bool initCamera() {
  camera_config_t config;

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_QVGA;
  config.jpeg_quality = 12;
  config.fb_count     = psramFound() ? 2 : 1;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera error: 0x%x\n", err);
    return false;
  }

  Serial.println("Camera OK");
  return true;
}

// ===========================
// CAPTURE + SEND
// ===========================
void captureAndSend() {
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Capture failed");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.setTimeout(15000);
  http.addHeader("Content-Type", "application/octet-stream");
  http.addHeader("x-api-key",    API_KEY);   // ✅ autenticación
  http.addHeader("x-device-id",  DEVICE_ID);

  int code = http.POST(fb->buf, fb->len);

  if (code > 0) {
    Serial.printf("Frame sent (%d) | %d bytes\n", code, fb->len);
    parseResponse(http.getString());
  } else {
    Serial.printf("HTTP Error: %s\n", http.errorToString(code).c_str());
  }

  http.end();
  esp_camera_fb_return(fb);
}

// ===========================
// PARSE RESPONSE
// ===========================
void parseResponse(String payload) {
  if (payload.length() == 0) {
    Serial.println("Empty response");
    return;
  }

  JsonDocument doc;  // ✅ ArduinoJson v7 — StaticJsonDocument deprecado

  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.printf("JSON error: %s\n", error.c_str());
    return;
  }

  const char* status = doc["status"]        | "unknown";
  int         persons = doc["persons"]      | 0;
  const char* helmet  = doc["helmet_status"]| "unknown";
  bool        saved   = doc["event_saved"]  | false;

  Serial.println("===== RESPONSE =====");
  Serial.printf("Status:  %s\n", status);
  Serial.printf("Persons: %d\n", persons);
  Serial.printf("Helmet:  %s\n", helmet);
  Serial.printf("Saved:   %s\n", saved ? "yes" : "no");

  if (persons > 0) Serial.println(">> ALERT ACTIVE");

  Serial.println("====================");
}
