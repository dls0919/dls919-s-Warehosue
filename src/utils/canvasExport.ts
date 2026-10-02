import { WeeklySummaryStats } from '../types';

export function generateWeeklyReportText(stats: WeeklySummaryStats, feedback: string): string {
  const lines: string[] = [];
  lines.push(`🌱 【学习周报】 ${stats.weekLabel}`);
  lines.push(`⏱️ 本周总专注时长：${stats.totalHours} 小时 (${stats.totalMinutes} 分钟)`);
  lines.push(`📊 打卡完成率：${stats.overallCompletionRate}% · 连续活跃天数：${stats.completedDaysCount}/7 天`);
  lines.push(`📈 日均投入：${stats.dailyAvgMinutes} 分钟/天`);
  lines.push('');
  lines.push('📌 【科目投入分布】');
  stats.categoryStats.forEach(cat => {
    lines.push(`· ${cat.category}：${(cat.minutes / 60).toFixed(1)}h (${cat.percentage}%)`);
  });
  lines.push('');
  lines.push('🏆 【项目打卡榜单】');
  stats.habitBreakdown.forEach((h, idx) => {
    lines.push(`${idx + 1}. ${h.habit.title}：${(h.totalMinutes / 60).toFixed(1)}小时 (${h.daysCompleted}/7天达标)`);
  });
  if (stats.reflections.length > 0) {
    lines.push('');
    lines.push('💡 【本周复盘摘录】');
    stats.reflections.slice(0, 3).forEach(r => {
      lines.push(`· [${r.habitTitle}] ${r.notes}`);
    });
  }
  lines.push('');
  lines.push(`✨ ${feedback}`);
  lines.push('—— 晨露打卡 · 保持热爱，奔赴山海 ——');
  return lines.join('\n');
}

