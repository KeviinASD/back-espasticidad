# Integración Directa con Microsoft Copilot Medical API

## ✅ Solución Implementada

Se ha creado una integración **directa** usando HTTP requests con `axios`, sin necesidad de SDKs externos o APIMatic CLI.

## 📦 Instalación

```bash
npm install axios
```

## 🔧 Configuración

### 1. Variables de Entorno

Agrega al archivo `.env`:

```env
COPILOT_API_KEY=tu_api_key_de_copilot
COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com/v1
```

### 2. Formato de Autenticación

El servicio soporta múltiples formatos de autenticación. Ajusta según la documentación de Copilot:

- **Bearer Token**: `Authorization: Bearer ${apiKey}`
- **API Key Header**: `X-API-Key: ${apiKey}`
- **Subscription Key**: `Ocp-Apim-Subscription-Key: ${apiKey}`

Para cambiar el formato, edita `copilot.service.ts` en el interceptor de requests.

## 📡 Uso del Endpoint

### Generar Evaluación con Copilot

**POST** `/ai-evaluations/generate`

```json
{
  "appointmentId": 1,
  "aiToolId": 2,
  "findings": "Hipertonía marcada en flexores codo der.",
  "masScale": "Previa 2, reporte de empeoramiento.",
  "medications": "Baclofeno 10mg c/8h (respuesta subóptima).",
  "patientAge": 45,
  "patientCondition": "Espasticidad post-ictus"
}
```

## 🔄 Ajustes Necesarios

### 1. Endpoint de la API

Edita `src/modules/ai-evaluations/services/copilot.service.ts` y ajusta:

```typescript
// Línea ~80: Cambia el endpoint según la documentación real
const response = await this.httpClient.post('/analyze', {
  // ... datos
});
```

**Endpoints comunes:**
- `/analyze`
- `/chat/completions`
- `/v1/analyze`
- `/medical/analyze`

### 2. Formato de Request

Ajusta el formato del request según la API de Copilot:

**Opción A: Formato de mensajes (tipo ChatGPT)**
```typescript
{
  messages: [
    { role: 'system', content: '...' },
    { role: 'user', content: '...' }
  ],
  temperature: 0.7,
  max_tokens: 1000
}
```

**Opción B: Formato directo**
```typescript
{
  clinicalData: clinicalData.findings,
  context: {
    masScale: clinicalData.masScale,
    medications: clinicalData.medications,
    age: clinicalData.patientAge,
    condition: clinicalData.patientCondition
  }
}
```

### 3. Formato de Response

Ajusta el método `parseCopilotResponse()` según el formato real:

**Si la respuesta es:**
```json
{
  "choices": [{
    "message": {
      "content": "texto del análisis..."
    }
  }]
}
```

**O si es:**
```json
{
  "diagnosis": "...",
  "confidence": 89,
  "reasoning": "...",
  "treatmentPlan": [...]
}
```

## 🧪 Pruebas

### 1. Sin API Key (Modo Simulado)

Si no configuras `COPILOT_API_KEY`, el servicio usará resultados simulados automáticamente.

### 2. Con API Key (Modo Real)

```bash
# Probar el endpoint
curl -X POST http://localhost:3030/ai-evaluations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": 1,
    "aiToolId": 2,
    "findings": "Hipertonía marcada",
    "masScale": "Grado 3"
  }'
```

## 🔍 Debugging

El servicio incluye logging detallado:

- ✅ Logs de configuración al iniciar
- ✅ Logs de errores de API
- ✅ Fallback automático a modo simulado si falla

Revisa los logs del backend para ver:
- Si la API key está configurada
- Errores de conexión
- Respuestas de la API

## 📝 Notas

1. **Fallback Automático**: Si la API falla, automáticamente usa resultados simulados
2. **Timeout**: 30 segundos por defecto
3. **Retry Logic**: Puedes agregar lógica de reintentos si es necesario
4. **Caching**: Considera agregar caché para evitar llamadas repetidas

## 🚀 Próximos Pasos

1. Obtén tu API key de Microsoft Copilot Medical
2. Configura las variables de entorno
3. Ajusta el endpoint y formato según la documentación real
4. Prueba el endpoint
5. Ajusta el parsing de respuesta según el formato real

