# Integración con Microsoft Copilot Medical API

## 📋 Resumen

Este proyecto está preparado para integrar Microsoft Copilot Medical API usando APIMatic CLI para generar el SDK automáticamente.

## 🚀 Pasos de Instalación

### Paso 1: Instalar APIMatic CLI

```bash
npm i -g @apimatic/cli
```

### Paso 2: Generar SDK

```bash
apimatic quickstart
```

Sigue las instrucciones interactivas para:
1. Conectar con la API de Copilot Medical
2. Seleccionar **TypeScript** como lenguaje
3. Guardar el SDK en: `src/integrations/copilot-sdk`

### Paso 3: Instalar Dependencias del SDK

Una vez generado el SDK, instalar sus dependencias:

```bash
cd src/integrations/copilot-sdk
npm install
cd ../../..
```

### Paso 4: Configurar Variables de Entorno

Agregar al archivo `.env` del backend:

```env
COPILOT_API_KEY=tu_api_key_aqui
COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com
```

### Paso 5: Actualizar CopilotService

Una vez generado el SDK, actualiza el archivo:
`src/modules/ai-evaluations/services/copilot.service.ts`

**Ejemplo de cómo importar y usar el SDK:**

```typescript
// Al inicio del archivo, importa el SDK generado
import { CopilotClient } from '../../../integrations/copilot-sdk';

// En el constructor, inicializa el cliente
constructor(private configService: ConfigService) {
  this.apiKey = this.configService.get<string>('COPILOT_API_KEY') || '';
  this.baseUrl = this.configService.get<string>('COPILOT_API_BASE_URL') || '';
  
  // Inicializar el cliente de Copilot
  this.copilotClient = new CopilotClient({
    apiKey: this.apiKey,
    baseUrl: this.baseUrl
  });
}

// En analyzeClinicalData, usa el cliente real
async analyzeClinicalData(clinicalData: {...}): Promise<{...}> {
  const response = await this.copilotClient.analyze({
    clinicalData: clinicalData.findings,
    context: {
      masScale: clinicalData.masScale,
      medications: clinicalData.medications,
      age: clinicalData.patientAge,
      condition: clinicalData.patientCondition
    }
  });
  
  return {
    diagnosis: response.diagnosis,
    confidence: response.confidence,
    reasoning: response.reasoning,
    suggestedPlan: response.treatmentPlan
  };
}
```

## 📡 Endpoints Disponibles

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

**Respuesta:**
```json
{
  "evaluationId": 1,
  "appointmentId": 1,
  "aiToolId": 2,
  "aiResult": "{\"diagnosis\":\"...\",\"confidence\":89,\"reasoning\":\"...\",\"suggestedPlan\":[...]}",
  "isSelected": false,
  "evaluationDate": "2025-12-15T10:30:00Z"
}
```

## 🔧 Estructura Creada

- ✅ `src/modules/ai-evaluations/services/copilot.service.ts` - Servicio base para Copilot
- ✅ `src/modules/ai-evaluations/dto/generate-ai-evaluation.dto.ts` - DTO para generar evaluaciones
- ✅ Endpoint `/ai-evaluations/generate` - Para generar evaluaciones con IA real
- ✅ Integración en `AiEvaluationsService` - Método `generateWithCopilot()`

## ⚠️ Notas Importantes

1. **SDK Requerido**: El servicio actualmente usa resultados simulados. Debes generar el SDK con APIMatic para usar la API real.

2. **API Key**: Necesitas obtener una API key de Microsoft Copilot Medical. Contacta con Microsoft para obtener acceso.

3. **Testing**: Puedes probar el endpoint con datos simulados antes de integrar el SDK real.

## 🧪 Pruebas

Una vez configurado, puedes probar el endpoint:

```bash
curl -X POST http://localhost:3030/ai-evaluations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": 1,
    "aiToolId": 2,
    "findings": "Hipertonía marcada",
    "masScale": "Grado 3",
    "medications": "Baclofeno 10mg"
  }'
```

