import React, { useState } from 'react';
import { 
  Trash2, 
  CheckSquare2, 
  Square, 
  Music2, 
  Disc, 
  Building2,
  Search, 
  Sparkles,
  Sun,
  Sunset,
  Sparkle
} from 'lucide-react';
import { DualSiteDayRow, OutsideSiteDayData, PartySiteDayData } from '../types/schedule';

interface DualSpreadsheetViewProps {
  days: DualSiteDayRow[];
  year: number;
  month: number;
  staffNames: string[];
  onUpdateOutside: (dayIndex: number, field: keyof OutsideSiteDayData, value: any) => void;
  onUpdateParty: (dayIndex: number, field: keyof PartySiteDayData, value: any) => void;
  onToggleOutsideStaffCheck: (dayIndex: number, staffName: string) => void;
  onToggleOutsideAllCheck: (dayIndex: number) => void;
  onTogglePartyStaffCheck: (dayIndex: number, staffName: string) => void;
  onLoadAudioSampleData: () => void;
  onClearMonth: () => void;
}

export const DualSpreadsheetView: React.FC<DualSpreadsheetViewProps> = ({
  days,
  year,
  month,
  staffNames,
  onUpdateOutside,
  onUpdateParty,
  onToggleOutsideStaffCheck,
  onToggleOutsideAllCheck,
  onTogglePartyStaffCheck,
  onLoadAudioSampleData,
  onClearMonth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBusyDays, setOnlyBusyDays] = useState(false); // 2現場重複日のみ

  // Filter
  const filteredDays = days.map((day, originalIndex) => ({ day, originalIndex })).filter(({ day }) => {
    if (onlyBusyDays) {
      const hasOutside = Boolean(day.outside.siteName);
      const hasParty = Boolean(
        day.party.paStaff || 
        day.party.lightingStaff || 
        day.party.receptionStaff || 
        day.party.drinkStaff || 
        day.party.notes ||
        day.party.isSalaPerformance
      );
      if (!(hasOutside && hasParty)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOutside = 
        day.outside.siteName.toLowerCase().includes(q) ||
        day.outside.notes.toLowerCase().includes(q);
      const matchParty = 
        day.party.paStaff.toLowerCase().includes(q) ||
        day.party.lightingStaff.toLowerCase().includes(q) ||
        day.party.receptionStaff.toLowerCase().includes(q) ||
        day.party.drinkStaff.toLowerCase().includes(q) ||
        day.party.notes.toLowerCase().includes(q);
      if (!matchOutside && !matchParty) return false;
    }

    return true;
  });

  return (
    <div className="space-y-3">
      {/* Top Filter & Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="現場名・PA/照明/受付/ドリンク・イベント名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <button
            onClick={() => setOnlyBusyDays((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              onlyBusyDays
                ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-purple-600" />
            <span>2現場重なる日のみ</span>
          </button>
        </div>

        {/* Quick Data Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadAudioSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>見本データ読込</span>
          </button>

          <button
            onClick={onClearMonth}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="予定を初期化"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>クリア</span>
          </button>

          <div className="text-xs text-slate-500 border-l border-slate-200 pl-3">
            表示: <span className="font-semibold text-slate-800">{filteredDays.length}</span>日 / {days.length}日
          </div>
        </div>
      </div>

      {/* Main Dual-Site Spreadsheet Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Print Header */}
        <div className="hidden print:block p-4 border-b border-slate-300 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            {year}年 {month}月度 音響・ライブハウスPARTY 2現場予定表
          </h2>
          <p className="text-xs text-slate-500 mt-1">作成日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Top Multi-level Header */}
            <thead>
              {/* Category Header (Row 1) */}
              <tr className="border-b border-slate-300 select-none text-center">
                <th colSpan={2} className="py-2 px-2 bg-slate-200 text-slate-800 font-bold border-r-2 border-slate-400">
                  カレンダー日付
                </th>
                <th colSpan={4 + staffNames.length} className="py-2 px-3 bg-amber-100 text-amber-950 font-bold border-r-2 border-amber-300">
                  <div className="flex items-center justify-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>【現場①】 外現場 (音響・PA出向)</span>
                  </div>
                </th>
                <th colSpan={8} className="py-2 px-3 bg-indigo-100 text-indigo-950 font-bold">
                  <div className="flex items-center justify-center gap-1.5">
                    <Music2 className="w-4 h-4 text-indigo-700" />
                    <span>【現場②】 ライブハウス「PARTY」</span>
                  </div>
                </th>
              </tr>

              {/* Column Detail Header (Row 2) */}
              <tr className="bg-slate-100 text-slate-700 border-b-2 border-slate-300 font-semibold select-none text-[11px]">
                {/* Calendar Cols: 祝日・区分欄は削除、曜日のみ */}
                <th className="py-2 px-2 w-14 text-center border-r border-slate-200">日付</th>
                <th className="py-2 px-1 w-14 text-center border-r-2 border-slate-400" title="祝日の場合は「祝」が表示されます">曜日</th>

                {/* Outside Site Cols */}
                <th className="py-2 px-2 min-w-[170px] border-r border-slate-200">外現場名</th>
                <th className="py-2 px-1 w-12 text-center border-r border-slate-200 bg-amber-50/80 text-amber-900" title="全員チェック">
                  全員
                </th>
                {staffNames.map((name, i) => (
                  <th
                    key={`out-th-${name}-${i}`}
                    className="py-2 px-1 w-12 text-center border-r border-slate-200 bg-amber-50/50 text-slate-800 truncate"
                    title={name}
                  >
                    {name}
                  </th>
                ))}
                <th className="py-2 px-1.5 w-28 text-center border-r border-slate-200 bg-amber-50/70 text-amber-950">
                  朝から / 午後から
                </th>
                <th className="py-2 px-2 min-w-[140px] border-r-2 border-amber-300">外現場: 備考</th>

                {/* Livehouse PARTY Cols: 前段に日付・曜日 */}
                <th className="py-2 px-1.5 w-12 text-center border-r border-slate-200 bg-indigo-100/70 text-indigo-950 font-bold">
                  日付
                </th>
                <th className="py-2 px-1 w-12 text-center border-r border-slate-200 bg-indigo-100/70 text-indigo-950 font-bold">
                  曜
                </th>
                <th className="py-2 px-1.5 w-28 text-center border-r border-slate-200 bg-indigo-50/60 text-indigo-950 font-bold">
                  PA (担当者)
                </th>
                <th className="py-2 px-1.5 w-28 text-center border-r border-slate-200 bg-indigo-50/40 text-slate-800">
                  照明 (担当者)
                </th>
                <th className="py-2 px-1.5 w-28 text-center border-r border-slate-200 bg-indigo-50/40 text-slate-800">
                  受付 (担当者)
                </th>
                <th className="py-2 px-1.5 w-28 text-center border-r border-slate-200 bg-indigo-50/40 text-slate-800">
                  ドリンク (担当者)
                </th>
                <th className="py-2 px-1 w-16 text-center border-r border-slate-200 bg-pink-50 text-pink-900 font-bold" title="SALA出演">
                  SALA出演
                </th>
                <th className="py-2 px-2 min-w-[140px]">PARTY: イベント・備考</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {filteredDays.map(({ day, originalIndex }) => {
                const isSat = day.isSaturday;
                const isSun = day.isSunday;
                const isHol = day.isHoliday;

                // Conditional Formatting row color:
                // Saturdays in soft blue, Sundays & Holidays in soft red
                let rowBg = 'bg-white hover:bg-slate-50/90';
                let dateBadge = 'bg-slate-100 text-slate-800';
                let dayBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                let borderAccent = 'border-l-4 border-l-transparent';

                if (isHol || isSun) {
                  rowBg = 'bg-red-50/35 hover:bg-red-50/70';
                  dateBadge = 'bg-red-100 text-red-700 font-bold';
                  dayBadge = 'bg-red-100 text-red-700 border-red-300 font-bold';
                  borderAccent = 'border-l-4 border-l-red-500';
                } else if (isSat) {
                  rowBg = 'bg-blue-50/35 hover:bg-blue-50/70';
                  dateBadge = 'bg-blue-100 text-blue-700 font-bold';
                  dayBadge = 'bg-blue-100 text-blue-700 border-blue-300 font-bold';
                  borderAccent = 'border-l-4 border-l-blue-500';
                }

                const outAllChecked = day.outside.staffCheck.all;

                return (
                  <tr key={day.dateStr} className={`transition-colors duration-150 ${rowBg}`}>
                    {/* 日付 (左端) */}
                    <td className={`py-1.5 px-2 text-center align-middle border-r border-slate-200 select-none ${borderAccent}`}>
                      <span className={`px-2 py-0.5 rounded text-xs tracking-tight ${dateBadge}`}>
                        {day.dayNumber}日
                      </span>
                    </td>

                    {/* 曜日 (祝日の場合は空いてるところに「祝」を表示、区分列は削除) */}
                    <td className="py-1.5 px-1.5 text-center align-middle border-r-2 border-slate-400 select-none">
                      <div className="inline-flex items-center justify-center gap-1">
                        <span className={`inline-block w-6 py-0.5 text-xs text-center rounded border ${dayBadge}`}>
                          {day.dayOfWeek}
                        </span>
                        {isHol && (
                          <span
                            className="px-1 py-0.2 rounded bg-red-600 text-white font-bold text-[10px] leading-tight shadow-2xs cursor-default"
                            title={day.holidayName ? `祝日: ${day.holidayName}` : '祝日'}
                          >
                            祝
                          </span>
                        )}
                      </div>
                    </td>

                    {/* --- 【外現場】 --- */}
                    {/* 外現場名 */}
                    <td className="py-1 px-1.5 border-r border-slate-200">
                      <input
                        type="text"
                        placeholder="外現場名..."
                        value={day.outside.siteName}
                        onChange={(e) => onUpdateOutside(originalIndex, 'siteName', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-amber-500 rounded focus:outline-none font-medium text-slate-800 transition"
                      />
                    </td>

                    {/* 外: 全員チェック */}
                    <td className="py-1 px-1 text-center border-r border-slate-200 bg-amber-50/40">
                      <button
                        type="button"
                        onClick={() => onToggleOutsideAllCheck(originalIndex)}
                        className={`p-1 rounded transition ${
                          outAllChecked ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' : 'text-slate-300 hover:text-slate-600 hover:bg-white'
                        }`}
                        title="外現場: 全員出勤"
                      >
                        {outAllChecked ? <CheckSquare2 className="w-4 h-4 fill-amber-600 text-white" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 外: スタッフ5人個別チェック */}
                    {staffNames.map((name) => {
                      const isChecked = outAllChecked || Boolean(day.outside.staffCheck.staff[name]);
                      return (
                        <td
                          key={`out-cell-${name}`}
                          className="py-1 px-1 text-center border-r border-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleOutsideStaffCheck(originalIndex, name)}
                            className={`p-1 rounded transition ${
                              isChecked
                                ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                                : 'text-slate-300 hover:text-slate-600 hover:bg-white'
                            }`}
                            title={`外現場: ${name}`}
                          >
                            {isChecked ? (
                              <CheckSquare2 className="w-4 h-4 text-amber-700" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* 外現場: 朝から / 午後から チェック欄 */}
                    <td className="py-1 px-1.5 border-r border-slate-200 bg-amber-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateOutside(originalIndex, 'isMorning', !day.outside.isMorning)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                            day.outside.isMorning
                              ? 'bg-amber-200 text-amber-900 border-amber-400 shadow-2xs'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="朝から稼働"
                        >
                          <Sun className={`w-3 h-3 ${day.outside.isMorning ? 'text-amber-700' : 'text-slate-400'}`} />
                          <span>朝から</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateOutside(originalIndex, 'isAfternoon', !day.outside.isAfternoon)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                            day.outside.isAfternoon
                              ? 'bg-orange-200 text-orange-950 border-orange-400 shadow-2xs'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="午後から稼働"
                        >
                          <Sunset className={`w-3 h-3 ${day.outside.isAfternoon ? 'text-orange-700' : 'text-slate-400'}`} />
                          <span>午後から</span>
                        </button>
                      </div>
                    </td>

                    {/* 外現場: 備考 */}
                    <td className="py-1 px-1.5 border-r-2 border-amber-300">
                      <input
                        type="text"
                        placeholder="搬入時間、機材メモ等"
                        value={day.outside.notes}
                        onChange={(e) => onUpdateOutside(originalIndex, 'notes', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-amber-500 rounded focus:outline-none text-slate-700 transition"
                      />
                    </td>

                    {/* --- 【PARTY】 --- */}
                    {/* ライブハウスPARTY前段の日付欄 */}
                    <td className="py-1.5 px-1 text-center align-middle border-r border-slate-200 select-none bg-indigo-50/30">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium tracking-tight ${dateBadge}`}>
                        {day.dayNumber}日
                      </span>
                    </td>

                    {/* ライブハウスPARTY前段の曜日欄 (祝日マーク付き) */}
                    <td className="py-1.5 px-0.5 text-center align-middle border-r border-slate-200 select-none bg-indigo-50/30">
                      <div className="inline-flex items-center justify-center gap-0.5">
                        <span className={`inline-block w-5 py-0.2 text-[11px] text-center rounded border ${dayBadge}`}>
                          {day.dayOfWeek}
                        </span>
                        {isHol && (
                          <span
                            className="px-0.5 py-0.2 rounded bg-red-600 text-white font-bold text-[9px] leading-none"
                            title={day.holidayName ? `祝日: ${day.holidayName}` : '祝日'}
                          >
                            祝
                          </span>
                        )}
                      </div>
                    </td>

                    {/* PARTY: PA担当 (プルダウンでスタッフ5名選択) */}
                    <td className="py-1 px-1 border-r border-slate-200 bg-indigo-50/20">
                      <select
                        value={day.party.paStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'paStaff', e.target.value)}
                        className={`w-full py-1 px-1 text-xs rounded border transition cursor-pointer text-center font-medium ${
                          day.party.paStaff
                            ? 'bg-indigo-100 border-indigo-400 text-indigo-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        title="PA担当スタッフ"
                      >
                        <option value="">- (未定)</option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.paStaff && !staffNames.includes(day.party.paStaff) && (
                          <option value={day.party.paStaff} className="text-purple-700 font-medium">
                            {day.party.paStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: 照明 (プルダウンでスタッフ5名選択) */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <select
                        value={day.party.lightingStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'lightingStaff', e.target.value)}
                        className={`w-full py-1 px-1 text-xs rounded border transition cursor-pointer text-center font-medium ${
                          day.party.lightingStaff
                            ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        title="照明担当スタッフ"
                      >
                        <option value="">- (未定)</option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.lightingStaff && !staffNames.includes(day.party.lightingStaff) && (
                          <option value={day.party.lightingStaff} className="text-purple-700 font-medium">
                            {day.party.lightingStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: 受付 (プルダウンでスタッフ5名選択) */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <select
                        value={day.party.receptionStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'receptionStaff', e.target.value)}
                        className={`w-full py-1 px-1 text-xs rounded border transition cursor-pointer text-center font-medium ${
                          day.party.receptionStaff
                            ? 'bg-blue-100 border-blue-400 text-blue-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        title="受付担当スタッフ"
                      >
                        <option value="">- (未定)</option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.receptionStaff && !staffNames.includes(day.party.receptionStaff) && (
                          <option value={day.party.receptionStaff} className="text-purple-700 font-medium">
                            {day.party.receptionStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: ドリンク (プルダウンでスタッフ5名選択) */}
                    <td className="py-1 px-1 border-r border-slate-200">
                      <select
                        value={day.party.drinkStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'drinkStaff', e.target.value)}
                        className={`w-full py-1 px-1 text-xs rounded border transition cursor-pointer text-center font-medium ${
                          day.party.drinkStaff
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                        title="ドリンク担当スタッフ"
                      >
                        <option value="">- (未定)</option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.drinkStaff && !staffNames.includes(day.party.drinkStaff) && (
                          <option value={day.party.drinkStaff} className="text-purple-700 font-medium">
                            {day.party.drinkStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: SALA出演 チェック欄 */}
                    <td className="py-1 px-1 text-center border-r border-slate-200 bg-pink-50/50">
                      <button
                        type="button"
                        onClick={() => onUpdateParty(originalIndex, 'isSalaPerformance', !day.party.isSalaPerformance)}
                        className={`p-1 rounded transition ${
                          day.party.isSalaPerformance
                            ? 'text-pink-700 bg-pink-100 hover:bg-pink-200'
                            : 'text-slate-300 hover:text-slate-600 hover:bg-white'
                        }`}
                        title="SALA出演あり"
                      >
                        {day.party.isSalaPerformance ? (
                          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-pink-600 text-white font-bold text-[10px] shadow-2xs">
                            <Sparkle className="w-2.5 h-2.5" />
                            <span>SALA</span>
                          </div>
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* PARTY: イベント・備考 (必要人数・スタッフチェック列は削除) */}
                    <td className="py-1 px-1.5">
                      <input
                        type="text"
                        placeholder="イベント名、出演者、時間メモ"
                        value={day.party.notes}
                        onChange={(e) => onUpdateParty(originalIndex, 'notes', e.target.value)}
                        className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded focus:outline-none text-slate-700 transition"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
