# 📝 Variables de Entorno para el Backend

## 🔑 Variables para ChatGPT (OpenAI)

Solo necesitas **1 variable**:

```env
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
```

**Ejemplo:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz456...
```

**Nota:** El URL base está configurado automáticamente a `https://api.openai.com/v1`, no necesitas configurarlo.

---

## 🔑 Variables para Copilot (Gemini)

Necesitas **1 variable**:

```env
COPILOT_API_KEY=tu-api-key-de-gemini-aqui
```

**Nota:** El sistema usa Google Gemini API pero se muestra como "Copilot" en la interfaz.

**Cómo obtener la API key de Gemini:**
1. Visita [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key" (Crear clave de API)
4. Copia la clave generada

**Ejemplo:**
```env
COPILOT_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Nota:** La URL base de Gemini está configurada automáticamente (`https://generativelanguage.googleapis.com/v1beta`), no necesitas configurarla.

---

## 📋 Archivo `.env` Completo

Aquí está el ejemplo completo del archivo `.env`:

```env
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=espasticidad_db

# ============================================
# CONFIGURACIÓN DE JWT
# ============================================
JWT_SECRET=tu-secret-key-super-segura
JWT_EXPIRES_IN=2d

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
FRONTEND_URL=http://localhost:8080,http://localhost:3030,http://localhost:60797,http://localhost:54209,http://localhost:57516

# ============================================
# CONFIGURACIÓN DE IA - CHATGPT
# ============================================
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui

# ============================================
# CONFIGURACIÓN DE IA - COPILOT (GEMINI)
# ============================================
# API Key de Google Gemini (se muestra como "Copilot" en la UI)
# Obtener de: https://makersuite.google.com/app/apikey
COPILOT_API_KEY=tu-api-key-de-gemini-aqui
# Nota: La URL base de Gemini está configurada automáticamente, no necesitas COPILOT_API_BASE_URL
```

---

## ✅ Verificación

Después de configurar, reinicia el backend y revisa los logs:

**Si ChatGPT está bien:**
```
[AiProviderService] ✅ ChatGPT (OpenAI) configurado correctamente
```

**Si Copilot (Gemini) está bien:**
```
[AiProviderService] ✅ Copilot (Gemini) configurado correctamente
```

**Si falta alguna:**
```
[AiProviderService] ⚠️ OPENAI_API_KEY no configurada
[AiProviderService] ⚠️ COPILOT_API_KEY no configurada
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**
- Nunca subas el archivo `.env` a GitHub
- Las API keys son secretas
- Si expones una key, revócala inmediatamente y genera una nueva

---

## 📝 Resumen Rápido

**Para ChatGPT:**
- ✅ Solo necesitas: `OPENAI_API_KEY`

**Para Copilot:**
- ✅ Necesitas: `COPILOT_API_KEY`
- ✅ Y opcionalmente: `COPILOT_API_BASE_URL` (tiene valor por defecto)

