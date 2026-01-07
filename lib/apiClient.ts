import { ApiStatus, Message, AppSettings } from '../types';

class GenAIClient {
  public async sendMessage(
    messages: Message[],
    settings: AppSettings,
    onStatusUpdate: (status: Partial<ApiStatus>) => void
  ): Promise<{ content: string; latency: number }> {
    const startTime = Date.now();
    onStatusUpdate({ state: 'Requesting', errorMsg: undefined });

    try {
      // Use the backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const content = data.content;
      const latency = Date.now() - startTime;
      
      onStatusUpdate({ state: 'Success', latency });
      return { content, latency };

    } catch (error: any) {
      const latency = Date.now() - startTime;
      console.error("API Error Details:", error);
      onStatusUpdate({ state: 'Error', latency, errorMsg: error.message || "请求失败" });
      throw error;
    }
  }

  public async testConnection(settings: AppSettings): Promise<boolean> {
    // Simple ping test or just return true as backend handles connection
    try {
       const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Ping' }],
        })
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
}

export const apiClient = new GenAIClient();
