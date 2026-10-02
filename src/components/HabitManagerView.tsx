import React, { useRef } from 'react';
import { HabitItem, HabitLog } from '../types';
import { HabitIcon, COLOR_STYLES } from './HabitIcon';
import { Plus, Edit2, Trash2, Archive, Download, Upload, RotateCcw, Sparkles } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface HabitManagerViewProps {
  habits: HabitItem[];
  logs: HabitLog[];
  onOpenNewHabit: () => void;
  onEditHabit: (habit: HabitItem) => void;
  onDeleteHabit: (id: string) => void;
  onToggleArchiveHabit: (id: string) => void;
  onOpenMotivationModal: () => void;
  onImportData: (data: { habits: HabitItem[]; logs: HabitLog[] }) => void;
  onResetSeedData: () => void;
}

export const HabitManagerView: React.FC<HabitManagerViewProps> = ({
  habits,
  logs,
  onOpenNewHabit,
  onEditHabit,
  onDeleteHabit,
  onToggleArchiveHabit,
  onOpenMotivationModal,
  onImportData,
  onResetSeedData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);

  const handleExportJSON = () => {
    playTapSound();
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      habits,
      logs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `晨露打卡备份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.habits && Array.isArray(json.habits)) {
          onImportData({
            habits: json.habits,
            logs: json.logs || [],
          });
          alert('数据导入成功！');
        } else {
          alert('导入文件格式不正确，缺少 habits 字段');
        }
      } catch {
        alert('解析 JSON 失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900">
            打卡项目与偏好管理
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            自由自定义你的学习科目、每日目标时长、图标色彩与数据备份
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMotivationModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>激励语录 & 提醒设置</span>
          </button>
          <button
            onClick={onOpenNewHabit}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建项目</span>
          </button>
        </div>
      </div>

      {/* Active Habits list */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-stone-900">
            当前进行中的项目 ({activeHabits.length})
          </h3>
        </div>

        {activeHabits.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            暂无进行中的打卡项目，点击上方「新建项目」开始
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {activeHabits.map(habit => {
              const colorMeta = COLOR_STYLES[habit.color] || COLOR_STYLES.emerald;
              const habitLogs = logs.filter(l => l.habitId === habit.id);
              const totalMins = habitLogs.reduce((acc, cur) => acc + (cur.actualMinutes || 0), 0);
              const totalDays = habitLogs.filter(l => l.completed).length;

              return (
                <div key={habit.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-xl ${colorMeta.bg} ${colorMeta.text} shrink-0`}>
                      <HabitIcon name={habit.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {habit.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span>{habit.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>目标 {habit.targetMinutes} 分钟/天</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">累计打卡 {totalDays} 天 ({(totalMins / 60).toFixed(1)}小时)</span>
                      </div>
                      {habit.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="编辑项目"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleArchiveHabit(habit.id)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="归档此项目"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要彻底删除打卡项目「${habit.title}」吗？`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="删除项目"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Archived Habits if any */}
      {archivedHabits.length > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-stone-500 mb-3">
            已归档的项目 ({archivedHabits.length})
          </h3>
          <div className="divide-y divide-stone-100">
            {archivedHabits.map(habit => (
              <div key={habit.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">{habit.title} ({habit.category})</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleArchiveHabit(habit.id)}
                    className="text-emerald-700 hover:text-emerald-800 font-medium"
                  >
                    恢复使用
                  </button>
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management & Backup */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900">
          学习数据管理与备份
        </h3>
        <p className="text-xs text-stone-500">
          所有打卡记录与周报数据均安全持久化保存在当前浏览器本地。你可以随时导出备份文件，或在更换设备时导入。
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出备份 (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入备份</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('确定要恢复默认预设打卡项目和演示周报记录吗？')) {
                onResetSeedData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为示例数据</span>
          </button>
        </div>
      </div>
    </div>
  );
};
