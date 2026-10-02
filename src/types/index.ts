export type HabitCategory = '语言' | '编程' | '考研/考证' | '专业阅读' | '技能提升' | '复盘/其他';

export interface HabitItem {
  id: string;
  title: string;
  category: HabitCategory;
  targetMinutes: number; // e.g. 45
  unitName?: string; // '分钟' | '页' | '题'
  icon: string; // lucide icon identifier
  color: string; // emerald, sky, amber, violet, rose, teal, indigo
  description?: string;
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  actualMinutes: number;
  notes?: string;
  updatedAt: string;
}

export interface MotivationalQuote {
  id: string;
  content: string;
  author?: string;
  isCustom: boolean;
  category?: 'focus' | 'persistence' | 'growth' | 'custom';
}

export interface WeeklySummaryStats {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  weekLabel: string;
  totalMinutes: number;
  totalHours: number;
  dailyAvgMinutes: number;
  completedDaysCount: number;
  overallCompletionRate: number; // 0 - 100
  dailyStats: {
    date: string;
    dayLabel: string;
    isToday: boolean;
    minutes: number;
    completedCount: number;
    totalHabits: number;
  }[];
  categoryStats: {
    category: HabitCategory;
    minutes: number;
    percentage: number;
    color: string;
  }[];
  habitBreakdown: {
    habit: HabitItem;
    totalMinutes: number;
    daysCompleted: number;
    daysTargetMet: number;
    rate: number;
  }[];
  reflections: {
    date: string;
    habitTitle: string;
    habitColor: string;
    notes: string;
  }[];
}

export type ActiveTab = 'daily' | 'weekly' | 'focus' | 'manage';
