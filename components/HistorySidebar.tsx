
import React from 'react';
import { History, MessageSquare, Plus, Trash2, Clock, PanelLeftClose, ChevronLeft } from 'lucide-react';
import { ChatSession } from '../types';

interface Props {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const HistorySidebar: React.FC<Props> = ({ 
  sessions, 
  currentSessionId, 
  onSelect, 
  onNew, 
  onDelete, 
  isOpen,
  onToggle 
}) => {
  return (
    <div 
      className={`flex-none bg-gray-900 text-gray-300 h-full flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out z-50
        absolute md:relative
        ${isOpen ? 'w-72 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full pointer-events-none'}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <History className="w-4 h-4" />
          会话历史
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
          title="折叠侧边栏"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 shrink-0">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all text-sm font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          开启新拆解
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide">
        {sessions.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-600 italic">
            暂无历史记录
          </div>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm
                ${currentSessionId === session.id 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'hover:bg-gray-800/50 hover:text-gray-100 border-l-2 border-transparent'}`}
            >
              <MessageSquare className={`w-4 h-4 flex-none ${currentSessionId === session.id ? 'text-primary' : 'text-gray-600'}`} />
              <div className="flex-1 truncate">
                <div className="truncate font-medium">{session.title || '未命名对话'}</div>
                <div className="text-[10px] opacity-40 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2 h-2" />
                  {new Date(session.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 flex flex-col gap-1 shrink-0">
        <div className="flex justify-between items-center opacity-50">
          <span>存储状态</span>
          <span>Local Storage</span>
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
