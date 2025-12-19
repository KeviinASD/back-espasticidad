# 🔧 Configuración con APIMATIC

## ✅ SÍ, puedes usar APIMATIC, pero necesitas configurarlo

APIMATIC puede actuar como intermediario para acceder a servicios de IA, pero necesitas configurarlo primero.

## 📋 Pasos para Configurar

### Paso 1: Verificar en APIMATIC

1. Ve a tu cuenta de APIMATIC: https://app.apimatic.io
2. Verifica si tienes alguna API configurada que acceda a servicios de IA médica
3. Si no, necesitas:
   - Configurar una nueva API en APIMATIC
   - Conectar APIMATIC con Copilot Medical o Azure OpenAI
   - Obtener el endpoint específico

### Paso 2: Configurar Variables de Entorno

En el archivo `.env` del backend:

```env
# Usa la API key de APIMATIC que tienes
COPILOT_API_KEY=PnkAFwzbk6A_hfXBE1GxCKGI-JDIpLSCCL0QkyE_QVaVqdBhuoXSBOOFV2HbO8au

# URL de APIMATIC (ajusta según tu configuración)
# Opción 1: Si APIMATIC tiene un endpoint específico para análisis médico
COPILOT_API_BASE_URL=https://api.apimatic.io/v1

# Opción 2: Si tienes una API personalizada en APIMATIC
# COPILOT_API_BASE_URL=https://tu-api.apimatic.io/v1
```

### Paso 3: Ajustar el Endpoint

Edita `src/modules/ai-evaluations/services/copilot.service.ts` alrededor de la línea 101:

```typescript
// Si usas APIMATIC, el endpoint puede ser diferente
const endpoint = this.baseUrl.includes('apimatic.io') 
  ? '/v1/medical/analyze'  // Ajusta según tu configuración en APIMATIC
  : '/analyze';
```

### Paso 4: Verificar Formato de Request

APIMATIC puede requerir un formato específico. Ajusta el request según la documentación de tu API en APIMATIC:

```typescript
// Formato para APIMATIC (ejemplo)
const response = await this.httpClient.post(endpoint, {
  data: {
    findings: clinicalData.findings,
    masScale: clinicalData.masScale,
    medications: clinicalData.medications,
    // ... otros campos
  }
});
```

## 🧪 Prueba de Configuración

### 1. Verificar Logs

Al iniciar el backend, deberías ver:
```
[CopilotService] CopilotService configurado correctamente
```

### 2. Probar el Endpoint

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

### 3. Revisar Errores

Si hay errores, revisa los logs del backend:
- **401 Unauthorized**: API key incorrecta o formato de autenticación incorrecto
- **404 Not Found**: Endpoint incorrecto
- **400 Bad Request**: Formato de datos incorrecto

## ⚠️ Limitaciones de APIMATIC

1. **APIMATIC NO es un servicio de IA médica**
   - Es una plataforma para gestionar APIs
   - Necesita estar configurado para acceder a un servicio de IA real

2. **Necesitas configurar la integración**
   - APIMATIC debe estar conectado a Copilot Medical o Azure OpenAI
   - O debes tener una API personalizada en APIMATIC que use IA

3. **La API key de APIMATIC sola no es suficiente**
   - Necesitas que APIMATIC tenga acceso a un servicio de IA
   - O configurar APIMATIC para que actúe como proxy

## 🎯 Recomendación

**Para análisis médico real, es mejor:**

1. **Usar Azure OpenAI directamente** (más confiable)
   - Obtén API key de Azure Portal
   - Configura directamente en tu backend
   - Mejor rendimiento y control

2. **O usar Copilot Medical directamente** (si está disponible)
   - API key directa de Microsoft
   - Sin intermediarios

**APIMATIC es útil si:**
- Ya tienes una integración configurada
- Quieres gestionar múltiples APIs desde un solo lugar
- Necesitas generar SDKs automáticamente

## 📝 Checklist

- [ ] Verificar que APIMATIC tenga acceso a un servicio de IA médica
- [ ] Obtener el endpoint correcto de APIMATIC
- [ ] Configurar API key en `.env`
- [ ] Ajustar endpoint en `copilot.service.ts`
- [ ] Ajustar formato de request según documentación de APIMATIC
- [ ] Probar el endpoint
- [ ] Revisar logs para verificar que funciona

## 🔍 Si APIMATIC no tiene acceso a IA médica

Si APIMATIC no está configurado para acceder a servicios de IA médica, necesitas:

1. **Configurar una nueva API en APIMATIC** que use:
   - Azure OpenAI
   - O Copilot Medical
   - O cualquier otro servicio de IA médica

2. **O usar directamente** Azure OpenAI o Copilot Medical sin APIMATIC

