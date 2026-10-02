export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getChineseDayName(date: Date): string {
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return dayNames[date.getDay()];
}

export function getChineseShortDate(key: string): string {
  const date = parseDateKey(key);
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayName = getChineseDayName(date);
  return `${m}月${d}日 ${dayName}`;
}

export function getRelativeDateLabel(key: string): string {
  const todayKey = formatDateKey(new Date());
  if (key === todayKey) return '今天';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === formatDateKey(yesterday)) return '昨天';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (key === formatDateKey(tomorrow)) return '明天';

  return getChineseShortDate(key);
}

// Get Monday - Sunday for the given date's week
export function getWeekRange(refDate: Date): { start: Date; end: Date; startKey: string; endKey: string; label: string } {
  const d = new Date(refDate);
  const day = d.getDay();
  // Monday is 1, Sunday is 0 -> adjust so Monday is first day of week
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const startKey = formatDateKey(monday);
  const endKey = formatDateKey(sunday);

  const m1 = monday.getMonth() + 1;
  const d1 = monday.getDate();
  const m2 = sunday.getMonth() + 1;
  const d2 = sunday.getDate();

  return {
    start: monday,
    end: sunday,
    startKey,
    endKey,
    label: `${m1}月${d1}日 - ${m2}月${d2}日`
  };
}

export function getDaysInWeek(monday: Date): { date: Date; dateKey: string; dayLabel: string; shortDay: string }[] {
  const result = [];
  const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    result.push({
      date: cur,
      dateKey: formatDateKey(cur),
      dayLabel: dayLabels[i],
      shortDay: dayLabels[i].replace('周', '')
    });
  }
  return result;
}

export function getSurroundingDays(centerDate: Date, count: number = 7): { date: Date; key: string; label: string; dayName: string; isToday: boolean }[] {
  const days = [];
  const todayKey = formatDateKey(new Date());
  const half = Math.floor(count / 2);

  for (let i = -half; i <= half; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    const key = formatDateKey(d);
    days.push({
      date: d,
      key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dayName: getChineseDayName(d),
      isToday: key === todayKey
    });
  }
  return days;
}
