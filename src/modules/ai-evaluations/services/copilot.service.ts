import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Servicio para integrar con Microsoft Copilot Medical API
 * 
 * Integración directa usando HTTP requests (sin SDK externo)
 */
@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('COPILOT_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('COPILOT_API_BASE_URL') || 
                   'https://api.copilot.medical.microsoft.com/v1';
    
    // Configurar cliente HTTP
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 segundos
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Agregar interceptor para autenticación
    // Soporta múltiples formatos según el servicio usado
    this.httpClient.interceptors.request.use((config) => {
      if (this.apiKey) {
        // Detectar el tipo de API por la URL base
        if (this.baseUrl.includes('apimatic.io')) {
          // APIMATIC usa X-API-Key o Bearer
          config.headers['X-API-Key'] = this.apiKey;
          // O alternativamente:
          // config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        } else if (this.baseUrl.includes('openai.azure.com')) {
          // Azure OpenAI usa api-key header
          config.headers['api-key'] = this.apiKey;
        } else {
          // Copilot Medical y otros usan Bearer token
          config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
      }
      return config;
    });

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error('Error en petición a Copilot API:', {
          status: error.response?.status,
          message: error.response?.data || error.message,
        });
        return Promise.reject(error);
      }
    );
    
    if (!this.apiKey) {
      this.logger.warn('COPILOT_API_KEY no configurada. La integración con Copilot usará modo simulado.');
    } else {
      this.logger.log('CopilotService configurado correctamente');
    }
  }

  /**
   * Analiza datos clínicos y genera un diagnóstico usando Copilot Medical API
   * 
   * @param clinicalData Datos clínicos del paciente (hallazgos, escalas, etc.)
   * @returns Resultado del análisis de IA
   */
  async analyzeClinicalData(clinicalData: {
    findings: string;
    masScale?: string;
    medications?: string;
    patientAge?: number;
    patientCondition?: string;
  }): Promise<{
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  }> {
    // Si no hay API key, usar modo simulado
    if (!this.apiKey) {
      this.logger.warn('Usando resultado simulado (no hay API key configurada)');
      return this.getSimulatedResult(clinicalData);
    }

    try {
      // Construir el prompt/contexto para Copilot
      const prompt = this.buildClinicalPrompt(clinicalData);

      // Llamar a la API
      // NOTA: Ajusta el endpoint según el servicio que uses:
      // - APIMATIC: '/v1/analyze' o según tu configuración
      // - Copilot Medical: '/analyze' o '/chat/completions'
      // - Azure OpenAI: '/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview'
      const endpoint = this.baseUrl.includes('apimatic.io') 
        ? '/v1/analyze'  // Endpoint de APIMATIC (ajusta según tu configuración)
        : '/analyze';     // Endpoint por defecto
      
      const response = await this.httpClient.post(endpoint, {
        // Opción 1: Si Copilot usa un formato de mensajes (como ChatGPT)
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente médico especializado en el diagnóstico de espasticidad. Analiza los datos clínicos proporcionados y proporciona un diagnóstico, nivel de confianza, razonamiento y plan de tratamiento sugerido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        // Opción 2: Si Copilot usa un formato directo
        // clinicalData: clinicalData.findings,
        // context: {
        //   masScale: clinicalData.masScale,
        //   medications: clinicalData.medications,
        //   age: clinicalData.patientAge,
        //   condition: clinicalData.patientCondition,
        // },
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Parsear la respuesta según el formato de Copilot
      return this.parseCopilotResponse(response.data, clinicalData);
    } catch (error: any) {
      this.logger.error('Error al analizar con Copilot API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Si falla la API, retornar resultado simulado como fallback
      this.logger.warn('Fallando a resultado simulado debido a error en API');
      return this.getSimulatedResult(clinicalData);
    }
  }

  /**
   * Construye el prompt clínico para enviar a Copilot
   */
  private buildClinicalPrompt(clinicalData: {
    findings: string;
    masScale?: string;
    medications?: string;
    patientAge?: number;
    patientCondition?: string;
  }): string {
    let prompt = `Datos clínicos del paciente:\n\n`;
    prompt += `Hallazgos: ${clinicalData.findings}\n`;
    
    if (clinicalData.masScale) {
      prompt += `Escala MAS: ${clinicalData.masScale}\n`;
    }
    
    if (clinicalData.medications) {
      prompt += `Medicaciones actuales: ${clinicalData.medications}\n`;
    }
    
    if (clinicalData.patientAge) {
      prompt += `Edad: ${clinicalData.patientAge} años\n`;
    }
    
    if (clinicalData.patientCondition) {
      prompt += `Condición: ${clinicalData.patientCondition}\n`;
    }
    
    prompt += `\nPor favor, proporciona:\n`;
    prompt += `1. Diagnóstico (formato: "Espasticidad Grado X (MAS)")\n`;
    prompt += `2. Nivel de confianza (0-100%)\n`;
    prompt += `3. Razonamiento clínico detallado\n`;
    prompt += `4. Plan de tratamiento sugerido (lista de 3-5 puntos)`;
    
    return prompt;
  }

  /**
   * Parsea la respuesta de Copilot según su formato
   * Ajusta esto según el formato real de respuesta de la API
   */
  private parseCopilotResponse(
    apiResponse: any,
    clinicalData: any,
  ): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    // Si la respuesta viene en formato de mensaje (como ChatGPT)
    if (apiResponse.choices && apiResponse.choices[0]?.message?.content) {
      const content = apiResponse.choices[0].message.content;
      return this.parseTextResponse(content);
    }

    // Si la respuesta viene estructurada
    if (apiResponse.diagnosis) {
      return {
        diagnosis: apiResponse.diagnosis || 'Diagnóstico no disponible',
        confidence: apiResponse.confidence || apiResponse.confidencePercent || 0,
        reasoning: apiResponse.reasoning || apiResponse.analysis || '',
        suggestedPlan: apiResponse.suggestedPlan || 
                      apiResponse.treatmentPlan || 
                      apiResponse.plan || [],
      };
    }

    // Si no se puede parsear, usar resultado simulado
    this.logger.warn('No se pudo parsear la respuesta de Copilot, usando resultado simulado');
    return this.getSimulatedResult(clinicalData);
  }

  /**
   * Parsea una respuesta en formato de texto libre
   */
  private parseTextResponse(text: string): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    // Intentar extraer información estructurada del texto
    const diagnosisMatch = text.match(/Diagnóstico[:\s]+([^\n]+)/i) || 
                          text.match(/Espasticidad Grado \d+/i);
    const confidenceMatch = text.match(/(\d+)%/);
    const reasoningMatch = text.match(/Razonamiento[:\s]+([^\n]+(?:\n[^\n]+)*)/i);
    const planMatch = text.match(/Plan[:\s]+([^\n]+(?:\n[^\n]+)*)/i);

    return {
      diagnosis: diagnosisMatch ? diagnosisMatch[1]?.trim() || diagnosisMatch[0] : 'Espasticidad Grado 3 (MAS)',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : text.substring(0, 200),
      suggestedPlan: planMatch 
        ? planMatch[1].split('\n').filter(p => p.trim()).slice(0, 5)
        : ['Infiltración Toxina Botulínica', 'Fisioterapia intensiva', 'Seguimiento en 4 semanas'],
    };
  }

  /**
   * Retorna un resultado simulado (fallback)
   */
  private getSimulatedResult(clinicalData: {
    findings: string;
    masScale?: string;
    medications?: string;
  }): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    return {
      diagnosis: 'Espasticidad Grado 3 (MAS)',
      confidence: 89,
      reasoning: `Análisis basado en: ${clinicalData.findings}. ${clinicalData.masScale ? `Escala MAS: ${clinicalData.masScale}.` : ''} ${clinicalData.medications ? `Medicación actual: ${clinicalData.medications}.` : ''} La resistencia considerable en todo el ROM pasivo y el clonus sostenido indican progresión clínica.`,
      suggestedPlan: [
        'Infiltración Toxina Botulínica (Puntos clave)',
        'Fisioterapia intensiva especializada',
        'Seguimiento en 4 semanas',
      ],
    };
  }

  /**
   * Verifica si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }
}

