import React, { useState } from 'react';
import { MotivationalQuote } from '../types';
import { ReminderSettings } from '../utils/storage';
import { playBellChime, playTapSound } from '../utils/sound';
import {
  X,
  Plus,
  Quote,
  Sparkles,
  Bell,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface MotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotes: MotivationalQuote[];
  activeQuoteId: string;
  onSelectQuote: (id: string) => void;
  onAddQuote: (content: string, author?: string) => void;
  onDeleteQuote: (id: string) => void;
  reminderSettings: ReminderSettings;
  onSaveReminderSettings: (settings: ReminderSettings) => void;
}

export const MotivationModal: React.FC<MotivationModalProps> = ({
  isOpen,
  onClose,
  quotes,
  activeQuoteId,
  onSelectQuote,
  onAddQuote,
  onDeleteQuote,
  reminderSettings,
  onSaveReminderSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'reminders'>('quotes');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Reminder settings local state
  const [reminderEnabled, setReminderEnabled] = useState(reminderSettings.enabled);
  const [reminderTime, setReminderTime] = useState(reminderSettings.time);
  const [reminderText, setReminderText] = useState(reminderSettings.reminderText);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    playTapSound();
    onAddQuote(newContent.trim(), newAuthor.trim() || '自勉');
    setNewContent('');
    setNewAuthor('');
    setIsAdding(false);
  };

  const handleRequestPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('您的浏览器不支持系统桌面通知');
      return;
    }
    const res = await Notification.requestPermission();
    setNotificationStatus(res);
    if (res === 'granted') {
      setReminderEnabled(true);
    }
  };

  const handleTestNotification = () => {
    playBellChime();
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('🌿 晨露打卡 · 专注提醒', {
        body: reminderText || '静下心来，开启今天的新一轮深度学习吧！',
        icon: '/favicon.ico',
      });
    }
  };

  const handleSaveReminders = () => {
    playTapSound();
    onSaveReminderSettings({
      enabled: reminderEnabled,
      time: reminderTime,
      reminderText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-stone-900 text-base">
              激励语录与自律提醒
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 px-5 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'quotes'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            自订励志语录 ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'reminders'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            每日专注提醒与通知
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'quotes' ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  点击语录设为今日顶部激励，也可以添加你的座右铭
                </span>
                {!isAdding && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加自订语录</span>
                  </button>
                )}
              </div>

              {/* Add form */}
              {isAdding && (
                <form onSubmit={handleCreateQuote} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2.5">
                  <div className="text-xs font-semibold text-stone-800">
                    新增激励箴言
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="输入激励自己的句子，如：日拱一卒，功不唐捐..."
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      placeholder="作者/出处 (可选，如：王阳明/自勉)"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                    >
                      添加保存
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-700"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}

              {/* Quotes list */}
              <div className="space-y-2">
                {quotes.map(q => {
                  const isActive = q.id === activeQuoteId;
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        playTapSound();
                        onSelectQuote(q.id);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-stone-800 font-serif leading-relaxed">
                          “{q.content}”
                        </p>
                        {isActive && (
                          <span className="text-[10px] text-emerald-700 font-semibold px-1.5 py-0.5 bg-emerald-100 rounded shrink-0">
                            正在展示
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2">
                        <span>—— {q.author || '心流自勉'} {q.isCustom && '(自定义)'}</span>
                        {q.isCustom && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onDeleteQuote(q.id);
                            }}
                            className="text-stone-400 hover:text-rose-600 p-0.5"
                            title="删除自订语录"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-5 text-left">
              {/* Daily reminder switch */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-stone-900">
                    开启每日打卡自律提醒
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    在指定时间提醒你进行每日学习打卡与复盘
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    reminderEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      reminderEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  每日提醒时间点
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg font-mono"
                  />
                  <span className="text-xs text-stone-500">
                    推荐设置在晚间 20:30 ~ 21:30 进行全天复盘
                  </span>
                </div>
              </div>

              {/* Reminder text */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  自定义提醒语
                </label>
                <textarea
                  rows={2}
                  value={reminderText}
                  onChange={e => setReminderText(e.target.value)}
                  placeholder="写下最触动你的提醒，比如：放下手机，今天的学习复盘完成了吗？"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Notification Permission & Test */}
              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">系统通知权限状态：</span>
                  <span className={`font-semibold ${notificationStatus === 'granted' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {notificationStatus === 'granted' ? '已授权' : '尚未授权'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {notificationStatus !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                    >
                      申请浏览器通知权限
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>试听提醒音效 & 测试通知</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
          {activeTab === 'reminders' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveReminders}
                className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
              >
                保存提醒设置
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
