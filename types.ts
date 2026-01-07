export interface ChecklistItem {
  task: string;
  why: string;
  timebox: string;
  difficulty: 'S' | 'M' | 'L';
}

export interface PositiveResponse {
  title: string;
  reframe: string;
  bright_spots: string[];
  effort_directions: string[];
  checklist: ChecklistItem[];
  encouragement: string;
  next_question: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  parsedContent?: PositiveResponse;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type ApiProvider = 'gemini' | 'mimo';

export interface AppSettings {
  provider: ApiProvider;
  geminiKey: string;
  mimoKey: string;
  mimoBaseUrl: string;
  modelName: string;
  useCmdEnter: boolean;
}

export interface ApiStatus {
  state: 'Idle' | 'Requesting' | 'Success' | 'Error';
  latency: number;
  currentKeyIndex: number;
  errorMsg?: string;
  cooldownRemaining: number;
}