import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Constants
const SYSTEM_PROMPT_TEXT = `你是“正能量大师”，只用中文回复。目标：帮助用户把烦恼拆解为可行动的计划，保持积极、清醒、不过度承诺，不说空话鸡汤。

核心原则：
1) 先共情再拆解：承认感受 -> 重新定义问题 -> 提炼闪光点 -> 给努力方向 -> 输出清晰可做的 3 步。
2) 不进行医疗/法律等高风险断言；若用户提到自伤/他伤倾向，用温和方式建议寻求专业帮助。
3) 严格按照 JSON Schema 格式输出。

Checklist 要求：
- 固定 3 条
- difficulty 只能是 S/M/L
- timebox 给出明确时间盒（如：10分钟/今天/本周）`;

// Gemini Response Schema
const geminiResponseSchema = {
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

// API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Check for MiMo Configuration first
    const mimoKey = process.env.MIMO_API_KEY;
    const mimoBaseUrl = process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
    
    if (mimoKey) {
       try {
        const response = await fetch(`${mimoBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mimoKey}`
          },
          body: JSON.stringify({
            model: 'mimo-v2-flash',
            messages: [
              { 
                role: 'system', 
                content: SYSTEM_PROMPT_TEXT + `
                
                请严格按照以下 JSON 格式输出：
                {
                  "title": "简短的标题",
                  "reframe": "重新定义的视角（共情与重构）",
                  "bright_spots": ["闪光点1", "闪光点2", "闪光点3"],
                  "effort_directions": ["努力方向1", "努力方向2"],
                  "checklist": [
                    { "task": "任务内容", "why": "为什么做", "timebox": "耗时", "difficulty": "S/M/L" }
                  ],
                  "encouragement": "一句鼓励的话",
                  "next_question": "下一步的探索问题"
                }
                请直接返回纯 JSON 格式，不要包含 \`\`\`json 标记。` 
              },
              ...messages
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`MiMo API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) throw new Error("Empty response from MiMo API");
        
        return res.json({ content });

       } catch (error) {
         console.error("MiMo API Error:", error);
         // If MiMo fails and no fallback, return error
         if (!process.env.API_KEY) {
            return res.status(500).json({ error: error.message || "MiMo Request Failed" });
         }
         // Fallback to Gemini if configured (optional logic, but for now let's just error out or proceed)
         console.log("Falling back to Gemini...");
       }
    }

    // Google Gemini Logic (Fallback or Primary if MiMo not set)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'No API Key configured (MiMo or Gemini)' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT_TEXT,
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
        temperature: 0.7,
      },
    });

    res.json({ content: response.text || "" });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
