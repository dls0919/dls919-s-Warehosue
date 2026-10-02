import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { HabitItem, MotivationalQuote } from '../types';
import { HabitIcon, COLOR_STYLES } from './HabitIcon';
import { ambientEngine, AmbientSoundType, playBellChime, playTapSound } from '../utils/sound';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle,
  Quote,
  Sparkles,
  CloudRain,
  Waves,
  Trees,
  Clock,
} from 'lucide-react';

interface FocusTimerProps {
  habits: HabitItem[];
  selectedHabitId?: string;
  onFinishSession: (habitId: string, minutes: number) => void;
  activeQuote: MotivationalQuote;
  onNextQuote: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  habits,
  selectedHabitId,
  onFinishSession,
  activeQuote,
  onNextQuote,
}) => {
  const activeHabits = habits.filter(h => !h.archived);
  const [currentHabitId, setCurrentHabitId] = useState<string>(
    selectedHabitId || activeHabits[0]?.id || ''
  );

  // Timer duration in minutes
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.35);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    if (selectedHabitId) {
      setCurrentHabitId(selectedHabitId);
    }
  }, [selectedHabitId]);

  // Timer tick effect
  useEffect(() => {
    let timer: number | null = null;
    if (isRunning) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, targetMinutes, currentHabitId]);

  // Handle ambient audio
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      ambientEngine.start(ambientSound);
      ambientEngine.setVolume(volume);
    } else {
      ambientEngine.stop();
    }
    return () => {
      ambientEngine.stop();
    };
  }, [isRunning, ambientSound, volume]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playBellChime();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#FBBF24'],
      });
    } catch {
      // ignore
    }
    onFinishSession(currentHabitId, targetMinutes);
    setTimeLeft(targetMinutes * 60);
  };

  const handleSelectDuration = (min: number) => {
    if (isRunning) return;
    playTapSound();
    setTargetMinutes(min);
    setTimeLeft(min * 60);
  };

  const toggleTimer = () => {
    playTapSound();
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    playTapSound();
    setIsRunning(false);
    setTimeLeft(targetMinutes * 60);
  };

  const handleFinishEarly = () => {
    if (timeLeft === targetMinutes * 60) return;
    const minutesElapsed = Math.round((targetMinutes * 60 - timeLeft) / 60);
    if (minutesElapsed > 0) {
      playBellChime();
      onFinishSession(currentHabitId, minutesElapsed);
    }
    resetTimer();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const selectedHabit = habits.find(h => h.id === currentHabitId) || activeHabits[0];
  const colorMeta = selectedHabit ? COLOR_STYLES[selectedHabit.color] || COLOR_STYLES.emerald : COLOR_STYLES.emerald;

  // Format time MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress circle
  const totalSeconds = targetMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = 100 - progressRatio * 100;

  return (
    <div
      ref={containerRef}
      className={`transition-colors ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#FAF9F6] p-6 sm:p-10 flex flex-col justify-between overflow-y-auto'
          : 'space-y-6'
      }`}
    >
      {/* Top Banner in Focus Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <h2 className="text-base font-bold text-stone-900">
            沉浸专注番茄钟
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏无干扰专注'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Canvas Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Habit Selector pills/dropdown */}
        <div className="mb-6 flex flex-col items-center">
          <span className="text-xs text-stone-600 mb-2">当前专注学习项目</span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg">
            {activeHabits.map(h => {
              const isSelected = h.id === currentHabitId;
              const hColor = COLOR_STYLES[h.color] || COLOR_STYLES.emerald;
              return (
                <button
                  key={h.id}
                  disabled={isRunning}
                  onClick={() => {
                    setCurrentHabitId(h.id);
                    playTapSound();
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-50'
                  }`}
                >
                  <HabitIcon name={h.icon} className="w-3.5 h-3.5" />
                  <span>{h.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          {/* SVG Progress Ring */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-stone-100"
              strokeWidth="5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated foreground ring */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-emerald-600 transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 * (1 - progressRatio)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Time digits in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-bold font-mono tabular-nums tracking-tight text-stone-900">
              {timeFormatted}
            </span>
            <div className="flex items-center gap-1 text-xs text-stone-600 mt-2">
              <span>{selectedHabit?.title || '专注学习'}</span>
              <span aria-hidden="true">·</span>
              <span>{isRunning ? '专注中' : '就绪'}</span>
            </div>
          </div>
        </div>

        {/* Duration Preset Selector */}
        <div className="flex items-center gap-2 mb-8">
          {[15, 25, 35, 45, 60].map(mins => (
            <button
              key={mins}
              disabled={isRunning}
              onClick={() => handleSelectDuration(mins)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg font-mono tabular-nums transition-colors ${
                targetMinutes === mins
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-40'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetTimer}
            disabled={!isRunning && timeLeft === targetMinutes * 60}
            className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 transition-colors"
            title="重置计时"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className="min-h-[52px] min-w-[140px] px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>暂停专注</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>开启专注</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            disabled={timeLeft === targetMinutes * 60}
            className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 disabled:opacity-40 transition-colors"
            title="提前完成并计入今日打卡"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Ambient Sound Selector */}
        <div className="mt-8 pt-6 border-t border-stone-100 w-full max-w-md flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs text-stone-600 mb-2">
            <Volume2 className="w-3.5 h-3.5" />
            <span>专注伴奏白噪音 (Web Audio 原生合成)</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'none', label: '静音', icon: VolumeX },
              { id: 'rain', label: '林间雨', icon: CloudRain },
              { id: 'waves', label: '潮汐海浪', icon: Waves },
              { id: 'forest', label: '风吹叶响', icon: Trees },
              { id: 'tick', label: '钟摆节拍', icon: Clock },
            ].map(snd => {
              const Icon = snd.icon;
              const isCurrent = ambientSound === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => {
                    playTapSound();
                    setAmbientSound(snd.id as AmbientSoundType);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-stone-800 text-white font-medium'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{snd.label}</span>
                </button>
              );
            })}
          </div>

          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2 mt-3 w-48">
              <span className="text-[10px] text-stone-600">音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Motivational Quote at bottom of focus view */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <Quote className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="text-xs text-stone-700 font-serif leading-relaxed">
            “{activeQuote.content}”
            <span className="text-stone-600 ml-2">—— {activeQuote.author || '心流'}</span>
          </p>
        </div>
        <button
          onClick={onNextQuote}
          className="text-xs text-stone-600 hover:text-stone-900 ml-2 shrink-0 font-medium"
        >
          换一句
        </button>
      </div>
    </div>
  );
};
