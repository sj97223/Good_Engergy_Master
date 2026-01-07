import React from 'react';
import { ApiStatus } from '../types';
import { Activity, Clock, Key, AlertCircle, Zap } from 'lucide-react';

interface Props {
  status: ApiStatus;
  remainingCount: number;
}

const StatusPanel: React.FC<Props> = ({ status, remainingCount }) => {
  const getStatusConfig = () => {
    switch (status.state) {
      case 'Requesting': return { color: 'bg-blue-500', text: 'text-blue-600', label: '正在处理' };
      case 'Success': return { color: 'bg-green-500', text: 'text-green-600', label: '就绪' };
      case 'Error': return { color: 'bg-red-500', text: 'text-red-600', label: '连接错误' };
      default: return { color: 'bg-gray-400', text: 'text-gray-500', label: '空闲' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="w-full bg-white border-b border-gray-100 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono z-[60] shadow-sm overflow-hidden">
      {/* Left: Engine Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            {status.state === 'Requesting' && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`}></span>
          </div>
          <span className={`font-bold uppercase tracking-tighter ${config.text}`}>{config.label}</span>
        </div>
        
        <div className="h-3 w-[1px] bg-gray-200" />
        
        <div className="hidden sm:flex items-center gap-3 text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{status.latency > 0 ? `${status.latency}ms` : '---'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Key className="w-3 h-3" />
            <span>通道 #{status.currentKeyIndex + 1}</span>
          </div>
        </div>
      </div>

      {/* Center: Processing Progress (Only visible when requesting) */}
      {status.state === 'Requesting' && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1/3 h-[2px]">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Right: Resources */}
      <div className="flex items-center gap-4">
        {status.state === 'Error' && status.errorMsg && (
          <div className="hidden md:flex items-center gap-1 text-red-400 max-w-[200px] truncate">
            <AlertCircle className="w-3 h-3 flex-none" />
            <span className="truncate">{status.errorMsg}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 px-2 py-0.5 bg-orange-50 rounded text-primary font-bold">
          <Zap className="w-3 h-3 fill-current" />
          <span>余量 {remainingCount}</span>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { left: -100%; width: 30%; }
          50% { width: 50%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  );
};

export default StatusPanel;