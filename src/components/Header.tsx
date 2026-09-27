import React, { useState } from 'react';
import { 
  Building2, 
  Music2, 
  Disc, 
  Users, 
  Check, 
  Copy, 
  CalendarDays, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Printer, 
  Layers,
  Settings,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { ViewMode } from '../types/schedule';

interface HeaderProps {
  year: number;
  month: number;
  viewMode: ViewMode;
  staffNames: string[];
  isLiveHolidaySync: boolean;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTodayMonth: () => void;
  onViewModeChange: (m: ViewMode) => void;
  onExportExcel: () => void;
  onCopyTSV: () => void;
  onOpenGuide: () => void;
  onOpenStaffModal: () => void;
  onPrint: () => void;
  copyFeedback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  year,
  month,
  viewMode,
  staffNames,
  isLiveHolidaySync,
  onYearChange,
  onMonthChange,
  onPrevMonth,
  onNextMonth,
  onTodayMonth,
  onViewModeChange,
  onExportExcel,
  onCopyTSV,
  onOpenGuide,
  onOpenStaffModal,
  onPrint,
  copyFeedback,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-3 gap-3">
          {/* Logo & Sound Company Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-purple-500/20">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  音響・PARTY 2現場月間予定表
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  外現場 ＆ ライブハウス「PARTY」
                </span>
                {isLiveHolidaySync && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    ● 祝日API最新連携中
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                A1セル月変更で自動連動 | 土曜(青)・日祝(赤) | PA・その他スタッフ・全員＆5人チェック欄完備
              </p>
            </div>
          </div>

          {/* Month Selector (Simulating A1 Cell Trigger) */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={onPrevMonth}
              title="前月へ"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-xs transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 pl-1 uppercase font-mono">A1:</span>
              <select
                value={month}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="bg-transparent font-bold text-blue-700 text-base focus:outline-none cursor-pointer py-1 px-1"
                title="GoogleスプレッドシートのA1セルに相当"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>

            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-600 text-xs focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-200/50"
            >
              {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>

            <button
              onClick={onNextMonth}
              title="次月へ"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 hover:shadow-xs transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTodayMonth}
              className="text-xs font-medium px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg shadow-2xs transition ml-0.5"
            >
              今月
            </button>
          </div>

          {/* Quick Actions (Guide, Staff Settings, Copy, Export) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onOpenStaffModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
              title="スタッフ5人の名前を設定"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>スタッフ名設定 (5名)</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition shadow-xs"
              title="A1セル入力自動連動・条件付き書式・内閣府祝日API設定ガイド"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>数式・書式設定ガイド</span>
            </button>

            <button
              onClick={onCopyTSV}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition shadow-xs ${
                copyFeedback
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Googleスプレッドシートに直接貼り付けできるTSV形式でコピー"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'シート貼付用にコピー完了！' : 'シート貼付用コピー'}</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg transition shadow-xs"
              title="Excel (.xlsx) 形式でダウンロード"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel出力</span>
            </button>

            <button
              onClick={onPrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition"
              title="印刷・PDF保存"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 pb-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => onViewModeChange('dual-spreadsheet')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'dual-spreadsheet'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>2現場スプレッドシート表 (編集)</span>
            </button>

            <button
              onClick={() => onViewModeChange('calendar')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>2現場カレンダー比較</span>
            </button>

            <button
              onClick={() => onViewModeChange('staff-summary')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === 'staff-summary'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>スタッフ稼働集計</span>
            </button>
          </div>

          {/* Color legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              土曜日：青
            </span>
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              日曜日・祝日：赤
            </span>
            <span className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-400 inline-block"></span>
              外現場
            </span>
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-2.5 h-2.5 rounded bg-indigo-200 border border-indigo-400 inline-block"></span>
              PARTY
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
