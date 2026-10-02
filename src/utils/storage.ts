import { HabitItem, HabitLog, MotivationalQuote } from '../types';
import { formatDateKey, getWeekRange } from './date';

const STORAGE_KEYS = {
  HABITS: 'study_habits_list_v1',
  LOGS: 'study_habit_logs_v1',
  QUOTES: 'study_motivational_quotes_v1',
  ACTIVE_QUOTE_ID: 'study_active_quote_id_v1',
  REMINDER_SETTINGS: 'study_reminder_settings_v1',
};

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'habit-1',
    title: '英语听力与真题精析',
    category: '语言',
    targetMinutes: 45,
    unitName: '分钟',
    icon: 'headphones',
    color: 'emerald',
    description: '练习真题精听与长难句复述，磨练语感与反应速度',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    title: '算法刷题与数据结构',
    category: '编程',
    targetMinutes: 60,
    unitName: '分钟',
    icon: 'code',
    color: 'sky',
    description: '深入理解双指针、动态规划与图论，独立手写AC',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    title: '核心专业书深度精读',
    category: '专业阅读',
    targetMinutes: 40,
    unitName: '分钟',
    icon: 'book-open',
    color: 'violet',
    description: '精读经典著作章节，提炼核心概念图谱',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-4',
    title: '晚间学习复盘与笔记整理',
    category: '复盘/其他',
    targetMinutes: 25,
    unitName: '分钟',
    icon: 'pen-tool',
    color: 'amber',
    description: '回顾今日重点难点，总结易错点并制定明日计划',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_QUOTES: MotivationalQuote[] = [
  {
    id: 'quote-1',
    content: '日拱一卒，功不唐捐；积跬步，以至千里。',
    author: '胡适',
    isCustom: false,
    category: 'persistence',
  },
  {
    id: 'quote-2',
    content: '专注当下的呼吸与眼前这一页，浮躁与焦虑自会退散。',
    author: '心流法则',
    isCustom: false,
    category: 'focus',
  },
  {
    id: 'quote-3',
    content: '每一个不曾起舞的日子，都是对生命的辜负。',
    author: '尼采',
    isCustom: false,
    category: 'growth',
  },
  {
    id: 'quote-4',
    content: '行动是治愈焦虑最好的良药，先全身心专注做五分钟试试。',
    author: '知行合一',
    isCustom: false,
    category: 'focus',
  },
  {
    id: 'quote-5',
    content: '不为模糊不清的未来担忧，只为清清楚楚的现在努力。',
    author: '卡耐基',
    isCustom: false,
    category: 'persistence',
  },
  {
    id: 'quote-6',
    content: '流水不争先，争的是滔滔不绝。保持自己的节奏。',
    author: '古箴',
    isCustom: false,
    category: 'growth',
  },
];

// Generate sample past logs for the current week so charts and weekly summary look rich and realistic
function generateSeedLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = new Date();
  const todayStr = formatDateKey(now);
  const week = getWeekRange(now);
  const sampleReflections = [
    '今天搞懂了动态规划的状态转移方程，边界条件终于不再漏写！',
    '听力 Section 3 连续弱读抓到了7处，准确率明显提升到 90%。',
    '精读了第4章分布式锁机制，对 Redis Redlock 的权衡理解更透彻了。',
    '晚间复盘：今天完成了所有预定计划，明天继续保持深度专注。',
    '做题时有些疲倦，用25分钟番茄钟调整状态后效率大幅恢复。',
  ];

  // Fill logs from Monday strictly up to yesterday (exclude todayStr)
  const cur = new Date(week.start);
  let refIdx = 0;
  while (formatDateKey(cur) < todayStr) {
    const dateStr = formatDateKey(cur);
    const dayOfWeek = cur.getDay(); // 0 is Sun, 1 is Mon...

    // Some habits done on earlier days
    INITIAL_HABITS.forEach((h, idx) => {
      // 85% chance done
      const isDone = (dayOfWeek + idx) % 5 !== 0;
      const actual = isDone ? Math.round(h.targetMinutes * (0.9 + (Math.random() * 0.3))) : Math.round(h.targetMinutes * 0.4);
      logs.push({
        id: `seed-log-${dateStr}-${h.id}`,
        habitId: h.id,
        date: dateStr,
        completed: isDone,
        actualMinutes: actual,
        notes: isDone && Math.random() > 0.4 ? sampleReflections[(refIdx++) % sampleReflections.length] : undefined,
        updatedAt: cur.toISOString(),
      });
    });

    cur.setDate(cur.getDate() + 1);
  }

  // Today initial logs (only 1 entry per habit)
  INITIAL_HABITS.forEach((h, idx) => {
    if (idx === 0) {
      logs.push({
        id: `seed-log-${todayStr}-${h.id}`,
        habitId: h.id,
        date: todayStr,
        completed: true,
        actualMinutes: h.targetMinutes,
        notes: '早晨完成真题听力，状态极佳！',
        updatedAt: now.toISOString(),
      });
    } else if (idx === 1) {
      logs.push({
        id: `seed-log-${todayStr}-${h.id}`,
        habitId: h.id,
        date: todayStr,
        completed: false,
        actualMinutes: 30,
        updatedAt: now.toISOString(),
      });
    }
  });

  return logs;
}

export function loadHabits(): HabitItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(INITIAL_HABITS));
      return INITIAL_HABITS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HABITS;
  }
}

export function saveHabits(habits: HabitItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits', e);
  }
}

export function loadLogs(): HabitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    let parsed: HabitLog[];
    if (!raw) {
      parsed = generateSeedLogs();
    } else {
      parsed = JSON.parse(raw);
    }

    // Deduplicate any logs that might share the same (date + habitId)
    const uniqueMap = new Map<string, HabitLog>();
    parsed.forEach(log => {
      const key = `${log.date}_${log.habitId}`;
      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, log);
      } else {
        // Merge duplicates cleanly
        uniqueMap.set(key, {
          ...existing,
          ...log,
          completed: log.completed || existing.completed,
          actualMinutes: Math.max(log.actualMinutes || 0, existing.actualMinutes || 0),
          notes: log.notes || existing.notes,
        });
      }
    });

    const result = Array.from(uniqueMap.values());
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(result));
    return result;
  } catch {
    return [];
  }
}

export function saveLogs(logs: HabitLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs', e);
  }
}

export function loadQuotes(): MotivationalQuote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUOTES;
  }
}

export function saveQuotes(quotes: MotivationalQuote[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes', e);
  }
}

export function getActiveQuoteId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_QUOTE_ID) || 'quote-1';
  } catch {
    return 'quote-1';
  }
}

export function setActiveQuoteId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_QUOTE_ID, id);
  } catch {
    // ignore
  }
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "20:30"
  reminderText: string;
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    enabled: false,
    time: '21:00',
    reminderText: '今天的学习打卡完成了没？静下心来复盘一下今天的收获吧！',
  };
}

export function saveReminderSettings(settings: ReminderSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
