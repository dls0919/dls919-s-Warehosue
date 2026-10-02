import React, { useState, useEffect } from 'react';
import { HabitItem, HabitLog, MotivationalQuote, ActiveTab } from './types';
import {
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadQuotes,
  saveQuotes,
  getActiveQuoteId,
  setActiveQuoteId,
  loadReminderSettings,
  saveReminderSettings,
  ReminderSettings,
  INITIAL_HABITS,
} from './utils/storage';
import { formatDateKey } from './utils/date';
import { playBellChime } from './utils/sound';
import { Navbar } from './components/Navbar';
import { DailyCheckIn } from './components/DailyCheckIn';
import { WeeklyReport } from './components/WeeklyReport';
import { FocusTimer } from './components/FocusTimer';
import { HabitManagerView } from './components/HabitManagerView';
import { HabitManagerModal } from './components/HabitManagerModal';
import { MotivationModal } from './components/MotivationModal';
import { ReflectionModal } from './components/ReflectionModal';
import { CheckSquare, BarChart3, Timer, Settings } from 'lucide-react';

export default function App() {
  const [habits, setHabits] = useState<HabitItem[]>(() => loadHabits());
  const [logs, setLogs] = useState<HabitLog[]>(() => loadLogs());
  const [quotes, setQuotes] = useState<MotivationalQuote[]>(() => loadQuotes());
  const [activeQuoteIdState, setActiveQuoteIdState] = useState<string>(() => getActiveQuoteId());
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => loadReminderSettings());

  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [focusSelectedHabitId, setFocusSelectedHabitId] = useState<string | undefined>(undefined);

  // Modals state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<HabitItem | null>(null);
  const [isMotivationModalOpen, setIsMotivationModalOpen] = useState(false);
  const [reflectionModal, setReflectionModal] = useState<{
    isOpen: boolean;
    habitId: string;
    habitTitle: string;
    dateKey: string;
    notes?: string;
  }>({
    isOpen: false,
    habitId: '',
    habitTitle: '',
    dateKey: todayKey,
    notes: '',
  });

  // Sync to localStorage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveQuotes(quotes);
  }, [quotes]);

  useEffect(() => {
    setActiveQuoteId(activeQuoteIdState);
  }, [activeQuoteIdState]);

  useEffect(() => {
    saveReminderSettings(reminderSettings);
  }, [reminderSettings]);

  // Daily reminder clock checker
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    let lastTriggeredDate = '';
    const interval = setInterval(() => {
      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = formatDateKey(now);

      if (currentHM === reminderSettings.time && lastTriggeredDate !== todayStr) {
        lastTriggeredDate = todayStr;
        playBellChime();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('🌿 晨露打卡 · 每日复盘时间', {
            body: reminderSettings.reminderText || '放下繁杂事务，今天你的学习任务打卡了吗？',
          });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [reminderSettings]);

  // Current active quote
  const activeQuote = quotes.find(q => q.id === activeQuoteIdState) || quotes[0] || {
    id: 'default',
    content: '日拱一卒，功不唐捐；积跬步，以至千里。',
    author: '自勉',
    isCustom: false,
  };

  const handleNextQuote = () => {
    if (quotes.length <= 1) return;
    const currentIndex = quotes.findIndex(q => q.id === activeQuoteIdState);
    const nextIndex = (currentIndex + 1) % quotes.length;
    setActiveQuoteIdState(quotes[nextIndex].id);
  };

  // Log update handler - strictly deduplicates by habitId + date
  const handleUpdateLog = (habitId: string, date: string, updates: Partial<HabitLog>) => {
    setLogs(prev => {
      const existing = prev.find(l => l.habitId === habitId && l.date === date);
      const remaining = prev.filter(l => !(l.habitId === habitId && l.date === date));
      const nextLog: HabitLog = existing
        ? {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : {
            id: `log-${date}-${habitId}-${Date.now()}`,
            habitId,
            date,
            completed: false,
            actualMinutes: 0,
            updatedAt: new Date().toISOString(),
            ...updates,
          };
      return [...remaining, nextLog];
    });
  };

  // Start focus mode from a habit card
  const handleStartFocus = (habitId: string) => {
    setFocusSelectedHabitId(habitId);
    setActiveTab('focus');
  };

  // When a focus session finishes, record minutes into today's log
  const handleFinishFocusSession = (habitId: string, minutes: number) => {
    const today = formatDateKey(new Date());
    const existing = logs.find(l => l.habitId === habitId && l.date === today);
    const currentMins = existing?.actualMinutes || 0;
    const targetMins = habits.find(h => h.id === habitId)?.targetMinutes || 45;
    const newMinutes = currentMins + minutes;
    const isCompleted = newMinutes >= targetMins ? true : (existing?.completed ?? false);

    handleUpdateLog(habitId, today, {
      actualMinutes: newMinutes,
      completed: isCompleted,
    });
  };

  // Save / Update Habit
  const handleSaveHabit = (habitData: Omit<HabitItem, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
      setHabits(prev =>
        prev.map(h => (h.id === id ? { ...h, ...habitData } : h))
      );
    } else {
      const newHabit: HabitItem = {
        ...habitData,
        id: `habit-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setHabits(prev => [...prev, newHabit]);
    }
  };

  // Delete Habit
  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  // Toggle Archive Habit
  const handleToggleArchiveHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, archived: !h.archived } : h))
    );
  };

  // Quotes management
  const handleAddQuote = (content: string, author?: string) => {
    const newQuote: MotivationalQuote = {
      id: `quote-${Date.now()}`,
      content,
      author,
      isCustom: true,
      category: 'custom',
    };
    setQuotes(prev => [newQuote, ...prev]);
    setActiveQuoteIdState(newQuote.id);
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    if (activeQuoteIdState === id) {
      setActiveQuoteIdState(quotes[0]?.id || '');
    }
  };

  // Open reflections
  const handleOpenReflection = (
    habitId: string,
    habitTitle: string,
    dateKey: string,
    currentNotes?: string
  ) => {
    setReflectionModal({
      isOpen: true,
      habitId,
      habitTitle,
      dateKey,
      notes: currentNotes || '',
    });
  };

  // Reset seed data
  const handleResetSeedData = () => {
    localStorage.clear();
    setHabits(INITIAL_HABITS);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800 flex flex-col font-sans">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewHabit={() => {
          setHabitToEdit(null);
          setIsHabitModalOpen(true);
        }}
        onOpenFocus={() => setActiveTab('focus')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-12">
        {activeTab === 'daily' && (
          <DailyCheckIn
            habits={habits}
            logs={logs}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onUpdateLog={handleUpdateLog}
            onOpenReflection={handleOpenReflection}
            onStartFocus={handleStartFocus}
            onOpenNewHabit={() => {
              setHabitToEdit(null);
              setIsHabitModalOpen(true);
            }}
            quotes={quotes}
            activeQuote={activeQuote}
            onNextQuote={handleNextQuote}
            onOpenMotivationModal={() => setIsMotivationModalOpen(true)}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReport
            habits={habits}
            logs={logs}
            onSelectDate={setSelectedDate}
            onNavigateToDaily={() => setActiveTab('daily')}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimer
            habits={habits}
            selectedHabitId={focusSelectedHabitId}
            onFinishSession={handleFinishFocusSession}
            activeQuote={activeQuote}
            onNextQuote={handleNextQuote}
          />
        )}

        {activeTab === 'manage' && (
          <HabitManagerView
            habits={habits}
            logs={logs}
            onOpenNewHabit={() => {
              setHabitToEdit(null);
              setIsHabitModalOpen(true);
            }}
            onEditHabit={habit => {
              setHabitToEdit(habit);
              setIsHabitModalOpen(true);
            }}
            onDeleteHabit={handleDeleteHabit}
            onToggleArchiveHabit={handleToggleArchiveHabit}
            onOpenMotivationModal={() => setIsMotivationModalOpen(true)}
            onImportData={data => {
              setHabits(data.habits);
              setLogs(data.logs);
            }}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Tab Bar (as per mobile thumb-zone ergonomics) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] transition-colors ${
            activeTab === 'daily' ? 'text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          <CheckSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">今日打卡</span>
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] transition-colors ${
            activeTab === 'weekly' ? 'text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">周报统计</span>
        </button>

        <button
          onClick={() => setActiveTab('focus')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] transition-colors ${
            activeTab === 'focus' ? 'text-emerald-700 font-bold' : 'text-stone-600'
          }`}
        >
          <Timer className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">专注番茄</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] transition-colors ${
            activeTab === 'manage' ? 'text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">项目管理</span>
        </button>
      </div>

      {/* Modals */}
      <HabitManagerModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
      />

      <MotivationModal
        isOpen={isMotivationModalOpen}
        onClose={() => setIsMotivationModalOpen(false)}
        quotes={quotes}
        activeQuoteId={activeQuoteIdState}
        onSelectQuote={setActiveQuoteIdState}
        onAddQuote={handleAddQuote}
        onDeleteQuote={handleDeleteQuote}
        reminderSettings={reminderSettings}
        onSaveReminderSettings={setReminderSettings}
      />

      <ReflectionModal
        isOpen={reflectionModal.isOpen}
        onClose={() => setReflectionModal(prev => ({ ...prev, isOpen: false }))}
        habitTitle={reflectionModal.habitTitle}
        dateKey={reflectionModal.dateKey}
        initialNotes={reflectionModal.notes}
        onSave={notes => {
          handleUpdateLog(reflectionModal.habitId, reflectionModal.dateKey, { notes });
        }}
      />
    </div>
  );
}
