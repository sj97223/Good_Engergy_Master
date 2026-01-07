import React, { useState } from 'react';
import { X, Settings, Database, Keyboard, Cpu, Globe, Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AppSettings } from '../types';
import { apiClient } from '../lib/apiClient';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ settings, onUpdate, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleChange = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const success = await apiClient.testConnection(settings);
      setTestResult(success ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b bg-white z-10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <Settings className="w-5 h-5 text-primary" />
            连接与设置
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Provider Selection */}
          <section className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5" /> 接口供应商
            </label>
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => handleChange('provider', 'gemini')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  settings.provider === 'gemini' ? 'bg-white shadow-sm text-primary ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gemini
              </button>
              <button
                onClick={() => handleChange('provider', 'mimo')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  settings.provider === 'mimo' ? 'bg-white shadow-sm text-primary ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                MiMo / OpenAI
              </button>
            </div>
          </section>

          {/* Model Name */}
          <section className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" /> 模型名称 (可选)
            </label>
            <input
              type="text"
              value={settings.modelName}
              onChange={(e) => handleChange('modelName', e.target.value)}
              placeholder={settings.provider === 'gemini' ? "默认: gemini-3-pro-preview" : "默认: gpt-3.5-turbo"}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </section>

          {/* Dynamic Settings */}
          {settings.provider === 'gemini' ? (
            <section className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-3.5 h-3.5" /> API Key
              </label>
              <input
                type="password"
                value={settings.geminiKey}
                onChange={(e) => handleChange('geminiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <p className="text-[10px] text-gray-400 leading-tight">
                * 如果环境变量已配置 Key，此处可留空。优先使用此处设置的 Key。
              </p>
            </section>
          ) : (
            <div className="space-y-4 pt-4 border-t border-dashed border-gray-200">
              <section className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> API Key (必填)
                </label>
                <input
                  type="password"
                  value={settings.mimoKey}
                  onChange={(e) => handleChange('mimoKey', e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </section>

              <section className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Base URL
                </label>
                <input
                  type="text"
                  value={settings.mimoBaseUrl}
                  onChange={(e) => handleChange('mimoBaseUrl', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </section>
            </div>
          )}

          {/* Test Connection Button */}
          <div className="pt-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border
                ${testResult === 'success' 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : testResult === 'error'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : testResult === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : testResult === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              )}
              {testing ? '测试连接中...' : testResult === 'success' ? '连接成功' : testResult === 'error' ? '连接失败' : '测试连接可用性'}
            </button>
          </div>

          {/* Keyboard Preference */}
          <section className="space-y-3 pt-4 border-t border-dashed border-gray-200">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="w-3.5 h-3.5" /> 交互设置
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                checked={settings.useCmdEnter}
                onChange={(e) => handleChange('useCmdEnter', e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
              />
              <span className="text-sm text-gray-700 font-medium">使用 Cmd/Ctrl + Enter 发送消息</span>
            </label>
          </section>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0 z-10">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95"
          >
            完成并保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;