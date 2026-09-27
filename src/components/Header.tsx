import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Check, 
  Copy, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Printer, 
  Menu,
  X,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  RotateCcw,
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
  onLoadAudioSampleData?: () => void;
  onClearMonth?: () => void;
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
  onLoadAudioSampleData,
  onClearMonth,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-white border-b border-slate-300 sticky top-0 z-40 shadow-xs print:hidden">
      <div className="w-full px-2 sm:px-4 py-1.5 flex flex-col gap-1.5">
        
        {/* Row 1: タイトル & 設定メニュー (ハンバーガー / 3点リーダー) */}
        <div className="flex items-center justify-between">
          <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
            <span>月間スケジュール、人員配置表</span>
            {isLiveHolidaySync && (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="祝日API連携中" />
            )}
          </h1>

          {/* Menu button (ハンバーガー) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="設定メニュー"
              className={`p-1.5 rounded-lg border transition flex items-center gap-1 ${
                isMenuOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="text-xs font-semibold hidden xs:inline">設定・メニュー</span>
            </button>

            {/* Dropdown / Drawer for Mobile & Desktop */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-700">メニュー・各種設定</span>
                  {isLiveHolidaySync && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      祝日API連携中
                    </span>
                  )}
                </div>

                <div className="py-1">
                  {/* スタッフ名設定 */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenStaffModal();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 transition"
                  >
                    <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-semibold">スタッフ名設定 (5名)</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
                        {staffNames.join(', ')}
                      </div>
                    </div>
                  </button>

                  {/* 数式・書式ガイド */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenGuide();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-amber-900 transition"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-semibold">数式・書式設定ガイド</div>
                      <div className="text-[10px] text-slate-500">A1自動連動・条件付き書式</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {/* シート貼付用コピー */}
                  <button
                    onClick={() => {
                      onCopyTSV();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between text-slate-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {copyFeedback ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-emerald-800">
                          {copyFeedback ? 'コピー完了！' : 'シート貼付用コピー'}
                        </div>
                        <div className="text-[10px] text-slate-500">スプレッドシートに直接ペースト</div>
                      </div>
                    </div>
                    {copyFeedback && (
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">済</span>
                    )}
                  </button>

                  {/* Excel出力 */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onExportExcel();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2.5 text-slate-800 transition"
                  >
                    <Download className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-blue-800">Excel出力 (.xlsx)</div>
                      <div className="text-[10px] text-slate-500">Excelファイルで保存</div>
                    </div>
                  </button>

                  {/* 印刷・PDF保存 */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onPrint();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 transition"
                  >
                    <Printer className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <div className="font-semibold">印刷 / PDF保存</div>
                      <div className="text-[10px] text-slate-500">印刷プレビューを開く</div>
                    </div>
                  </button>

                  {(onLoadAudioSampleData || onClearMonth) && (
                    <>
                      <div className="border-t border-slate-100 my-1" />
                      {onLoadAudioSampleData && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onLoadAudioSampleData();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-purple-50 flex items-center gap-2.5 text-purple-900 transition"
                        >
                          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                          <span className="font-semibold">サンプルデータを入力</span>
                        </button>
                      )}
                      {onClearMonth && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onClearMonth();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2.5 text-red-700 transition"
                        >
                          <RotateCcw className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="font-semibold">{month}月の入力を全クリア</span>
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t border-slate-100 px-3 py-1.5 bg-slate-50 rounded-b-xl text-[10px] text-slate-500 flex items-center justify-between">
                  <span>土曜: 青 / 日祝: 赤</span>
                  <span>A1月変更連動</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: 月選択 */}
        <div className="flex items-center justify-between gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200">
          <button
            onClick={onPrevMonth}
            aria-label="前月へ"
            className="p-1 rounded bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-white font-bold text-slate-800 text-xs border border-slate-200 rounded px-1.5 py-1 focus:outline-none cursor-pointer shadow-2xs"
            >
              {Array.from({ length: 15 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>

            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="bg-white font-extrabold text-blue-700 text-sm border border-slate-200 rounded px-2 py-1 focus:outline-none cursor-pointer shadow-2xs"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}月
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onNextMonth}
              aria-label="次月へ"
              className="p-1 rounded bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTodayMonth}
              className="text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded shadow-2xs hover:bg-blue-100 transition whitespace-nowrap"
            >
              今月
            </button>
          </div>
        </div>

        {/* Row 3: 一覧 / カレンダー / スタッフ稼働集計 選択 */}
        <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-0.5 rounded-lg text-center">
          <button
            onClick={() => onViewModeChange('dual-spreadsheet')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-xs font-bold transition ${
              viewMode === 'dual-spreadsheet'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">一覧</span>
          </button>

          <button
            onClick={() => onViewModeChange('calendar')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-xs font-bold transition ${
              viewMode === 'calendar'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">カレンダー</span>
          </button>

          <button
            onClick={() => onViewModeChange('staff-summary')}
            className={`flex items-center justify-center gap-1 py-1 px-1 rounded-md text-xs font-bold transition ${
              viewMode === 'staff-summary'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">スタッフ稼働集計</span>
          </button>
        </div>

      </div>
    </header>
  );
};
