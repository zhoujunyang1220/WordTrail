import React, { useState } from "react";
import { X, TrendingUp, Calendar, CheckCircle, XCircle, BarChart3, Award } from "lucide-react";
import { getStatsHistory, getStreakData, DailyStats, StreakData } from "../lib/storage";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "zh" | "en";
  totalWords: number;
  masteredWords: number;
}

export default function StatsModal({
  isOpen,
  onClose,
  lang,
  totalWords,
  masteredWords,
}: StatsModalProps) {
  const [stats] = useState<DailyStats[]>(() => getStatsHistory());
  const [streak] = useState<StreakData>(() => getStreakData());

  if (!isOpen) return null;

  const t = {
    title: lang === "zh" ? "学习统计" : "Study Statistics",
    streak: lang === "zh" ? "连续打卡" : "Streak",
    currentStreak: lang === "zh" ? "当前连续" : "Current Streak",
    longestStreak: lang === "zh" ? "最长连续" : "Longest Streak",
    totalDays: lang === "zh" ? "总打卡天数" : "Total Days",
    today: lang === "zh" ? "今日" : "Today",
    reviewed: lang === "zh" ? "已复习" : "Reviewed",
    correct: lang === "zh" ? "正确" : "Correct",
    incorrect: lang === "zh" ? "错误" : "Incorrect",
    accuracy: lang === "zh" ? "正确率" : "Accuracy",
    totalWords: lang === "zh" ? "总词汇量" : "Total Words",
    mastered: lang === "zh" ? "已掌握" : "Mastered",
    masteryRate: lang === "zh" ? "掌握率" : "Mastery Rate",
    noData: lang === "zh" ? "暂无学习数据" : "No study data yet",
    last7Days: lang === "zh" ? "最近7天" : "Last 7 Days",
    reviewHistory: lang === "zh" ? "复习历史" : "Review History",
  };

  // Get last 7 days stats
  const last7Days: { date: string; reviewed: number; correct: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayStats = stats.find((s) => s.date === dateStr);
    last7Days.push({
      date: dateStr,
      reviewed: dayStats?.reviewed || 0,
      correct: dayStats?.correct || 0,
    });
  }

  const totalReviewed = stats.reduce((sum, d) => sum + d.reviewed, 0);
  const totalCorrect = stats.reduce((sum, d) => sum + d.correct, 0);
  const overallAccuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

  const maxVal = Math.max(...last7Days.map((d) => d.reviewed), 1);
  const weekdays = lang === "zh"
    ? ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-2xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> {t.title}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{t.totalWords}</p>
              <p className="text-2xl font-black text-indigo-950 dark:text-indigo-200 mt-1">{totalWords}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{t.mastered}</p>
              <p className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1">{masteredWords}</p>
            </div>
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t.totalDays}</p>
              <p className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-1">{stats.length}</p>
            </div>
            <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/40">
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{t.accuracy}</p>
              <p className="text-2xl font-black text-sky-950 dark:text-sky-200 mt-1">{overallAccuracy}%</p>
            </div>
          </div>

          {/* Streak section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">{t.streak}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{streak.currentStreak}</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-500 font-semibold">{t.currentStreak}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{streak.longestStreak}</p>
                <p className="text-[10px] text-orange-700 dark:text-orange-500 font-semibold">{t.longestStreak}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{streak.checkinHistory.length}</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">{t.totalDays}</p>
              </div>
            </div>
          </div>

          {/* Last 7 days bar chart */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">{t.last7Days}</h3>
            {last7Days.some((d) => d.reviewed > 0) ? (
              <div className="flex items-end gap-2 h-24">
                {last7Days.map((day, i) => {
                  const height = day.reviewed > 0 ? Math.max((day.reviewed / maxVal) * 100, 10) : 4;
                  const weekday = new Date(day.date).getDay();
                  const label = weekdays[weekday === 0 ? 6 : weekday - 1];
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[8px] text-slate-400 font-semibold">{day.reviewed}</span>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 dark:from-indigo-600 dark:to-indigo-500 rounded-t-md transition-all"
                        style={{ height: height + "%" }}
                        title={`${day.date}: ${day.reviewed} reviewed`}
                      />
                      <span className="text-[8px] text-slate-500 dark:text-slate-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">{t.noData}</p>
            )}
          </div>

          {/* Recent review history */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">{t.reviewHistory}</h3>
            {stats.length > 0 ? (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {[...stats].reverse().slice(0, 14).map((day) => {
                  const acc = day.reviewed > 0 ? Math.round((day.correct / day.reviewed) * 100) : 0;
                  return (
                    <div key={day.date} className="flex items-center justify-between text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <span className="text-slate-500 dark:text-slate-400">{day.date}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3 h-3" /> {day.correct}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400">
                          <XCircle className="w-3 h-3" /> {day.incorrect}
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300 w-10 text-right">{acc}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">{t.noData}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
