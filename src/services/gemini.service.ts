
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // API KEY obtenida del entorno.
    // Esta funcionalidad es REAL y requiere una API KEY válida configurada en el entorno de ejecución.
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  /**
   * Analiza una imagen de documento (Visión)
   */
  async analyzeDocument(base64Image: string, prompt: string): Promise<string> {
    try {
      // Limpiar cabecera base64 si existe
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { 
                inlineData: { 
                    mimeType: 'image/jpeg', 
                    data: cleanBase64 
                } 
            },
            { text: prompt }
          ]
        }
      });
      return response.text || 'No se pudo analizar el documento.';
    } catch (error) {
      console.error('Gemini Vision Error:', error);
      return 'Error al conectar con Gemini Vision. Verifique su conexión o API Key.';
    }
  }

  /**
   * Compara dos imágenes (Referencia vs Vivo) para verificar identidad.
   * Retorna true si Gemini cree que son la misma persona.
   */
  async verifyBiometricMatch(referenceBase64: string, liveBase64: string): Promise<{ match: boolean, confidence: string }> {
      try {
          const cleanRef = referenceBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
          const cleanLive = liveBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      { inlineData: { mimeType: 'image/jpeg', data: cleanRef } },
                      { inlineData: { mimeType: 'image/jpeg', data: cleanLive } },
                      { text: "Actúa como un sistema de seguridad biométrico. Compara estrictamente estas dos imágenes de rostros. ¿Representan a la misma persona? Ignora diferencias de iluminación o accesorios como gafas. Responde SOLAMENTE con un JSON válido en este formato: { \"match\": boolean, \"reason\": \"string\" }." }
                  ]
              },
              config: {
                  responseMimeType: 'application/json'
              }
          });
          
          const jsonText = response.text || '{}';
          const result = JSON.parse(jsonText);
          return { match: result.match === true, confidence: result.reason || 'Análisis completado' };

      } catch (e) {
          console.error("Gemini Biometric Error", e);
          return { match: false, confidence: 'Error de conexión IA' };
      }
  }

  /**
   * Chat con Grounding (Google Search / Maps Data)
   */
  async chatWithHR(message: string): Promise<{ text: string, sources?: any[] }> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          // Activamos Google Search para obtener datos reales de mapas, leyes actualizadas, etc.
          tools: [{ googleSearch: {} }],
          systemInstruction: 'Eres un experto asistente de Recursos Humanos y Jefe de Obra para una empresa constructora argentina. ' +
                             'Responde consultas sobre leyes laborales (LCT), UOCRA, materiales y ubicaciones geográficas. ' +
                             'Usa Google Search para buscar direcciones, corralones cercanos o normativas vigentes si es necesario.'
        }
      });

      // Extraer fuentes de grounding (URLs de Google Search/Maps)
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          title: chunk.web?.title || 'Fuente Web',
          uri: chunk.web?.uri
      })).filter((s: any) => s.uri);

      return { 
          text: response.text || 'No tengo respuesta para eso.',
          sources: sources
      };

    } catch (error) {
      console.error('Gemini Chat Error:', error);
      return { text: 'Lo siento, el servicio de IA no está disponible en este momento.' };
    }
  }
  
  /**
   * Generación de Texto / SQL
   */
  async generateSqlSchema(): Promise<string> {
      try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Genera el código SQL (PostgreSQL) robusto para las siguientes entidades: Empleados, Obras, CertificadosMedicos, FormulariosART, Fichadas, RecibosSueldo. Incluye relaciones, claves foráneas y constraints.'
        });
        return response.text || 'Error generando respuesta.';
      } catch (e) {
          return "Error generando SQL.";
      }
  }

  /**
   * Análisis de Contexto Geográfico para Obras
   */
  async analyzeLocationContext(address: string, city: string): Promise<string> {
      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: `Analiza la ubicación: ${address}, ${city}, Argentina. ` +
                        `Dame un breve reporte útil para una constructora: accesibilidad para camiones, tipo de zona (residencial/industrial), y si hay corralones o ferreterías industriales importantes cerca. Usa Google Search.`,
              config: {
                  tools: [{ googleSearch: {} }]
              }
          });
          return response.text || 'No se pudo analizar la zona.';
      } catch (e) {
          return "Error analizando la ubicación.";
      }
  }
}
