import React, { useEffect, useState } from 'react';
import { WeeklySummaryStats } from '../types';
import { exportReportToCanvas, generateWeeklyReportText } from '../utils/canvasExport';
import { X, Download, Copy, Check, Sparkles } from 'lucide-react';

interface WeeklyReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WeeklySummaryStats;
  feedback: string;
}

export const WeeklyReportExportModal: React.FC<WeeklyReportExportModalProps> = ({
  isOpen,
  onClose,
  stats,
  feedback,
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    setGenerating(true);
    exportReportToCanvas(stats, feedback).then(url => {
      setImageUrl(url);
      setGenerating(false);
    });
  }, [isOpen, stats, feedback]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = generateWeeklyReportText(stats, feedback);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `学习周报_${stats.weekLabel.replace(/\s/g, '')}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-base">学习周报 · 分享卡片</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-stone-50 flex items-center justify-center">
          {generating ? (
            <div className="py-20 text-center text-sm text-stone-500">
              正在生成高清周报分享卡片...
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="周报统计卡片"
              className="max-h-[58vh] object-contain rounded-xl shadow-md border border-stone-200"
            />
          ) : (
            <div className="py-20 text-center text-sm text-stone-500">
              生成失败，请重试
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制周报文案' : '复制周报文案'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              关闭
            </button>
            <button
              onClick={handleDownloadImage}
              disabled={!imageUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>保存海报图片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
