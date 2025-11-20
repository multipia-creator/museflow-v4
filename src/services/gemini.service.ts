/**
 * Gemini AI Service
 * Integration with Google Gemini 3.0 API
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
  finishReason: string;
  safetyRatings?: any[];
}

export interface GeminiStreamChunk {
  text: string;
  isComplete: boolean;
}

/**
 * Gemini AI Service
 * Handles all interactions with Google Gemini API
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GenerationConfig;

  constructor(config: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    
    // Initialize model
    const modelName = config.model || 'gemini-2.0-flash-exp';
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    
    // Generation config
    this.config = {
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 8000,
      topP: config.topP ?? 0.95,
      topK: config.topK ?? 40,
    };
  }

  /**
   * Generate text from prompt
   */
  async generate(prompt: string, systemInstruction?: string): Promise<GeminiResponse> {
    try {
      const startTime = Date.now();
      
      // Create chat or simple generation
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.config,
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });

      const response = result.response;
      const text = response.text();
      const duration = Date.now() - startTime;

      // Calculate tokens (approximate)
      const tokensUsed = Math.ceil((prompt.length + text.length) / 4);

      return {
        text,
        tokensUsed,
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error: any) {
      console.error('❌ Gemini generation error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate with streaming
   */
  async *generateStream(prompt: string, systemInstruction?: string): AsyncGenerator<GeminiStreamChunk> {
    try {
      const result = await this.model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: this.config,
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield {
          text,
          isComplete: false,
        };
      }

      yield {
        text: '',
        isComplete: true,
      };
    } catch (error: any) {
      console.error('❌ Gemini streaming error:', error);
      throw new Error(`Gemini streaming error: ${error.message}`);
    }
  }

  /**
   * Chat conversation
   */
  async chat(messages: { role: 'user' | 'model'; text: string }[], systemInstruction?: string): Promise<GeminiResponse> {
    try {
      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const result = await this.model.generateContent({
        contents,
        generationConfig: this.config,
        systemInstruction: systemInstruction ? { role: 'system', parts: [{ text: systemInstruction }] } : undefined,
      });

      const response = result.response;
      const text = response.text();

      return {
        text,
        tokensUsed: Math.ceil(text.length / 4),
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error: any) {
      console.error('❌ Gemini chat error:', error);
      throw new Error(`Gemini chat error: ${error.message}`);
    }
  }

  /**
   * Analyze image with text
   */
  async analyzeImage(imageData: string, prompt: string): Promise<GeminiResponse> {
    try {
      // imageData should be base64 encoded
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg', // or 'image/png'
                data: imageData,
              },
            },
          ],
        }],
        generationConfig: this.config,
      });

      const response = result.response;
      const text = response.text();

      return {
        text,
        tokensUsed: Math.ceil(text.length / 4),
        finishReason: response.candidates?.[0]?.finishReason || 'STOP',
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      };
    } catch (error: any) {
      console.error('❌ Gemini image analysis error:', error);
      throw new Error(`Gemini image analysis error: ${error.message}`);
    }
  }

  /**
   * Parse structured JSON from prompt
   */
  async generateJSON<T = any>(prompt: string, schema?: string, systemInstruction?: string): Promise<T> {
    try {
      const fullPrompt = schema
        ? `${prompt}\n\nPlease respond with valid JSON matching this schema:\n${schema}`
        : `${prompt}\n\nPlease respond with valid JSON only.`;

      const response = await this.generate(fullPrompt, systemInstruction);
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = response.text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(jsonText);
      return parsed as T;
    } catch (error: any) {
      console.error('❌ Gemini JSON generation error:', error);
      throw new Error(`Failed to generate valid JSON: ${error.message}`);
    }
  }

  /**
   * Generate embedding vector (for semantic search)
   * Note: Gemini doesn't have native embedding API, so we'll use a workaround
   * In production, consider using Google's separate embedding model or another service
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // This is a placeholder - in production, use proper embedding model
      // For now, we'll create a simple hash-based vector
      const hash = this.simpleHash(text);
      const vector = new Array(384).fill(0).map((_, i) => 
        Math.sin(hash + i * 0.1) * 0.5 + 0.5
      );
      return vector;
    } catch (error: any) {
      console.error('❌ Embedding generation error:', error);
      throw new Error(`Embedding generation error: ${error.message}`);
    }
  }

  /**
   * Simple hash function for embedding placeholder
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Count tokens in text (approximate)
   */
  countTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.generate('Hello', 'You are a helpful assistant.');
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Create singleton instance
 */
let geminiInstance: GeminiService | null = null;

export function initGemini(config: GeminiConfig): GeminiService {
  if (!geminiInstance) {
    geminiInstance = new GeminiService(config);
  }
  return geminiInstance;
}

export function getGemini(): GeminiService {
  if (!geminiInstance) {
    throw new Error('Gemini service not initialized. Call initGemini() first.');
  }
  return geminiInstance;
}
