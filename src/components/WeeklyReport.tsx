import React, { useState } from 'react';
import { HabitItem, HabitLog, WeeklySummaryStats } from '../types';
import { calculateWeeklyStats, getWeeklyEditorialFeedback } from '../utils/reportCalculator';
import { getWeekRange, formatDateKey } from '../utils/date';
import { HabitIcon, COLOR_STYLES } from './HabitIcon';
import { WeeklyReportExportModal } from './WeeklyReportExportModal';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileText,
  Target,
} from 'lucide-react';

interface WeeklyReportProps {
  habits: HabitItem[];
  logs: HabitLog[];
  onSelectDate: (date: string) => void;
  onNavigateToDaily: () => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  habits,
  logs,
  onSelectDate,
  onNavigateToDaily,
}) => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Compute reference date based on offset weeks
  const refDate = new Date();
  refDate.setDate(refDate.getDate() + currentWeekOffset * 7);

  const stats: WeeklySummaryStats = calculateWeeklyStats(refDate, habits, logs);
  const editorialFeedback = getWeeklyEditorialFeedback(stats);

  const isCurrentWeek = currentWeekOffset === 0;

  const handlePrevWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const handleNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const handleResetToCurrent = () => setCurrentWeekOffset(0);

  const maxMinutesInDay = Math.max(...stats.dailyStats.map(d => d.minutes), 60);

  return (
    <div className="space-y-6">
      {/* 1. Header & Week Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900">
              学习周报统计
            </h2>
            <span className="text-xs text-stone-600 font-medium">
              {stats.weekLabel}
            </span>
            {isCurrentWeek && (
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                本周
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            每周自动汇总学习时长、打卡达成率与复盘笔记
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={handlePrevWeek}
              className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
              title="上一周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {!isCurrentWeek && (
              <button
                onClick={handleResetToCurrent}
                className="px-2 py-0.5 text-xs text-stone-700 hover:text-stone-900 font-medium hover:bg-white rounded-md transition-colors"
              >
                回到本周
              </button>
            )}
            <button
              onClick={handleNextWeek}
              className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
              title="下一周"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>生成分享海报</span>
          </button>
        </div>
      </div>

      {/* 2. Four Core Weekly KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">本周总专注</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900">
              {stats.totalHours}
            </span>
            <span className="text-xs text-stone-600">小时</span>
          </div>
          <div className="text-[11px] text-stone-600 mt-1 font-mono tabular-nums">
            共 {stats.totalMinutes} 分钟专注投入
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">综合打卡达标率</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900">
              {stats.overallCompletionRate}
            </span>
            <span className="text-xs text-stone-600">%</span>
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            7天内有打卡 {stats.completedDaysCount} 天
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">日均专注时长</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900">
              {stats.dailyAvgMinutes}
            </span>
            <span className="text-xs text-stone-600">分钟/天</span>
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            折合 {(stats.dailyAvgMinutes / 60).toFixed(1)} 小时/天
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-600">打卡推进项目</span>
            <Target className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900">
              {stats.habitBreakdown.filter(h => h.totalMinutes > 0).length}
            </span>
            <span className="text-xs text-stone-600">/ {habits.filter(h => !h.archived).length} 项</span>
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            {stats.reflections.length} 条心得记录
          </div>
        </div>
      </div>

      {/* 3. Weekly Activity Bar Chart */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              每日学习时长趋势 (周一 至 周日)
            </h3>
            <p className="text-xs text-stone-600">
              点击柱状图可快速跳转至对应日期查看详细打卡与心得
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-6 pb-2">
          {stats.dailyStats.map(d => {
            const barHeightPercent = Math.max(8, Math.min(100, (d.minutes / maxMinutesInDay) * 100));
            const isCompletedAll = d.completedCount > 0 && d.completedCount >= d.totalHabits;

            return (
              <button
                key={d.date}
                onClick={() => {
                  onSelectDate(d.date);
                  onNavigateToDaily();
                }}
                className="group flex flex-col items-center focus:outline-hidden"
              >
                {/* Minute Label above bar */}
                <span className={`text-[11px] font-mono tabular-nums font-semibold mb-1.5 transition-colors ${
                  d.minutes > 0 ? 'text-stone-700 group-hover:text-emerald-700' : 'text-stone-300'
                }`}>
                  {d.minutes > 0 ? `${d.minutes}m` : '0m'}
                </span>

                {/* Bar track container */}
                <div className="w-full max-w-[42px] h-36 bg-stone-100 rounded-xl relative flex flex-col justify-end p-1 overflow-hidden group-hover:bg-stone-200/70 transition-colors">
                  <div
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isCompletedAll
                        ? 'bg-emerald-600 group-hover:bg-emerald-700'
                        : d.minutes > 0
                        ? 'bg-emerald-500/80 group-hover:bg-emerald-600'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${barHeightPercent}%` }}
                  />
                </div>

                {/* Day of week & date label */}
                <span className={`text-xs font-medium mt-2 ${
                  d.isToday ? 'text-emerald-700 font-bold' : 'text-stone-600'
                }`}>
                  {d.dayLabel}
                </span>
                <span className="text-[10px] text-stone-600 font-mono">
                  {d.date.slice(5).replace('-', '/')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Time Distribution */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-3">
          科目类型投入分布
        </h3>

        {/* Stacked bar */}
        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
          {stats.categoryStats.map(cat => (
            <div
              key={cat.category}
              className="h-full transition-all duration-300"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.category}: ${cat.minutes}分钟 (${cat.percentage}%)`}
            />
          ))}
        </div>

        {/* Clean unboxed categories metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {stats.categoryStats.map(cat => (
            <div key={cat.category} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="min-w-0">
                <div className="text-xs font-medium text-stone-800 truncate">
                  {cat.category}
                </div>
                <div className="text-[11px] text-stone-600 font-mono tabular-nums">
                  {(cat.minutes / 60).toFixed(1)}h ({cat.percentage}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Habit Detailed Ranking Matrix */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-stone-900 mb-3">
          项目打卡详情榜
        </h3>

        <div className="divide-y divide-stone-100">
          {stats.habitBreakdown.map((item, index) => {
            const colorMeta = COLOR_STYLES[item.habit.color] || COLOR_STYLES.emerald;
            const targetWeeklyMinutes = item.habit.targetMinutes * 7;
            const progressPercent = Math.min(100, Math.round((item.totalMinutes / targetWeeklyMinutes) * 100));

            return (
              <div key={item.habit.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-semibold text-stone-600 w-4 text-center">
                    {index + 1}
                  </span>
                  <div className={`p-1.5 rounded-lg ${colorMeta.bg} ${colorMeta.text} shrink-0`}>
                    <HabitIcon name={item.habit.icon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-stone-900 truncate">
                      {item.habit.title}
                    </div>
                    {/* Clean unboxed metadata */}
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <span>{item.habit.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>达标 {item.daysCompleted}/7 天</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="w-24 hidden sm:block">
                    <div className="text-[10px] text-stone-600 mb-1">
                      目标进度 {progressPercent}%
                    </div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono tabular-nums text-stone-900">
                      {(item.totalMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-stone-600">小时</span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-mono tabular-nums">
                      {item.totalMinutes} 分钟
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Weekly Reflections Wall */}
      {stats.reflections.length > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>本周学习复盘与心得 ({stats.reflections.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.reflections.map((r, idx) => (
              <div
                key={idx}
                className="bg-stone-50 border border-stone-200/70 rounded-xl p-3.5 hover:bg-stone-50/80 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                  <span className="font-semibold text-emerald-800">
                    [{r.habitTitle}]
                  </span>
                  <span className="font-mono tabular-nums">
                    {r.date}
                  </span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-serif">
                  {r.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Thoughtful Editorial Review & Encouragement Card */}
      <section className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
              导师自勉评语
            </h4>
            <p className="text-sm text-stone-800 mt-1 leading-relaxed font-serif">
              {editorialFeedback}
            </p>
          </div>
        </div>
      </section>

      {/* Modal for sharing card */}
      <WeeklyReportExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stats={stats}
        feedback={editorialFeedback}
      />
    </div>
  );
};
