import React from 'react';
import {
  Headphones,
  Code,
  BookOpen,
  PenTool,
  Dumbbell,
  Flame,
  Target,
  Coffee,
  Brain,
  Sparkles,
  GraduationCap,
  FileText,
  Clock,
  Compass,
  Laptop,
} from 'lucide-react';

interface HabitIconProps {
  name: string;
  className?: string;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'headphones':
      return <Headphones className={className} />;
    case 'code':
      return <Code className={className} />;
    case 'book-open':
      return <BookOpen className={className} />;
    case 'pen-tool':
      return <PenTool className={className} />;
    case 'dumbbell':
      return <Dumbbell className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'target':
      return <Target className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'graduation-cap':
      return <GraduationCap className={className} />;
    case 'file-text':
      return <FileText className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
};

export const AVAILABLE_ICONS = [
  { id: 'headphones', label: '听力/音频' },
  { id: 'code', label: '代码/编程' },
  { id: 'book-open', label: '阅读/书籍' },
  { id: 'pen-tool', label: '写作/复盘' },
  { id: 'graduation-cap', label: '考试/学术' },
  { id: 'brain', label: '思考/认知' },
  { id: 'target', label: '目标/专项' },
  { id: 'file-text', label: '论文/笔记' },
  { id: 'laptop', label: '网课/实验' },
  { id: 'coffee', label: '晨间/习惯' },
  { id: 'flame', label: '攻坚/冲刺' },
  { id: 'dumbbell', label: '体能/健康' },
];

export const COLOR_STYLES: Record<string, { bg: string; text: string; border: string; accent: string; ring: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: 'bg-emerald-600',
    ring: 'ring-emerald-500',
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: 'bg-sky-600',
    ring: 'ring-sky-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    accent: 'bg-amber-600',
    ring: 'ring-amber-500',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    accent: 'bg-violet-600',
    ring: 'ring-violet-500',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: 'bg-rose-600',
    ring: 'ring-rose-500',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    accent: 'bg-teal-600',
    ring: 'ring-teal-500',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: 'bg-indigo-600',
    ring: 'ring-indigo-500',
  },
};
