import React, { useState, useEffect, useRef } from 'react';
import { PositiveResponse } from '../types';
import { CheckCircle2, Circle, Sparkles, Target, ArrowRight, Quote, Download, Image as ImageIcon, X, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface Props {
  data: PositiveResponse;
  messageIndex: number;
}

const ResponseCard: React.FC<Props> = ({ data, messageIndex }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const storageKey = `checklist_state_${messageIndex}`;
  const [checkedState, setCheckedState] = useState<boolean[]>([false, false, false]);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCheckedState(JSON.parse(saved));
      } catch (e) { console.error("Failed to load checklist state", e); }
    }
  }, [storageKey]);

  const toggleCheck = (idx: number) => {
    const newState = [...checkedState];
    newState[idx] = !newState[idx];
    setCheckedState(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      // Create a temporary wrapper to ensure styles are captured correctly without rounded corners if desired
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3, // High resolution for mobile retina screens
        backgroundColor: '#ffffff',
        style: { 
          borderRadius: '0px',
          boxShadow: 'none',
          margin: '0',
          transform: 'none'
        }
      });
      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadDirectly = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `positive-energy-plan-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  return (
    <>
      <div className="relative group w-full max-w-2xl mx-auto my-4">
        {/* Action Buttons Floating - visible on hover or tap */}
        <div className="absolute -top-3 right-4 z-10 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-100 shadow-md rounded-full text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            {isExporting ? <ImageIcon className="w-3 h-3 animate-pulse" /> : <Download className="w-3 h-3" />}
            {isExporting ? '生成中...' : '保存卡片'}
          </button>
        </div>

        <div 
          ref={cardRef}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden w-full animate-fade-in-up"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-50 p-6 border-b border-orange-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  {data.title || "重塑视角"}
                </h3>
                <div className="mt-3 flex items-start gap-2">
                  <Quote className="w-4 h-4 text-primary shrink-0 opacity-40 rotate-180" />
                  <p className="text-sm text-gray-700 font-medium leading-relaxed italic">
                    {data.reframe}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Bright Spots & Directions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50/40 rounded-xl p-4 border border-amber-100/50">
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  内在闪光点
                </h4>
                <ul className="space-y-2">
                  {data.bright_spots.map((spot, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-400 font-bold">•</span>
                      {spot}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/50">
                <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  努力方向
                </h4>
                <ul className="space-y-2">
                  {data.effort_directions.map((dir, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-bold">→</span>
                      {dir}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                行动清单 ACTION LIST
              </h4>
              <div className="space-y-2.5">
                {data.checklist.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => toggleCheck(i)}
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none
                      ${checkedState[i] 
                        ? 'bg-gray-50 border-gray-100 opacity-60' 
                        : 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-md'}`}
                  >
                    <div className={`mt-0.5 transition-colors ${checkedState[i] ? 'text-gray-300' : 'text-primary'}`}>
                      {checkedState[i] ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${checkedState[i] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.task}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-2 flex items-center flex-wrap gap-2 font-medium">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">意义: {item.why}</span>
                        <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1">
                           <span className="scale-75">⏳</span> {item.timebox}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-bold border
                          ${item.difficulty === 'S' ? 'bg-green-50 text-green-600 border-green-100' : 
                            item.difficulty === 'M' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                            'bg-red-50 text-red-600 border-red-100'}`}>
                          {item.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-50">
              <div className="bg-gray-50 rounded-xl p-4 relative">
                 <Quote className="absolute top-2 right-4 w-10 h-10 text-primary opacity-5" />
                 <p className="text-sm font-bold text-gray-700 italic leading-relaxed text-center">
                    "{data.encouragement}"
                 </p>
              </div>
              {data.next_question && (
                 <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-bold text-primary uppercase tracking-tighter">
                    <span>下一步探索</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="text-gray-400 italic">"{data.next_question}"</span>
                 </div>
              )}
            </div>
          </div>
          
          {/* Brand Watermark for Export */}
          <div className="px-6 py-3 bg-gray-50 text-[8px] text-gray-300 flex justify-between items-center font-mono">
             <span>POSITIVE ENERGY MASTER AI</span>
             <span>GENERATED BY GEMINI ENGINE</span>
          </div>
        </div>
      </div>

      {/* Image Preview Modal for Mobile/Saving */}
      {generatedImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setGeneratedImage(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">长按下方图片保存到相册</h3>
              <button onClick={() => setGeneratedImage(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden shadow-sm max-h-[60vh] overflow-y-auto bg-gray-50">
              <img src={generatedImage} alt="Generated Plan" className="w-full h-auto block" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGeneratedImage(null)} className="py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs active:bg-gray-100">
                关闭
              </button>
              <button onClick={downloadDirectly} className="py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-md active:bg-orange-600">
                直接下载文件
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponseCard;