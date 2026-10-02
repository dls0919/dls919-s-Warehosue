import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { HabitItem, HabitLog, MotivationalQuote } from '../types';
import { formatDateKey, getSurroundingDays, getRelativeDateLabel, parseDateKey, getChineseDayName } from '../utils/date';
import { HabitIcon, COLOR_STYLES } from './HabitIcon';
import { playBellChime, playTapSound } from '../utils/sound';
import {
  Check,
  Plus,
  Timer,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Award,
  Clock,
  Quote,
} from 'lucide-react';

interface DailyCheckInProps {
  habits: HabitItem[];
  logs: HabitLog[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onUpdateLog: (habitId: string, date: string, updates: Partial<HabitLog>) => void;
  onOpenReflection: (habitId: string, habitTitle: string, date: string, currentNotes?: string) => void;
  onStartFocus: (habitId: string) => void;
  onOpenNewHabit: () => void;
  quotes: MotivationalQuote[];
  activeQuote: MotivationalQuote;
  onNextQuote: () => void;
  onOpenMotivationModal: () => void;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  habits,
  logs,
  selectedDate,
  onSelectDate,
  onUpdateLog,
  onOpenReflection,
  onStartFocus,
  onOpenNewHabit,
  activeQuote,
  onNextQuote,
  onOpenMotivationModal,
}) => {
  const [editingMinutesHabitId, setEditingMinutesHabitId] = useState<string | null>(null);
  const [customMinInput, setCustomMinInput] = useState<string>('');

  const todayKey = formatDateKey(new Date());
  const isToday = selectedDate === todayKey;
  const activeHabits = habits.filter(h => !h.archived);

  // Map of logs for the selected date
  const dayLogsMap = new Map<string, HabitLog>();
  logs.filter(l => l.date === selectedDate).forEach(l => {
    dayLogsMap.set(l.habitId, l);
  });

  // Calculate day summary
  let dayTotalMinutes = 0;
  let dayCompletedCount = 0;
  let targetTotalMinutes = 0;

  activeHabits.forEach(h => {
    targetTotalMinutes += h.targetMinutes;
    const l = dayLogsMap.get(h.id);
    if (l) {
      dayTotalMinutes += l.actualMinutes || 0;
      if (l.completed) {
        dayCompletedCount++;
      }
    }
  });

  const completionPercent = targetTotalMinutes > 0
    ? Math.min(100, Math.round((dayTotalMinutes / targetTotalMinutes) * 100))
    : 0;

  // Toggle habit completed
  const handleToggleComplete = (habit: HabitItem) => {
    const existing = dayLogsMap.get(habit.id);
    const currentlyDone = Boolean(
      existing?.completed ||
      (existing && existing.actualMinutes > 0 && existing.actualMinutes >= habit.targetMinutes)
    );
    const willBeCompleted = !currentlyDone;

    // If completing, set minutes to at least targetMinutes; if unchecking, reset minutes to 0
    let nextMinutes = existing?.actualMinutes || 0;
    if (willBeCompleted) {
      nextMinutes = Math.max(nextMinutes, habit.targetMinutes);
    } else {
      nextMinutes = 0;
    }

    onUpdateLog(habit.id, selectedDate, {
      completed: willBeCompleted,
      actualMinutes: nextMinutes,
    });

    if (willBeCompleted) {
      playBellChime();
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.75 },
          colors: ['#10B981', '#059669', '#34D399', '#FBBF24'],
        });
      } catch {
        // ignore
      }
    } else {
      playTapSound();
    }
  };

  // Quick adjust minutes (+15m, +30m, etc.)
  const handleAddMinutes = (habitId: string, addMin: number) => {
    playTapSound();
    const existing = dayLogsMap.get(habitId);
    const habit = habits.find(h => h.id === habitId);
    const current = existing?.actualMinutes || 0;
    const newMinutes = Math.max(0, current + addMin);
    const target = habit?.targetMinutes || 45;

    onUpdateLog(habitId, selectedDate, {
      actualMinutes: newMinutes,
      completed: newMinutes >= target ? true : existing?.completed ?? false,
    });
  };

  // Custom minutes submit
  const handleCustomMinutesSubmit = (habitId: string) => {
    const val = parseInt(customMinInput, 10);
    if (!isNaN(val) && val >= 0) {
      playTapSound();
      const existing = dayLogsMap.get(habitId);
      const habit = habits.find(h => h.id === habitId);
      const target = habit?.targetMinutes || 45;
      onUpdateLog(habitId, selectedDate, {
        actualMinutes: val,
        completed: val >= target ? true : (val === 0 ? false : existing?.completed ?? false),
      });
    }
    setEditingMinutesHabitId(null);
    setCustomMinInput('');
  };

  // Date scroller calculations
  const centerDate = parseDateKey(selectedDate);
  const surroundingDays = getSurroundingDays(centerDate, 7);

  const handlePrevDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() - 1);
    onSelectDate(formatDateKey(d));
  };

  const handleNextDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + 1);
    onSelectDate(formatDateKey(d));
  };

  return (
    <div className="space-y-6">
      {/* 1. Motivational Banner */}
      <section className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden transition-all">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800 shrink-0 mt-0.5">
              <Quote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-900 leading-relaxed font-serif">
                “{activeQuote.content}”
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-600">
                <span>{activeQuote.author || '心流自励'}</span>
                {activeQuote.isCustom && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-medium">我的自订寄语</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <button
              onClick={onNextQuote}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors whitespace-nowrap"
              title="切换下一句鼓励"
            >
              <RefreshCw className="w-3 h-3" />
              <span>换一句</span>
            </button>
            <button
              onClick={onOpenMotivationModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              <span>励志语录 & 提醒</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Date Navigation Carousel */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900">
              {getRelativeDateLabel(selectedDate)}
            </h2>
            <span className="text-xs text-stone-600">
              {getChineseDayName(parseDateKey(selectedDate))}
            </span>
            {!isToday && (
              <button
                onClick={() => onSelectDate(todayKey)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2 ml-1"
              >
                回到今天
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="前一天"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="后一天"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Quick Strip */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {surroundingDays.map(item => {
            const isSelected = item.key === selectedDate;
            const hasLogForDay = logs.some(l => l.date === item.key && (l.actualMinutes > 0 || l.completed));
            const allDayCompleted = habits.length > 0 && activeHabits.every(h => {
              const l = logs.find(log => log.date === item.key && log.habitId === h.id);
              return l?.completed;
            });

            return (
              <button
                key={item.key}
                onClick={() => onSelectDate(item.key)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
              >
                <span className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                  {item.dayName.replace('周', '')}
                </span>
                <span className="text-sm font-semibold font-mono tabular-nums mt-0.5">
                  {item.label.split('/')[1]}
                </span>
                <div className="h-1.5 mt-1 flex items-center justify-center">
                  {allDayCompleted ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  ) : hasLogForDay ? (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-stone-300' : 'bg-stone-400'}`} />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Daily Summary Metrics Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 shadow-xs">
          <div className="text-xs text-stone-600">已专注时长</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-stone-900">
              {dayTotalMinutes}
            </span>
            <span className="text-xs text-stone-600">/ {targetTotalMinutes} 分钟</span>
          </div>
          <div className="mt-2 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 shadow-xs">
          <div className="text-xs text-stone-600">打卡完成项目</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-stone-900">
              {dayCompletedCount}
            </span>
            <span className="text-xs text-stone-600">/ {activeHabits.length} 项</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-600">
            <span>达成率</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-700">
              {activeHabits.length > 0 ? Math.round((dayCompletedCount / activeHabits.length) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-stone-600">今日专注状态</div>
          <div className="flex items-center gap-1.5">
            {dayCompletedCount === activeHabits.length && activeHabits.length > 0 ? (
              <span className="text-emerald-700 text-sm font-semibold flex items-center gap-1">
                <Award className="w-4 h-4" /> 全员达标！
              </span>
            ) : dayTotalMinutes > 0 ? (
              <span className="text-stone-800 text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-600" /> 专注推进中
              </span>
            ) : (
              <span className="text-stone-600 text-sm">等待开启今天打卡</span>
            )}
          </div>
          <div className="text-[11px] text-stone-600">
            {isToday ? '记录真实成长' : '历史回溯模式'}
          </div>
        </div>
      </div>

      {/* 4. Habit Check-in List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-stone-900">
            学习打卡项目 ({activeHabits.length})
          </h3>
          <button
            onClick={onOpenNewHabit}
            className="text-xs text-stone-700 hover:text-stone-900 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加项目</span>
          </button>
        </div>

        {activeHabits.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-8 text-center">
            <p className="text-sm text-stone-600 mb-3">
              当前暂无正在进行的打卡项目，定制你的每日学习计划吧！
            </p>
            <button
              onClick={onOpenNewHabit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建第一个打卡项目</span>
            </button>
          </div>
        ) : (
          activeHabits.map(habit => {
            const log = dayLogsMap.get(habit.id);
            const isDone = Boolean(
              log?.completed ||
              (log && log.actualMinutes > 0 && log.actualMinutes >= habit.targetMinutes)
            );
            const actualMinutes = log?.actualMinutes || 0;
            const hasNotes = !!log?.notes?.trim();
            const colorMeta = COLOR_STYLES[habit.color] || COLOR_STYLES.emerald;
            const isEditingMin = editingMinutesHabitId === habit.id;

            return (
              <div
                key={habit.id}
                className={`bg-white border rounded-2xl p-4 sm:p-4.5 transition-all shadow-xs ${
                  isDone
                    ? 'border-emerald-200/90 bg-emerald-50/20'
                    : 'border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start sm:items-center justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Big tactile check button */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(habit)}
                      className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/20'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-400 border border-stone-200/80 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                      aria-label={isDone ? '已完成打卡，点击取消' : '点击打卡完成'}
                      title={isDone ? '已完成打卡，点击取消' : '点击打卡完成'}
                    >
                      <Check className={`w-5 h-5 transition-transform ${isDone ? 'scale-100 text-white stroke-[2.5]' : 'scale-90 opacity-40 text-stone-400 stroke-2'}`} />
                    </button>

                    {/* Habit Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${colorMeta.bg} ${colorMeta.text}`}>
                          <HabitIcon name={habit.icon} className="w-4 h-4" />
                        </div>
                        <h4 className={`text-base font-semibold truncate ${isDone ? 'text-stone-800' : 'text-stone-900'}`}>
                          {habit.title}
                        </h4>
                      </div>

                      {/* Clean unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                        <span>{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>目标 {habit.targetMinutes} 分钟</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-mono tabular-nums ${actualMinutes >= habit.targetMinutes ? 'text-emerald-700 font-semibold' : 'text-stone-700'}`}>
                          已学 {actualMinutes} 分钟
                        </span>
                      </div>

                      {habit.description && (
                        <p className="text-xs text-stone-600 mt-1 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Minute Adjusters & Actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {/* Minute quick buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAddMinutes(habit.id, 15)}
                        className="px-2 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                        title="增加15分钟"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => handleAddMinutes(habit.id, 30)}
                        className="px-2 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                        title="增加30分钟"
                      >
                        +30m
                      </button>
                      <button
                        onClick={() => {
                          setEditingMinutesHabitId(isEditingMin ? null : habit.id);
                          setCustomMinInput(String(actualMinutes));
                        }}
                        className="px-2 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
                        title="修改具体时长"
                      >
                        设置
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Reflection button */}
                      <button
                        onClick={() => onOpenReflection(habit.id, habit.title, selectedDate, log?.notes)}
                        className={`p-2 rounded-lg border transition-colors ${
                          hasNotes
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                        title={hasNotes ? '查看/编辑学习心得' : '添加今日学习心得'}
                        aria-label="学习心得"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Focus button */}
                      <button
                        onClick={() => onStartFocus(habit.id)}
                        className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100 transition-colors"
                        title="带入番茄钟开启深度专注"
                        aria-label="专注"
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline custom minute input if toggled */}
                {isEditingMin && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <span className="text-xs text-stone-600">手动指定学习时长：</span>
                    <input
                      type="number"
                      min="0"
                      max="1440"
                      value={customMinInput}
                      onChange={e => setCustomMinInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCustomMinutesSubmit(habit.id)}
                      className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-stone-900 font-mono"
                      placeholder="分钟数"
                      autoFocus
                    />
                    <span className="text-xs text-stone-600">分钟</span>
                    <button
                      onClick={() => handleCustomMinutesSubmit(habit.id)}
                      className="px-2.5 py-1 text-xs font-medium bg-stone-900 text-white rounded-md hover:bg-stone-800"
                    >
                      确定
                    </button>
                    <button
                      onClick={() => setEditingMinutesHabitId(null)}
                      className="px-2 py-1 text-xs text-stone-600 hover:text-stone-800"
                    >
                      取消
                    </button>
                  </div>
                )}

                {/* Inline reflection excerpt preview if user wrote notes */}
                {hasNotes && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-start gap-2">
                    <span className="text-xs text-amber-700 font-medium shrink-0">学习笔记：</span>
                    <p className="text-xs text-stone-700 line-clamp-2 italic">
                      "{log?.notes}"
                    </p>
                    <button
                      onClick={() => onOpenReflection(habit.id, habit.title, selectedDate, log?.notes)}
                      className="text-[11px] text-stone-600 hover:text-stone-900 ml-auto shrink-0"
                    >
                      编辑
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
