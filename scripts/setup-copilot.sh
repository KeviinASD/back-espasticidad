#!/bin/bash

# Script para configurar la integración con Copilot Medical API

echo "🚀 Configurando integración con Copilot Medical API..."

# Paso 1: Instalar APIMatic CLI
echo "📦 Instalando APIMatic CLI..."
npm i -g @apimatic/cli

# Paso 2: Generar SDK
echo "🔧 Generando SDK con APIMatic..."
echo "Sigue las instrucciones interactivas para:"
echo "  1. Conectar con la API de Copilot Medical"
echo "  2. Seleccionar TypeScript como lenguaje"
echo "  3. Guardar en: src/integrations/copilot-sdk"
apimatic quickstart

# Paso 3: Instalar dependencias del SDK generado
if [ -d "src/integrations/copilot-sdk" ]; then
  echo "📦 Instalando dependencias del SDK..."
  cd src/integrations/copilot-sdk
  npm install
  cd ../../..
fi

# Paso 4: Recordatorio de variables de entorno
echo ""
echo "✅ Configuración completada!"
echo ""
echo "⚠️  IMPORTANTE: Agrega estas variables a tu archivo .env:"
echo "   COPILOT_API_KEY=tu_api_key_aqui"
echo "   COPILOT_API_BASE_URL=https://api.copilot.medical.microsoft.com"
echo ""
echo "Luego actualiza el archivo:"
echo "   src/modules/ai-evaluations/services/copilot.service.ts"
echo "   para importar y usar el SDK generado."

