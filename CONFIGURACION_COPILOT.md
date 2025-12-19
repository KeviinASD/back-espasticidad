# ⚠️ IMPORTANTE: Configuración de Copilot Medical API

## 🔑 Diferencia entre APIMATIC y Copilot Medical

**APIMATIC** es una plataforma para generar SDKs y gestionar APIs. La API key que ves en APIMATIC (`PnkAFwzbk6A_hfXBE1GxCKGI-JDIpLSCCL0QkyE_QVaVqdBhuoXSBOOFV2HbO8au`) es para usar los servicios de APIMATIC, **NO es la API key de Copilot Medical**.

## 📋 Pasos para Obtener la API Key de Copilot Medical

### Opción 1: Microsoft Azure (Recomendado)

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca "Azure OpenAI" o "Cognitive Services"
3. Crea un recurso de Azure OpenAI
4. Ve a "Keys and Endpoint"
5. Copia la **Key 1** o **Key 2**

### Opción 2: Microsoft Copilot Studio

1. Ve a [Microsoft Copilot Studio](https://copilotstudio.microsoft.com)
2. Inicia sesión con tu cuenta Microsoft
3. Ve a "Settings" > "API Keys"
4. Crea una nueva API key para uso médico

### Opción 3: Si usas APIMATIC como Proxy

Si APIMATIC actúa como intermediario para Copilot:

1. En APIMATIC, ve a tu API configurada
2. Busca la sección de "API Endpoints" o "External APIs"
3. Configura la integración con Copilot Medical
4. Usa la API key de APIMATIC pero configura el endpoint correcto

## 🔧 Configuración en el Backend

### 1. Agregar al archivo `.env`:

```env
# API Key de Copilot Medical (NO la de APIMATIC)
COPILOT_API_KEY=tu_api_key_real_de_copilot_aqui

# URL base de Copilot Medical API
COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com/v1

# O si usas Azure OpenAI:
# COPILOT_API_BASE_URL=https://tu-recurso.openai.azure.com/openai/deployments/gpt-4
```

### 2. Verificar el Endpoint

Edita `src/modules/ai-evaluations/services/copilot.service.ts` y ajusta el endpoint según la documentación real:

```typescript
// Línea ~91: Cambia '/analyze' por el endpoint real
const response = await this.httpClient.post('/analyze', {
  // ... datos
});
```

**Endpoints comunes:**
- Azure OpenAI: `/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`
- Copilot Medical: `/analyze` o `/chat/completions`
- APIMATIC Proxy: `/v1/copilot/analyze`

### 3. Formato de Autenticación

Ajusta según la API que uses:

**Azure OpenAI:**
```typescript
config.headers['api-key'] = this.apiKey; // No Bearer
```

**Copilot Medical:**
```typescript
config.headers['Authorization'] = `Bearer ${this.apiKey}`;
```

**APIMATIC:**
```typescript
config.headers['X-API-Key'] = this.apiKey;
```

## 🧪 Prueba de Configuración

### 1. Verificar que la API Key esté configurada:

Revisa los logs del backend al iniciar:
```
[CopilotService] CopilotService configurado correctamente
```

Si ves:
```
[CopilotService] COPILOT_API_KEY no configurada. La integración con Copilot usará modo simulado.
```

Significa que no está configurada correctamente.

### 2. Probar el endpoint:

```bash
curl -X POST http://localhost:3030/ai-evaluations/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "appointmentId": 1,
    "aiToolId": 2,
    "findings": "Hipertonía marcada",
    "masScale": "Grado 3"
  }'
```

### 3. Revisar logs del backend:

Si hay errores, verás en los logs:
```
[CopilotService] Error en petición a Copilot API: { status: 401, message: 'Unauthorized' }
```

## 🔍 Debugging

### Problema: "Usando resultado simulado"

**Causa:** No hay API key configurada o está vacía.

**Solución:**
1. Verifica que `.env` tenga `COPILOT_API_KEY=...`
2. Reinicia el backend
3. Verifica que no haya espacios en la key

### Problema: Error 401 (Unauthorized)

**Causa:** API key incorrecta o formato de autenticación incorrecto.

**Solución:**
1. Verifica que la key sea correcta
2. Ajusta el formato de autenticación en `copilot.service.ts`
3. Verifica que la key no haya expirado

### Problema: Error 404 (Not Found)

**Causa:** Endpoint incorrecto.

**Solución:**
1. Verifica la URL base en `.env`
2. Ajusta el endpoint en `copilot.service.ts` línea ~91
3. Consulta la documentación de la API

### Problema: Error de timeout

**Causa:** La API tarda mucho en responder.

**Solución:**
1. Aumenta el timeout en `copilot.service.ts` línea ~25
2. Verifica tu conexión a internet
3. Verifica que la API esté disponible

## 📝 Notas Importantes

1. **La API key de APIMATIC NO es la de Copilot Medical**
2. Necesitas una API key específica de Microsoft Copilot Medical o Azure OpenAI
3. El servicio tiene fallback automático: si falla, usa resultados simulados
4. Revisa siempre los logs del backend para ver qué está pasando

## 🚀 Próximos Pasos

1. ✅ Obtén la API key real de Copilot Medical (NO la de APIMATIC)
2. ✅ Configúrala en `.env`
3. ✅ Ajusta el endpoint según la documentación
4. ✅ Ajusta el formato de autenticación
5. ✅ Prueba el endpoint
6. ✅ Revisa los logs para verificar que funciona

