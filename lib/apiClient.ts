import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT_TEXT } from '../constants';
import { ApiStatus, Message, AppSettings } from '../types';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    reframe: { type: Type.STRING },
    bright_spots: { type: Type.ARRAY, items: { type: Type.STRING } },
    effort_directions: { type: Type.ARRAY, items: { type: Type.STRING } },
    checklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          why: { type: Type.STRING },
          timebox: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["S", "M", "L"] }
        },
        required: ["task", "why", "timebox", "difficulty"],
      }
    },
    encouragement: { type: Type.STRING },
    next_question: { type: Type.STRING }
  },
  required: ["title", "reframe", "bright_spots", "effort_directions", "checklist", "encouragement", "next_question"]
};

class GenAIClient {
  // Helper to normalize Base URL (remove trailing slash)
  private normalizeUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  public async sendMessage(
    messages: Message[],
    settings: AppSettings,
    onStatusUpdate: (status: Partial<ApiStatus>) => void
  ): Promise<{ content: string; latency: number }> {
    const startTime = Date.now();
    onStatusUpdate({ state: 'Requesting', errorMsg: undefined });

    try {
      if (settings.provider === 'gemini') {
        // Fallback chain for API Key
        const apiKey = settings.geminiKey || process.env.API_KEY;
        if (!apiKey) throw new Error("Gemini API Key 未配置，请在设置中输入");

        const ai = new GoogleGenAI({ apiKey });
        const contents = messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

        const model = settings.modelName || 'gemini-3-pro-preview';

        const response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: SYSTEM_PROMPT_TEXT,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.7,
          },
        });
        
        const latency = Date.now() - startTime;
        onStatusUpdate({ state: 'Success', latency });
        return { content: response.text || "", latency };
      } else {
        if (!settings.mimoKey) throw new Error("API Key 未配置，请在设置中输入");

        const model = settings.modelName || 'gpt-3.5-turbo';
        const baseUrl = this.normalizeUrl(settings.mimoBaseUrl);
        
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.mimoKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText} (${response.status})`);
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) throw new Error("Empty response from API");

        const latency = Date.now() - startTime;
        onStatusUpdate({ state: 'Success', latency });
        return { content, latency };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error("API Error Details:", error);
      onStatusUpdate({ state: 'Error', latency, errorMsg: error.message || "请求失败" });
      throw error;
    }
  }

  public async testConnection(settings: AppSettings): Promise<boolean> {
    try {
      if (settings.provider === 'gemini') {
        const apiKey = settings.geminiKey || process.env.API_KEY;
        if (!apiKey) throw new Error("Missing Key");
        
        const ai = new GoogleGenAI({ apiKey });
        const model = settings.modelName || 'gemini-3-flash-preview';
        await ai.models.generateContent({
          model: model,
          contents: { parts: [{ text: "Hello" }] },
        });
        return true;
      } else {
        if (!settings.mimoKey) throw new Error("Missing Key");
        
        const model = settings.modelName || 'gpt-3.5-turbo';
        const baseUrl = this.normalizeUrl(settings.mimoBaseUrl);

        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.mimoKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
          })
        });
        return response.ok;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export const apiClient = new GenAIClient();