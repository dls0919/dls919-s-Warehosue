import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Sparkles } from 'lucide-react';
import { playBellChime, playTapSound } from '../utils/sound';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle: string;
  dateKey: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}

const INSPIRATION_TAGS = [
  '突破了今日的核心难点',
  '梳理出清晰的思维导图',
  '真题错题已精析整理',
  '心流专注状态极佳',
  '明天继续加固弱点',
];

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  onClose,
  habitTitle,
  dateKey,
  initialNotes = '',
  onSave,
}) => {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    playBellChime();
    onSave(notes.trim());
    onClose();
  };

  const handleAppendTag = (tag: string) => {
    playTapSound();
    setNotes(prev => (prev ? `${prev} · ${tag}` : tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-base">记录学习心得与复盘</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5 text-left">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-medium text-stone-800">[{habitTitle}]</span>
            <span aria-hidden="true">·</span>
            <span>{dateKey} 打卡复盘</span>
          </div>

          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="今天攻克了什么关键概念？有什么易错点或者心得体会？写下来能显著加深记忆..."
            className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900 leading-relaxed font-serif"
            autoFocus
          />

          {/* Quick tags */}
          <div>
            <span className="text-[11px] text-stone-600 block mb-1.5">
              点击快速插入心得标签：
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleAppendTag(tag)}
                  className="px-2 py-1 text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>保存心得</span>
          </button>
        </div>
      </div>
    </div>
  );
};
