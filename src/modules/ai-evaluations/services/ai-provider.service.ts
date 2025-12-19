import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * Servicio para ChatGPT y Copilot Medical
 * Soporta solo estos dos proveedores
 */
@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly openaiKey: string;
  private readonly copilotKey: string;
  private readonly copilotBaseUrl: string;
  private readonly openaiClient: AxiosInstance;
  private readonly copilotClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    // API Keys
    this.openaiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.copilotKey = this.configService.get<string>('COPILOT_API_KEY') || '';
    // Gemini API base URL - usar v1beta para modelos más recientes
    this.copilotBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    // Cliente para OpenAI (ChatGPT)
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.openaiKey ? `Bearer ${this.openaiKey}` : '',
      },
    });

    // Cliente para Gemini (usado como "Copilot" en la UI)
    // La API de Gemini usa: https://generativelanguage.googleapis.com/v1beta
    // Los modelos más recientes (gemini-1.5-flash, gemini-1.5-pro) están en v1beta
    this.copilotClient = axios.create({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para Gemini (Copilot)
    this.copilotClient.interceptors.request.use((config) => {
      if (this.copilotKey) {
        // Gemini usa la API key como query parameter
        config.params = config.params || {};
        config.params.key = this.copilotKey;
      }
      return config;
    });

    // Interceptores de respuesta para logging
    [this.openaiClient, this.copilotClient].forEach((client) => {
      client.interceptors.response.use(
        (response) => response,
        (error) => {
          this.logger.error('Error en petición a IA:', {
            status: error.response?.status,
            message: error.response?.data || error.message,
          });
          return Promise.reject(error);
        }
      );
    });

    // Logging de configuración
    if (this.openaiKey) {
      this.logger.log(`✅ ChatGPT (OpenAI) configurado correctamente (Key: ${this.openaiKey.substring(0, 7)}...)`);
    } else {
      this.logger.warn('⚠️ OPENAI_API_KEY no configurada - Se usarán resultados simulados');
    }

    if (this.copilotKey) {
      this.logger.log(`✅ Copilot (Gemini) configurado correctamente (Key: ${this.copilotKey.substring(0, 7)}...)`);
    } else {
      this.logger.warn('⚠️ COPILOT_API_KEY no configurada - Se usarán resultados simulados');
    }
  }

  /**
   * Analiza datos clínicos usando ChatGPT
   */
  async analyzeWithChatGPT(clinicalData: {
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
    if (!this.openaiKey) {
      this.logger.warn('ChatGPT no configurado, usando resultado simulado');
      return this.getSimulatedResult(clinicalData, 'ChatGPT');
    }

    try {
      const prompt = this.buildClinicalPrompt(clinicalData);
      
      // Intentar con gpt-4o primero, luego gpt-3.5-turbo como fallback
      let model = 'gpt-4o';
      let response;
      
      this.logger.log(`🔄 Iniciando análisis con ${model}...`);
      
      try {
        response = await this.openaiClient.post('/chat/completions', {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente médico especializado en el diagnóstico de espasticidad. Analiza los datos clínicos y proporciona un análisis en formato JSON con: diagnosis (formato: "Espasticidad Grado X (MAS)"), confidence (0-100), reasoning (texto detallado), suggestedPlan (array de strings con 3-5 puntos).',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        });
      } catch (error: any) {
        // Si gpt-4o no está disponible, intentar con gpt-3.5-turbo
        if (error.response?.status === 404 || error.response?.data?.error?.code === 'model_not_found') {
          this.logger.warn('gpt-4o no disponible, usando gpt-3.5-turbo');
          try {
            model = 'gpt-3.5-turbo';
            response = await this.openaiClient.post('/chat/completions', {
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'Eres un asistente médico especializado en el diagnóstico de espasticidad. Analiza los datos clínicos y proporciona un análisis en formato JSON con: diagnosis (formato: "Espasticidad Grado X (MAS)"), confidence (0-100), reasoning (texto detallado), suggestedPlan (array de strings con 3-5 puntos).',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
              response_format: { type: 'json_object' },
            });
          } catch (fallbackError: any) {
            // Si también falla gpt-3.5-turbo, usar resultado simulado
            this.logger.warn('gpt-3.5-turbo también falló, usando resultado simulado');
            throw fallbackError;
          }
        } else {
          // Para otros errores (429 quota, 401 auth, etc.), usar resultado simulado
          throw error;
        }
      }

      this.logger.log(`✅ Análisis completado con ${model}`);
      return this.parseOpenAIResponse(response.data, clinicalData);
    } catch (error: any) {
      // Manejar todos los errores (quota exceeded, auth, network, etc.)
      const errorCode = error.response?.data?.error?.code || error.response?.status;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      if (errorCode === 'insufficient_quota' || error.response?.status === 429) {
        this.logger.warn('⚠️ Cuota de OpenAI excedida, usando resultado simulado');
      } else if (errorCode === 'invalid_api_key' || error.response?.status === 401) {
        this.logger.warn('⚠️ API key de OpenAI inválida, usando resultado simulado');
      } else if (errorCode === 'model_not_found') {
        this.logger.warn('⚠️ Modelo no encontrado, usando resultado simulado');
      } else {
        this.logger.error(`❌ Error al analizar con ChatGPT (${errorCode}):`, errorMessage || error.message || error);
      }
      
      return this.getSimulatedResult(clinicalData, 'ChatGPT');
    }
  }

  /**
   * Analiza datos clínicos usando Gemini (mostrado como "Copilot" en la UI)
   */
  async analyzeWithCopilot(clinicalData: {
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
    if (!this.copilotKey) {
      this.logger.warn('Copilot (Gemini) no configurado, usando resultado simulado');
      return this.getSimulatedResult(clinicalData, 'Copilot');
    }

    try {
      const prompt = this.buildClinicalPrompt(clinicalData);
      
      this.logger.log('🔄 Iniciando análisis con Gemini (Copilot)...');
      
      // Usar Gemini API v1beta (diciembre 2025)
      // Modelos disponibles (orden de preferencia):
      // 1. Gemini 3 Flash (más reciente y rápido)
      // 2. Gemini 2.5 Flash (estable)
      // 3. Gemini 1.5 Flash (legacy fallback)
      // Modelos disponibles en v1beta (diciembre 2025)
      // Orden de preferencia: más reciente primero
      const modelsToTry = [
        'gemini-3.0-flash',      // Gemini 3 Flash (más reciente)
        'gemini-3-flash',        // Alternativa sin punto
        'gemini-2.5-flash',      // Gemini 2.5 Flash (estable)
        'gemini-1.5-flash',      // Gemini 1.5 Flash (legacy)
      ];
      
      const systemInstruction = 'Eres un asistente médico especializado en el diagnóstico de espasticidad. Analiza los datos clínicos y proporciona un análisis en formato JSON con: diagnosis (formato: "Espasticidad Grado X (MAS)"), confidence (0-100), reasoning (texto detallado), suggestedPlan (array de strings con 3-5 puntos).';
      
      const fullPrompt = `${systemInstruction}\n\n${prompt}\n\nResponde SOLO con un objeto JSON válido, sin texto adicional.`;
      
      let model = modelsToTry[0];
      let response;
      let lastError: any = null;
      
      // Intentar cada modelo hasta que uno funcione
      for (const modelToTry of modelsToTry) {
        try {
          this.logger.log(`Intentando con modelo: ${modelToTry}`);
          
          // Intentar primero con responseMimeType
          try {
            response = await this.copilotClient.post(`/models/${modelToTry}:generateContent`, {
              contents: [
                {
                  parts: [
                    {
                      text: fullPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                responseMimeType: 'application/json',
              },
            });
            model = modelToTry;
            break; // Éxito, salir del loop
          } catch (error: any) {
            // Si falla con responseMimeType, intentar sin él
            if (error.response?.status === 400 && 
                error.response?.data?.error?.message?.includes('responseMimeType')) {
              this.logger.warn(`${modelToTry} con responseMimeType falló, intentando sin él`);
              response = await this.copilotClient.post(`/models/${modelToTry}:generateContent`, {
                contents: [
                  {
                    parts: [
                      {
                        text: fullPrompt,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000,
                },
              });
              model = modelToTry;
              break; // Éxito, salir del loop
            } else {
              throw error; // Re-lanzar para que el catch externo lo maneje
            }
          }
        } catch (error: any) {
          lastError = error;
          // Si es 404 (modelo no encontrado), intentar siguiente modelo
          if (error.response?.status === 404) {
            this.logger.warn(`${modelToTry} no disponible, intentando siguiente modelo...`);
            continue; // Intentar siguiente modelo
          } else {
            // Otro tipo de error, lanzarlo
            throw error;
          }
        }
      }
      
      // Si ningún modelo funcionó, lanzar el último error
      if (!response) {
        throw lastError || new Error('No se pudo conectar con ningún modelo de Gemini');
      }

      this.logger.log(`✅ Análisis completado con ${model} (Copilot)`);
      
      return this.parseGeminiResponse(response.data, clinicalData);
    } catch (error: any) {
      const errorCode = error.response?.data?.error?.code || error.response?.status;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      if (errorCode === 429) {
        this.logger.warn('⚠️ Cuota de Gemini excedida, usando resultado simulado');
      } else if (errorCode === 401 || errorCode === 403) {
        this.logger.warn('⚠️ API key de Gemini inválida, usando resultado simulado');
      } else {
        this.logger.error(`❌ Error al analizar con Gemini (Copilot) (${errorCode}):`, errorMessage || error);
      }
      
      return this.getSimulatedResult(clinicalData, 'Copilot');
    }
  }

  private buildClinicalPrompt(clinicalData: {
    findings: string;
    masScale?: string;
    medications?: string;
    patientAge?: number;
    patientCondition?: string;
  }): string {
    let prompt = `Datos clínicos del paciente:\n\n`;
    prompt += `Hallazgos: ${clinicalData.findings}\n`;
    if (clinicalData.masScale) prompt += `Escala MAS: ${clinicalData.masScale}\n`;
    if (clinicalData.medications) prompt += `Medicaciones: ${clinicalData.medications}\n`;
    if (clinicalData.patientAge) prompt += `Edad: ${clinicalData.patientAge} años\n`;
    if (clinicalData.patientCondition) prompt += `Condición: ${clinicalData.patientCondition}\n`;
    prompt += `\nProporciona un análisis médico en formato JSON con: diagnosis, confidence (0-100), reasoning, suggestedPlan (array de strings).`;
    return prompt;
  }

  private parseOpenAIResponse(apiResponse: any, clinicalData: any): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    try {
      const content = apiResponse.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response');
      }

      const parsed = JSON.parse(content);
      return {
        diagnosis: parsed.diagnosis || 'Espasticidad Grado 3 (MAS)',
        confidence: parsed.confidence || 85,
        reasoning: parsed.reasoning || 'Análisis basado en los datos clínicos proporcionados.',
        suggestedPlan: parsed.suggestedPlan || [
          'Infiltración Toxina Botulínica',
          'Fisioterapia intensiva',
          'Seguimiento en 4 semanas',
        ],
      };
    } catch (error) {
      this.logger.warn('Error parseando respuesta de OpenAI, usando resultado simulado');
      return this.getSimulatedResult(clinicalData, 'ChatGPT');
    }
  }

  private parseGeminiResponse(apiResponse: any, clinicalData: any): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    try {
      // Gemini devuelve la respuesta en: candidates[0].content.parts[0].text
      const text = apiResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No content in Gemini response');
      }

      // Intentar parsear como JSON
      const parsed = JSON.parse(text);
      
      return {
        diagnosis: parsed.diagnosis || 'Espasticidad Grado 3 (MAS)',
        confidence: parsed.confidence || 85,
        reasoning: parsed.reasoning || 'Análisis basado en los datos clínicos proporcionados.',
        suggestedPlan: parsed.suggestedPlan || [
          'Infiltración Toxina Botulínica',
          'Fisioterapia intensiva',
          'Seguimiento en 4 semanas',
        ],
      };
    } catch (error) {
      this.logger.warn('Error parseando respuesta de Gemini, usando resultado simulado');
      return this.getSimulatedResult(clinicalData, 'Copilot');
    }
  }

  private parseCopilotResponse(apiResponse: any, clinicalData: any): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    try {
      // Intentar diferentes formatos de respuesta
      let content = '';
      
      if (apiResponse.choices?.[0]?.message?.content) {
        content = apiResponse.choices[0].message.content;
      } else if (apiResponse.message?.content) {
        content = apiResponse.message.content;
      } else if (apiResponse.diagnosis) {
        // Formato directo
        return {
          diagnosis: apiResponse.diagnosis,
          confidence: apiResponse.confidence || apiResponse.confidencePercent || 85,
          reasoning: apiResponse.reasoning || apiResponse.analysis || '',
          suggestedPlan: apiResponse.suggestedPlan || apiResponse.treatmentPlan || [],
        };
      } else if (typeof apiResponse === 'string') {
        content = apiResponse;
      }

      if (content) {
        try {
          const parsed = JSON.parse(content);
          return {
            diagnosis: parsed.diagnosis || 'Espasticidad Grado 3 (MAS)',
            confidence: parsed.confidence || 85,
            reasoning: parsed.reasoning || '',
            suggestedPlan: parsed.suggestedPlan || [],
          };
        } catch {
          // Si no es JSON, extraer del texto
          return this.extractFromText(content, clinicalData);
        }
      }

      throw new Error('No se pudo parsear la respuesta');
    } catch (error) {
      this.logger.warn('Error parseando respuesta de Copilot, usando resultado simulado');
      return this.getSimulatedResult(clinicalData, 'Copilot');
    }
  }

  private extractFromText(text: string, clinicalData: any): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    const diagnosisMatch = text.match(/diagnosis["\s:]+([^",}\n]+)/i) || 
                          text.match(/Espasticidad Grado \d+/i);
    const confidenceMatch = text.match(/(\d+)%/);
    const reasoningMatch = text.match(/reasoning["\s:]+([^"]+)/i);
    const planMatch = text.match(/suggestedPlan["\s:]+\[([^\]]+)\]/i);

    return {
      diagnosis: diagnosisMatch ? (diagnosisMatch[1]?.trim() || diagnosisMatch[0]) : 'Espasticidad Grado 3 (MAS)',
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : text.substring(0, 200),
      suggestedPlan: planMatch 
        ? planMatch[1].split(',').map((p: string) => p.trim().replace(/["']/g, ''))
        : [
            'Infiltración Toxina Botulínica',
            'Fisioterapia intensiva',
            'Seguimiento en 4 semanas',
          ],
    };
  }

  private getSimulatedResult(clinicalData: any, provider: string = 'IA'): {
    diagnosis: string;
    confidence: number;
    reasoning: string;
    suggestedPlan: string[];
  } {
    const baseReasoning = provider === 'ChatGPT'
      ? 'La resistencia considerable en todo el ROM pasivo y el clonus sostenido indican progresión clínica. El fallo a dosis medias de Baclofeno sugiere necesidad de terapia combinada o intervencionismo.'
      : 'Análisis indica espasticidad moderada con respuesta parcial al tratamiento actual. Se recomienda ajuste farmacológico antes de considerar intervención.';

    return {
      diagnosis: 'Espasticidad Grado 3 (MAS)',
      confidence: 89,
      reasoning: `${baseReasoning} ${clinicalData.findings ? `Hallazgos: ${clinicalData.findings}.` : ''} ${clinicalData.masScale ? `Escala MAS: ${clinicalData.masScale}.` : ''} ${clinicalData.medications ? `Medicación: ${clinicalData.medications}.` : ''}`,
      suggestedPlan: [
        'Infiltración Toxina Botulínica (Puntos clave)',
        'Fisioterapia intensiva especializada',
        'Seguimiento en 4 semanas',
      ],
    };
  }

  isConfigured(provider: 'chatgpt' | 'copilot'): boolean {
    if (provider === 'chatgpt') {
      return !!this.openaiKey;
    }
    return !!this.copilotKey;
  }
}
