import React, { useState, useEffect } from 'react';
import { HabitCategory, HabitItem } from '../types';
import { HabitIcon, AVAILABLE_ICONS, COLOR_STYLES } from './HabitIcon';
import { X, Check, Trash2, Plus } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface HabitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: HabitItem | null;
  onSave: (habitData: Omit<HabitItem, 'id' | 'createdAt'>, id?: string) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: HabitCategory[] = [
  '语言',
  '编程',
  '考研/考证',
  '专业阅读',
  '技能提升',
  '复盘/其他',
];

const COLORS = [
  { id: 'emerald', label: '松石绿' },
  { id: 'sky', label: '天穹蓝' },
  { id: 'amber', label: '琥珀橙' },
  { id: 'violet', label: '沉香紫' },
  { id: 'rose', label: '山茶粉' },
  { id: 'teal', label: '青黛绿' },
  { id: 'indigo', label: '藏青蓝' },
];

export const HabitManagerModal: React.FC<HabitManagerModalProps> = ({
  isOpen,
  onClose,
  habitToEdit,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('编程');
  const [targetMinutes, setTargetMinutes] = useState(45);
  const [icon, setIcon] = useState('book-open');
  const [color, setColor] = useState('emerald');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setCategory(habitToEdit.category);
      setTargetMinutes(habitToEdit.targetMinutes);
      setIcon(habitToEdit.icon);
      setColor(habitToEdit.color);
      setDescription(habitToEdit.description || '');
    } else {
      setTitle('');
      setCategory('编程');
      setTargetMinutes(45);
      setIcon('code');
      setColor('emerald');
      setDescription('');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playTapSound();
    onSave(
      {
        title: title.trim(),
        category,
        targetMinutes: Math.max(5, targetMinutes),
        icon,
        color,
        description: description.trim(),
      },
      habitToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base">
            {habitToEdit ? '编辑学习打卡项目' : '新建学习打卡项目'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-left">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              项目名称 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：英语听力真题精听、LeetCode算法专项..."
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              科目类别
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    category === cat
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Minutes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              每日目标时长 (分钟)
            </label>
            <div className="flex items-center gap-2">
              {[25, 40, 45, 60, 90].map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setTargetMinutes(m)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono ${
                    targetMinutes === m
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {m}m
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="number"
                  min="5"
                  max="720"
                  value={targetMinutes}
                  onChange={e => setTargetMinutes(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs border border-stone-200 rounded-md font-mono text-center"
                />
                <span className="text-xs text-stone-500">分钟</span>
              </div>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              项目图标
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map(item => {
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIcon(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50 text-stone-900 shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <HabitIcon name={item.id} className="w-5 h-5 mb-1" />
                    <span className="text-[10px] truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              色彩标识
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map(c => {
                const style = COLOR_STYLES[c.id];
                const isSelected = color === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${style.accent} transition-transform ${
                      isSelected ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'opacity-85 hover:opacity-100'
                    }`}
                    title={c.label}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / tips */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              专注指南 / 备注 (可选)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="写下关于这个项目的要求，例如：每套做完必须精析错题..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          {habitToEdit && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`确定删除项目「${habitToEdit.title}」吗？`)) {
                  onDelete(habitToEdit.id);
                  onClose();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>删除项目</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition-colors"
            >
              {habitToEdit ? '保存修改' : '确认创建'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
