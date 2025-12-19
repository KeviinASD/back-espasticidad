# 🔑 Cómo Obtener las API Keys para ChatGPT y Copilot

## 📋 Resumen

Necesitas **2 API keys**:
1. **ChatGPT (OpenAI)** - Para análisis con GPT-4
2. **Copilot Medical** - Para análisis médico especializado

---

## 1️⃣ ChatGPT (OpenAI) - API Key

### Pasos para Obtenerla:

1. **Ve a la página de OpenAI:**
   - URL: https://platform.openai.com/api-keys
   - O ve a https://platform.openai.com y luego "API keys"

2. **Inicia sesión o crea cuenta:**
   - Si no tienes cuenta, crea una (es gratis registrarse)
   - Te dan créditos iniciales gratis para probar

3. **Crea una nueva API key:**
   - Haz clic en "Create new secret key"
   - Dale un nombre (ej: "FisioLab Medical")
   - **IMPORTANTE:** Copia la key inmediatamente, solo se muestra una vez
   - La key empieza con `sk-` (ej: `sk-proj-abc123...`)

4. **Configura en el backend:**
   - Agrega al archivo `.env`:
   ```env
   OPENAI_API_KEY=sk-tu-api-key-aqui
   ```

### 💰 Costos:
- Plan gratuito: $5 de créditos iniciales
- GPT-4: ~$0.03 por análisis
- Muy económico para empezar

### 🔗 Enlaces:
- **Obtener API Key:** https://platform.openai.com/api-keys
- **Documentación:** https://platform.openai.com/docs
- **Precios:** https://openai.com/api/pricing

---

## 2️⃣ Copilot Medical - API Key

### Opción A: Microsoft Azure (Recomendado)

1. **Ve a Azure Portal:**
   - URL: https://portal.azure.com
   - Inicia sesión con tu cuenta Microsoft

2. **Crea un recurso de Azure OpenAI:**
   - Busca "Azure OpenAI" en el buscador
   - Haz clic en "Create"
   - Completa el formulario:
     - Subscription: Elige tu suscripción
     - Resource group: Crea uno nuevo o usa existente
     - Region: Elige la más cercana
     - Name: Un nombre para tu recurso
   - Haz clic en "Review + create" y luego "Create"

3. **Obtén la API Key:**
   - Ve a tu recurso creado
   - En el menú lateral, busca "Keys and Endpoint"
   - Copia la **Key 1** o **Key 2**
   - También copia el **Endpoint** (URL)

4. **Configura en el backend:**
   ```env
   COPILOT_API_KEY=tu-key-de-azure
   COPILOT_API_BASE_URL=https://tu-recurso.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview
   ```

### Opción B: APIMATIC (Si ya lo tienes configurado)

Si APIMATIC está configurado para acceder a Copilot:

1. **Usa la API key de APIMATIC que ya tienes:**
   - Key: `PnkAFwzbk6A_hfXBE1GxCKGI-JDIpLSCCL0QkyE_QVaVqdBhuoXSBOOFV2HbO8au`

2. **Configura en el backend:**
   ```env
   COPILOT_API_KEY=PnkAFwzbk6A_hfXBE1GxCKGI-JDIpLSCCL0QkyE_QVaVqdBhuoXSBOOFV2HbO8au
   COPILOT_API_BASE_URL=https://api.apimatic.io/v1
   ```

3. **Verifica el endpoint en APIMATIC:**
   - Ve a tu API en APIMATIC
   - Busca el endpoint para análisis médico
   - Ajusta `COPILOT_API_BASE_URL` si es diferente

### Opción C: Microsoft Copilot Studio (Si está disponible)

1. **Ve a Copilot Studio:**
   - URL: https://copilotstudio.microsoft.com
   - Inicia sesión

2. **Obtén la API key:**
   - Ve a Settings > API Keys
   - Crea una nueva key para uso médico
   - Copia la key

3. **Configura en el backend:**
   ```env
   COPILOT_API_KEY=tu-key-de-copilot-studio
   COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com/v1
   ```

---

## ⚙️ Configuración Completa en `.env`

Agrega estas líneas al archivo `.env` del backend:

```env
# ChatGPT (OpenAI)
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui

# Copilot Medical
COPILOT_API_KEY=tu-api-key-de-copilot-aqui
COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com/v1
# O si usas Azure:
# COPILOT_API_BASE_URL=https://tu-recurso.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview
# O si usas APIMATIC:
# COPILOT_API_BASE_URL=https://api.apimatic.io/v1
```

---

## ✅ Verificación

Después de configurar, reinicia el backend y revisa los logs:

**Si está bien configurado, verás:**
```
[AiProviderService] ✅ ChatGPT (OpenAI) configurado correctamente
[AiProviderService] ✅ Copilot Medical configurado correctamente
```

**Si falta alguna key, verás:**
```
[AiProviderService] ⚠️ OPENAI_API_KEY no configurada
[AiProviderService] ⚠️ COPILOT_API_KEY no configurada
```

---

## 🧪 Prueba

1. **Reinicia el backend:**
   ```bash
   npm run start:dev
   ```

2. **Desde Flutter:**
   - Ve a Diagnóstico IA
   - Selecciona "ChatGPT-4" → Debería usar OpenAI
   - Selecciona "Copilot Medical" → Debería usar Copilot

3. **Haz clic en "Ejecutar Análisis"**
   - Debería hacer el análisis real (no simulado)
   - Revisa los logs del backend para ver si hay errores

---

## 🔍 Troubleshooting

### Error: "ChatGPT no configurado, usando resultado simulado"

**Solución:**
- Verifica que `OPENAI_API_KEY` esté en `.env`
- Verifica que no haya espacios en la key
- Reinicia el backend

### Error: "Copilot no configurado, usando resultado simulado"

**Solución:**
- Verifica que `COPILOT_API_KEY` esté en `.env`
- Verifica que `COPILOT_API_BASE_URL` sea correcta
- Reinicia el backend

### Error: 401 Unauthorized

**Solución:**
- La API key es incorrecta o expirada
- Genera una nueva key
- Actualiza `.env`

### Error: 429 Too Many Requests

**Solución:**
- Has excedido el límite de uso
- Espera unos minutos
- O actualiza tu plan

---

## 📝 Notas Importantes

1. **Las API keys son sensibles:** No las compartas ni las subas a GitHub
2. **Costo:** ChatGPT tiene créditos iniciales gratis, luego es de pago
3. **Límites:** Cada proveedor tiene límites de uso según tu plan
4. **Fallback:** Si falla una API, automáticamente usa resultado simulado

---

## 🚀 Siguiente Paso

1. ✅ Obtén la API key de ChatGPT
2. ✅ Obtén la API key de Copilot (Azure, APIMATIC, o Copilot Studio)
3. ✅ Configura ambas en `.env`
4. ✅ Reinicia el backend
5. ✅ Prueba desde Flutter

¡Listo! Ya puedes usar ambas IAs para análisis médico.