// Draw an aesthetic study report card directly to Canvas for high-res PNG download
export function exportReportToCanvas(
  stats: WeeklySummaryStats,
  feedback: string
): Promise<string> {
  return new Promise((resolve) => {
    const width = 800;
    const height = 1100;
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // retina 2x
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve('');

    ctx.scale(2, 2);

    // 1. Background gradient (Natural warm parchment & pale matcha tint)
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#FCFBF8');
    bgGradient.addColorStop(0.5, '#F7F8F5');
    bgGradient.addColorStop(1, '#F0F4EE');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative subtle top border accent
    ctx.fillStyle = '#2D5A46'; // sage green
    ctx.fillRect(40, 40, width - 80, 4);

    // Header Title
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 26px "Noto Serif SC", "PingFang SC", serif';
    ctx.fillText('学习周报统计 · WEEKLY REVIEW', 48, 88);

    // Subtitle / Date
    ctx.fillStyle = '#64748B';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`周期：${stats.weekLabel}  ·  晨露打卡`, 48, 114);

    // Metric Summary Grid (3 Columns)
    const boxY = 145;
    const boxW = (width - 96 - 32) / 3;
    const boxH = 92;

    const metrics = [
      { label: '本周总专注时长', value: `${stats.totalHours}`, unit: '小时', sub: `${stats.totalMinutes} 分钟` },
      { label: '打卡综合达标率', value: `${stats.overallCompletionRate}`, unit: '%', sub: `7天内打卡 ${stats.completedDaysCount} 天` },
      { label: '日均专注投入', value: `${stats.dailyAvgMinutes}`, unit: '分钟', sub: `稳步推进` }
    ];

    metrics.forEach((m, i) => {
      const bx = 48 + i * (boxW + 16);
      // Card bg
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(bx, boxY, boxW, boxH, 12);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Card label
      ctx.fillStyle = '#64748B';
      ctx.font = '12px "PingFang SC", sans-serif';
      ctx.fillText(m.label, bx + 16, boxY + 28);

      // Card Value
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px "Plus Jakarta Sans", monospace';
      ctx.fillText(m.value, bx + 16, boxY + 60);

      // Unit
      const valWidth = ctx.measureText(m.value).width;
      ctx.fillStyle = '#64748B';
      ctx.font = '13px "PingFang SC", sans-serif';
      ctx.fillText(m.unit, bx + 16 + valWidth + 4, boxY + 58);

      // Sub
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px "PingFang SC", sans-serif';
      ctx.fillText(m.sub, bx + 16, boxY + 78);
    });

    // Daily Bar Chart Area
    const chartY = 265;
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px "PingFang SC", sans-serif';
    ctx.fillText('每日学习投入时长 (周一 至 周日)', 48, chartY);

    const chartBoxY = chartY + 16;
    const chartBoxH = 140;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(48, chartBoxY, width - 96, chartBoxH, 12);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw bars
    const maxMin = Math.max(...stats.dailyStats.map(d => d.minutes), 90);
    const barWidth = 44;
    const chartContentW = width - 96 - 48;
    const step = chartContentW / 7;

    stats.dailyStats.forEach((d, i) => {
      const bx = 48 + 24 + i * step + (step - barWidth) / 2;
      const barH = Math.max(6, Math.min(80, (d.minutes / maxMin) * 80));
      const by = chartBoxY + 100 - barH;

      // bar background track
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(bx, chartBoxY + 20, barWidth, 80, 4);
      ctx.fill();

      // actual bar
      ctx.fillStyle = d.minutes > 0 ? '#10B981' : '#CBD5E1';
      ctx.beginPath();
      ctx.roundRect(bx, by, barWidth, barH, 4);
      ctx.fill();

      // Text minute
      ctx.fillStyle = d.minutes > 0 ? '#047857' : '#94A3B8';
      ctx.font = 'bold 11px "Plus Jakarta Sans", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.minutes}m`, bx + barWidth / 2, by - 6);

      // Day label
      ctx.fillStyle = '#475569';
      ctx.font = '12px "PingFang SC", sans-serif';
      ctx.fillText(d.dayLabel, bx + barWidth / 2, chartBoxY + 120);
    });

    ctx.textAlign = 'left';

    // Habit breakdown section
    const listY = 450;
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px "PingFang SC", sans-serif';
    ctx.fillText('核心打卡项目投入统计', 48, listY);

    let curY = listY + 16;
    stats.habitBreakdown.slice(0, 4).forEach((h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(48, curY, width - 96, 52, 10);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.stroke();

      // Category dot
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(68, curY + 26, 4, 0, Math.PI * 2);
      ctx.fill();

      // Title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "PingFang SC", sans-serif';
      ctx.fillText(h.habit.title, 82, curY + 31);

      // Category tag
      ctx.fillStyle = '#64748B';
      ctx.font = '12px "PingFang SC", sans-serif';
      ctx.fillText(`· ${h.habit.category}`, 82 + ctx.measureText(h.habit.title).width + 8, curY + 31);

      // Duration & count right-aligned
      const durText = `${(h.totalMinutes / 60).toFixed(1)} 小时`;
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Plus Jakarta Sans", monospace';
      const durW = ctx.measureText(durText).width;
      ctx.fillText(durText, width - 48 - 20 - durW, curY + 24);

      const daysText = `${h.daysCompleted}/7天完成`;
      ctx.fillStyle = '#64748B';
      ctx.font = '11px "PingFang SC", sans-serif';
      const daysW = ctx.measureText(daysText).width;
      ctx.fillText(daysText, width - 48 - 20 - daysW, curY + 42);

      curY += 62;
    });

    // Reflections section if exists
    if (stats.reflections.length > 0) {
      curY += 10;
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px "PingFang SC", sans-serif';
      ctx.fillText('学习心得与复盘摘录', 48, curY);

      curY += 16;
      stats.reflections.slice(0, 2).forEach(r => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(48, curY, width - 96, 56, 10);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.stroke();

        ctx.fillStyle = '#047857';
        ctx.font = 'bold 12px "PingFang SC", sans-serif';
        ctx.fillText(`[${r.habitTitle}]`, 64, curY + 24);

        ctx.fillStyle = '#334155';
        ctx.font = '13px "PingFang SC", sans-serif';
        const truncated = r.notes.length > 40 ? r.notes.slice(0, 39) + '...' : r.notes;
        ctx.fillText(truncated, 64, curY + 44);

        curY += 66;
      });
    }

    // Bottom Editorial Encouragement Box
    const footerY = Math.max(curY + 10, 930);
    ctx.fillStyle = '#E6F4EA';
    ctx.beginPath();
    ctx.roundRect(48, footerY, width - 96, 76, 12);
    ctx.fill();

    ctx.fillStyle = '#137333';
    ctx.font = 'bold 13px "PingFang SC", sans-serif';
    ctx.fillText('🌿 导师评语与自勉', 66, footerY + 28);

    ctx.fillStyle = '#1E4620';
    ctx.font = '12px "PingFang SC", sans-serif';
    ctx.fillText(feedback.slice(0, 48), 66, footerY + 52);
    if (feedback.length > 48) {
      ctx.fillText(feedback.slice(48, 96), 66, footerY + 68);
    }

    // Brand Watermark Bottom
    ctx.fillStyle = '#94A3B8';
    ctx.font = '12px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('晨露打卡 · 记录每一个专注时刻', width / 2, 1050);

    resolve(canvas.toDataURL('image/png'));
  });
}
