# 🚀 Opciones de IA sin Azure

## ✅ Múltiples Proveedores Soportados

El sistema ahora soporta **múltiples proveedores de IA** sin necesidad de Azure:

### 1. OpenAI (Recomendado - Más fácil)

**Ventajas:**
- ✅ Fácil de obtener API key
- ✅ Excelente para análisis médico
- ✅ Muy confiable
- ✅ Buena documentación

**Configuración:**

```env
AI_PROVIDER=openai
AI_API_KEY=sk-tu-api-key-de-openai
AI_BASE_URL=https://api.openai.com/v1
```

**Obtener API Key:**
1. Ve a https://platform.openai.com/api-keys
2. Crea una cuenta (si no tienes)
3. Crea una nueva API key
4. Copia la key (empieza con `sk-`)

---

### 2. Google Gemini (Gratis hasta cierto límite)

**Ventajas:**
- ✅ Plan gratuito disponible
- ✅ Buen rendimiento
- ✅ Fácil de configurar

**Configuración:**

```env
AI_PROVIDER=gemini
AI_API_KEY=tu-api-key-de-google
AI_BASE_URL=https://generativelanguage.googleapis.com/v1
```

**Obtener API Key:**
1. Ve a https://makersuite.google.com/app/apikey
2. Inicia sesión con Google
3. Crea una nueva API key
4. Copia la key

---

### 3. Anthropic Claude (Muy bueno para medicina)

**Ventajas:**
- ✅ Excelente para análisis médico
- ✅ Muy preciso
- ✅ Buen razonamiento

**Configuración:**

```env
AI_PROVIDER=claude
AI_API_KEY=sk-ant-tu-api-key-de-claude
AI_BASE_URL=https://api.anthropic.com/v1
```

**Obtener API Key:**
1. Ve a https://console.anthropic.com/
2. Crea una cuenta
3. Ve a API Keys
4. Crea una nueva key
5. Copia la key (empieza con `sk-ant-`)

---

### 4. APIMATIC (Si ya lo tienes configurado)

**Configuración:**

```env
AI_PROVIDER=apimatic
AI_API_KEY=PnkAFwzbk6A_hfXBE1GxCKGI-JDIpLSCCL0QkyE_QVaVqdBhuoXSBOOFV2HbO8au
AI_BASE_URL=https://api.apimatic.io/v1
```

---

## 🎯 Recomendación Rápida

**Para empezar rápido, usa OpenAI:**

1. Ve a https://platform.openai.com/api-keys
2. Crea una cuenta (gratis con créditos iniciales)
3. Crea una API key
4. Configura en `.env`:

```env
AI_PROVIDER=openai
AI_API_KEY=sk-tu-key-aqui
```

5. Reinicia el backend
6. ¡Listo! Ya funciona

---

## 📋 Configuración Completa

### Paso 1: Elegir Proveedor

Elige uno de los proveedores arriba (recomendado: OpenAI)

### Paso 2: Obtener API Key

Sigue las instrucciones del proveedor elegido

### Paso 3: Configurar `.env`

Agrega estas variables al archivo `.env` del backend:

```env
# Proveedor de IA (openai, gemini, claude, apimatic)
AI_PROVIDER=openai

# API Key del proveedor elegido
AI_API_KEY=tu-api-key-aqui

# URL base (opcional, se auto-configura según el proveedor)
# AI_BASE_URL=https://api.openai.com/v1
```

### Paso 4: Reiniciar Backend

```bash
npm run start:dev
```

### Paso 5: Verificar

Revisa los logs del backend. Deberías ver:

```
[AiProviderService] AiProviderService configurado con proveedor: openai
```

Si ves:

```
[AiProviderService] AI_API_KEY no configurada para openai. Usará modo simulado.
```

Significa que la API key no está configurada correctamente.

---

## 🧪 Prueba

Una vez configurado, prueba desde Flutter:

1. Ve a la pantalla de Diagnóstico IA
2. Selecciona un modelo (ChatGPT-4 o Copilot Medical)
3. Haz clic en "Ejecutar Análisis"
4. Debería usar la IA real (no simulado)

---

## 💰 Costos Aproximados

- **OpenAI GPT-4**: ~$0.03 por análisis
- **Google Gemini**: Gratis hasta cierto límite, luego ~$0.001 por análisis
- **Claude**: ~$0.015 por análisis
- **APIMATIC**: Depende de tu plan

---

## 🔧 Troubleshooting

### Error: "Usando modo simulado"

**Causa:** API key no configurada o incorrecta

**Solución:**
1. Verifica que `.env` tenga `AI_API_KEY=...`
2. Verifica que no haya espacios en la key
3. Reinicia el backend

### Error: 401 Unauthorized

**Causa:** API key incorrecta o expirada

**Solución:**
1. Verifica que la key sea correcta
2. Genera una nueva key
3. Actualiza `.env`

### Error: 429 Too Many Requests

**Causa:** Límite de uso excedido

**Solución:**
1. Espera unos minutos
2. O actualiza tu plan del proveedor

---

## 📝 Notas

- El sistema tiene **fallback automático**: si falla, usa resultados simulados
- Puedes cambiar de proveedor fácilmente cambiando `AI_PROVIDER` en `.env`
- Todos los proveedores usan el mismo formato de respuesta
- El código detecta automáticamente el proveedor y ajusta la autenticación

---

## 🚀 Siguiente Paso

**Recomendación:** Empieza con OpenAI (más fácil y confiable)

1. Ve a https://platform.openai.com/api-keys
2. Crea una API key
3. Configura en `.env`
4. Reinicia el backend
5. ¡Prueba el análisis!

