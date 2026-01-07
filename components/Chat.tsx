import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, AlertTriangle, User, RotateCcw, Settings, Menu, Globe, PanelLeftOpen } from 'lucide-react';
import { Message, ApiStatus, PositiveResponse, ChatSession, AppSettings } from '../types';
import { apiClient } from '../lib/apiClient';
import { SYSTEM_PROMPT_TEXT, MAX_USER_TURNS, MAX_CONTEXT_MESSAGES } from '../constants';
import StatusPanel from './StatusPanel';
import ResponseCard from './ResponseCard';
import SettingsModal from './SettingsModal';
import HistorySidebar from './HistorySidebar';

const DEFAULT_SETTINGS: AppSettings = {
  provider: 'gemini',
  geminiKey: '',
  mimoKey: process.env.VITE_MIMO_KEY || '',
  mimoBaseUrl: process.env.VITE_MIMO_BASE_URL || 'https://api.openai.com/v1',
  modelName: '',
  useCmdEnter: false
};

const Chat: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  });
  
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    state: 'Idle',
    latency: 0,
    currentKeyIndex: 0,
    cooldownRemaining: 0
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check for API Keys on mount
  useEffect(() => {
    const hasEnvKey = !!process.env.API_KEY;
    const hasSettingsKey = settings.provider === 'gemini' ? !!settings.geminiKey : !!settings.mimoKey;
    
    if (!hasEnvKey && !hasSettingsKey) {
      setTimeout(() => setIsSettingsOpen(true), 500);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) setSessions(JSON.parse(saved));
    
    // Mobile responsive check
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const userSendCount = messages.filter(m => m.role === 'user').length;
  const isLimitReached = userSendCount >= MAX_USER_TURNS;

  const handleNewSession = () => {
    if (messages.length > 0) {
      saveCurrentToHistory();
    }
    setMessages([]);
    setCurrentSessionId(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const saveCurrentToHistory = () => {
    if (messages.length === 0) return;
    const title = messages.find(m => m.parsedContent)?.parsedContent?.title || messages[0].content.slice(0, 15);
    const newSession: ChatSession = {
      id: currentSessionId || Date.now().toString(),
      title,
      messages: [...messages],
      createdAt: Date.now()
    };
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== newSession.id);
      return [newSession, ...filtered].slice(0, 50);
    });
    setCurrentSessionId(newSession.id);
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(id);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isLimitReached) return;
    const userText = input.trim();
    setInput('');
    const newUserMsg: Message = { role: 'user', content: userText, timestamp: Date.now() };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);
    try {
      const payloadMessages: Message[] = [
        { role: 'system', content: SYSTEM_PROMPT_TEXT, timestamp: 0 },
        ...updatedMessages.slice(-MAX_CONTEXT_MESSAGES)
      ];
      const { content } = await apiClient.sendMessage(payloadMessages, settings, (status) => {
        setApiStatus(prev => ({ ...prev, ...status }));
      });
      let parsedData: PositiveResponse | undefined;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) { console.warn("Parse Error", e); }
      const newAiMsg: Message = { role: 'assistant', content, parsedContent: parsedData, timestamp: Date.now() };
      const finalMessages = [...updatedMessages, newAiMsg];
      setMessages(finalMessages);
      const title = parsedData?.title || finalMessages[0].content.slice(0, 15);
      const updatedSession: ChatSession = { id: currentSessionId || Date.now().toString(), title, messages: finalMessages, createdAt: Date.now() };
      setSessions(prev => [updatedSession, ...prev.filter(s => s.id !== updatedSession.id)]);
      setCurrentSessionId(updatedSession.id);
    } catch (error: any) { 
      console.error(error);
      if (error.message?.includes('Key') || error.message?.includes('key')) {
         setIsSettingsOpen(true);
      }
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isCmdEnter = (e.metaKey || e.ctrlKey) && e.key === 'Enter';
    const isEnter = e.key === 'Enter' && !e.shiftKey;
    if (settings.useCmdEnter ? isCmdEnter : isEnter) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans flex-col">
      <StatusPanel status={apiStatus} remainingCount={MAX_USER_TURNS - userSendCount} />

      <div className="flex flex-1 overflow-hidden relative">
        <HistorySidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId}
          onSelect={loadSession}
          onNew={handleNewSession}
          onDelete={deleteSession}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col relative min-w-0 bg-white shadow-inner">
          <header className="flex-none p-4 bg-white/80 backdrop-blur-md border-b flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-orange-50 rounded-xl text-primary transition-all"
                  title="展开历史记录"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-bold shadow-sm">
                  正
                </div>
                <h1 className="font-black text-gray-800 text-sm md:text-base tracking-tight">正能量大师</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-xl transition-all ${
                  (!settings.geminiKey && !process.env.API_KEY && !settings.mimoKey) 
                    ? 'text-red-500 bg-red-50 animate-pulse ring-2 ring-red-200' 
                    : 'text-gray-400 hover:text-primary hover:bg-orange-50'
                }`}
                title="设置 API Key"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNewSession}
                className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-all px-3 py-1.5 rounded-xl hover:bg-orange-50 text-xs font-bold border border-transparent hover:border-orange-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">新拆解</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6 animate-fade-in-up">
                <div className="w-20 h-20 bg-orange-100/50 rounded-3xl flex items-center justify-center text-orange-400 shadow-inner">
                   <User className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-black text-gray-700">Hi, 这里是你的烦恼粉碎机</p>
                  <p className="text-sm max-w-xs mx-auto text-gray-400 leading-relaxed font-medium">
                    {(!settings.geminiKey && !process.env.API_KEY && !settings.mimoKey)
                      ? "👋 请先点击右上角设置图标，配置 API Key 开始使用。"
                      : "输入你现在的焦虑、压力或难题，我们将用最硬核的正能量帮你拆解它。"}
                  </p>
                </div>
                {(!settings.geminiKey && !process.env.API_KEY && !settings.mimoKey) ? (
                   <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg animate-bounce"
                   >
                     去配置 Key
                   </button>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                    {['面试紧张', '想健身但没动力', '工作堆积如山', '失眠焦虑'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setInput(tag)}
                        className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:border-primary hover:text-primary transition-all shadow-sm"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className="max-w-[85%] bg-primary text-white font-bold rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full">
                    {msg.parsedContent ? (
                      <ResponseCard data={msg.parsedContent} messageIndex={idx} />
                    ) : (
                      <div className="max-w-[90%] bg-red-50 border border-red-100 rounded-2xl p-4 text-xs font-mono">
                        <div className="flex items-center gap-2 text-red-500 font-black mb-2 uppercase tracking-widest">
                          <AlertTriangle className="w-4 h-4" /> 分析异常
                        </div>
                        <div className="whitespace-pre-wrap opacity-70 leading-relaxed">{msg.content}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">MASTER ANALYZING YOUR TROUBLES...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          <div className="flex-none p-4 md:p-6 bg-white border-t border-gray-50">
            <div className="max-w-3xl mx-auto relative flex items-end gap-3">
              <div className="flex-1 relative group">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLimitReached || isLoading}
                  placeholder={isLimitReached ? "对话次数已达上限" : settings.useCmdEnter ? "Ctrl + Enter 发送..." : "输入你的烦恼，交给大师分析..."}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-5 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary resize-none h-[60px] text-sm font-medium transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLimitReached || isLoading}
                className={`flex-none p-4 text-white rounded-2xl transition-all shadow-lg
                  ${!input.trim() || isLimitReached || isLoading 
                    ? 'bg-gray-200 cursor-not-allowed' 
                    : 'bg-primary hover:bg-orange-600 hover:-translate-y-0.5 shadow-primary/20 active:translate-y-0'}`}
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[9px] text-gray-300 font-black uppercase tracking-widest">
               <span className="flex items-center gap-1.5">
                 <Globe className="w-3 h-3"/> {settings.provider === 'gemini' ? (settings.modelName || 'GEMINI PRO') : (settings.modelName || 'CUSTOM')}
               </span>
               <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
               <span>Powered by Positive Energy Methodology</span>
            </div>
          </div>
        </main>
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          onUpdate={setSettings} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
};

export default Chat;