import { HabitCategory, HabitItem, HabitLog, WeeklySummaryStats } from '../types';
import { formatDateKey, getDaysInWeek, getWeekRange } from './date';

export function calculateWeeklyStats(
  refDate: Date,
  habits: HabitItem[],
  logs: HabitLog[]
): WeeklySummaryStats {
  const week = getWeekRange(refDate);
  const weekDays = getDaysInWeek(week.start);
  const todayKey = formatDateKey(new Date());

  const activeHabits = habits.filter(h => !h.archived);
  const habitMap = new Map<string, HabitItem>();
  habits.forEach(h => habitMap.set(h.id, h));

  // Map logs by dateKey + habitId
  const logMap = new Map<string, HabitLog>();
  logs.forEach(log => {
    logMap.set(`${log.date}_${log.habitId}`, log);
  });

  let totalMinutes = 0;
  let totalTargetMetCount = 0;
  let possibleLogsCount = 0;

  const reflections: WeeklySummaryStats['reflections'] = [];

  // 1. Daily breakdown
  const dailyStats = weekDays.map(({ date, dateKey, dayLabel }) => {
    let dayMinutes = 0;
    let completedCount = 0;

    activeHabits.forEach(habit => {
      const log = logMap.get(`${dateKey}_${habit.id}`);
      possibleLogsCount++;
      if (log) {
        dayMinutes += log.actualMinutes || 0;
        if (log.completed) {
          completedCount++;
          totalTargetMetCount++;
        }
        if (log.notes && log.notes.trim()) {
          reflections.push({
            date: dateKey,
            habitTitle: habit.title,
            habitColor: habit.color,
            notes: log.notes.trim()
          });
        }
      }
    });

    totalMinutes += dayMinutes;

    return {
      date: dateKey,
      dayLabel,
      isToday: dateKey === todayKey,
      minutes: dayMinutes,
      completedCount,
      totalHabits: activeHabits.length
    };
  });

  // 2. Category distribution
  const categoryMinutesMap = new Map<HabitCategory, number>();
  activeHabits.forEach(h => {
    if (!categoryMinutesMap.has(h.category)) {
      categoryMinutesMap.set(h.category, 0);
    }
  });

  const categoryColors: Record<HabitCategory, string> = {
    '语言': '#10B981', // emerald
    '编程': '#0284C7', // sky
    '考研/考证': '#D97706', // amber
    '专业阅读': '#7C3AED', // violet
    '技能提升': '#E11D48', // rose
    '复盘/其他': '#0D9488', // teal
  };

  weekDays.forEach(({ dateKey }) => {
    activeHabits.forEach(habit => {
      const log = logMap.get(`${dateKey}_${habit.id}`);
      if (log && log.actualMinutes > 0) {
        const prev = categoryMinutesMap.get(habit.category) || 0;
        categoryMinutesMap.set(habit.category, prev + log.actualMinutes);
      }
    });
  });

  const categoryStats = Array.from(categoryMinutesMap.entries())
    .map(([category, minutes]) => {
      const percentage = totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0;
      return {
        category,
        minutes,
        percentage,
        color: categoryColors[category] || '#64748B'
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  // 3. Habit Breakdown
  const habitBreakdown = activeHabits.map(habit => {
    let habitTotalMinutes = 0;
    let daysCompleted = 0;
    let daysTargetMet = 0;

    weekDays.forEach(({ dateKey }) => {
      const log = logMap.get(`${dateKey}_${habit.id}`);
      if (log) {
        habitTotalMinutes += log.actualMinutes || 0;
        if (log.completed) daysCompleted++;
        if (log.actualMinutes >= habit.targetMinutes) daysTargetMet++;
      }
    });

    const rate = Math.round((daysCompleted / 7) * 100);

    return {
      habit,
      totalMinutes: habitTotalMinutes,
      daysCompleted,
      daysTargetMet,
      rate
    };
  }).sort((a, b) => b.totalMinutes - a.totalMinutes);

  // Completed days: days with at least 1 completed habit
  const completedDaysCount = dailyStats.filter(d => d.completedCount > 0).length;
  const overallCompletionRate = possibleLogsCount > 0
    ? Math.round((totalTargetMetCount / possibleLogsCount) * 100)
    : 0;

  return {
    weekStart: week.startKey,
    weekEnd: week.endKey,
    weekLabel: week.label,
    totalMinutes,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    dailyAvgMinutes: Math.round(totalMinutes / 7),
    completedDaysCount,
    overallCompletionRate,
    dailyStats,
    categoryStats,
    habitBreakdown,
    reflections: reflections.reverse() // latest first
  };
}

// Generate encouragement text based on performance
export function getWeeklyEditorialFeedback(stats: WeeklySummaryStats): string {
  if (stats.totalHours >= 15 && stats.overallCompletionRate >= 80) {
    return '本周保持了极高的自律节奏，沉浸专注时长充实，知识体系得到了扎实的稳固沉淀。下周继续保持这份心流与恒心！';
  } else if (stats.totalHours >= 8) {
    return '本周节奏稳中有进，核心重点科目均有持续推进。适时做一些复盘回顾，让学到的知识串联成面。';
  } else if (stats.totalMinutes > 0) {
    return '万事起头难，贵在坚持不辍。每天只要投入 30 分钟，日积月累就能形成惊人的复利效应。加油！';
  } else {
    return '新的一周，新的开始。挑选一个最想突破的学习目标，今天就开启第一个 25 分钟番茄钟吧！';
  }
}
