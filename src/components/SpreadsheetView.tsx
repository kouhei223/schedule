import React from 'react';
import { 
  Building2, 
  Music2, 
  CheckSquare2, 
  Square, 
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
}) => {
  return (
    <div className="space-y-1 w-full">
      {/* Main Dual-Site Spreadsheet Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        {/* Print Header */}
        <div className="hidden print:block p-3 border-b border-slate-300 text-center">
          <h2 className="text-lg font-bold text-slate-900">
            {year}年 {month}月 月間スケジュール、人員配置表
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">作成日: {new Date().toLocaleDateString('ja-JP')}</p>
        </div>

        <div className="overflow-x-auto max-h-[calc(100vh-115px)] sm:max-h-[calc(100vh-135px)]">
          <table className="w-full text-left border-collapse text-xs">
            {/* Top Multi-level Header */}
            <thead className="sticky top-0 z-20 shadow-2xs bg-white">
              {/* Category Header (Row 1): カレンダー固定、PARTYタイトルは備考まで伸ばす */}
              <tr className="border-b border-slate-300 select-none text-center bg-white">
                <th colSpan={2} className="sticky left-0 z-30 py-1 px-1 bg-slate-200 text-slate-800 font-bold border-r-2 border-slate-400 whitespace-nowrap text-[11px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>カレンダー</span>
                  </div>
                </th>
                <th colSpan={4 + staffNames.length} className="py-1 px-2 bg-amber-100 text-amber-950 font-bold border-r-2 border-slate-400 whitespace-nowrap text-[11px]">
                  <div className="flex items-center justify-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>外現場</span>
                  </div>
                </th>
                <th colSpan={6} className="py-1 px-2 bg-emerald-100 text-emerald-950 font-bold whitespace-nowrap text-[11px]">
                  <div className="flex items-center justify-center gap-1">
                    <Music2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PARTY</span>
                  </div>
                </th>
              </tr>

              {/* Column Detail Header (Row 2): 半透明を完全廃止し、スクロール時に裏の文字が透けないように不透明色を指定 */}
              <tr className="border-b-2 border-slate-300 font-semibold select-none text-[11px] bg-white">
                {/* Calendar Cols: スクロール時固定 (sticky left) */}
                <th className="sticky left-0 z-30 py-1.5 px-1 text-center border-r border-slate-200 bg-slate-100 text-slate-700 whitespace-nowrap min-w-[54px] w-[54px]">
                  日付
                </th>
                <th className="sticky left-[54px] z-30 py-1.5 px-1 text-center border-r-2 border-slate-400 bg-slate-100 text-slate-700 whitespace-nowrap min-w-[52px] w-[52px]" title="祝日の場合は小さく「祝」が表示されます">
                  曜日
                </th>

                {/* 現場1: 不透明なamber-100で統一してスクロール時の透けを防止 */}
                <th className="py-1.5 px-2 text-center min-w-[140px] border-r border-slate-200 bg-amber-100 text-amber-950 whitespace-nowrap">
                  現場名
                </th>
                <th className="py-1.5 px-1 w-11 text-center border-r border-slate-200 bg-amber-100 text-amber-950 font-bold whitespace-nowrap" title="全員チェック">
                  全員
                </th>
                {staffNames.map((name, i) => (
                  <th
                    key={`out-th-${name}-${i}`}
                    className="py-1.5 px-1 min-w-[50px] text-center border-r border-slate-200 bg-amber-100 text-amber-950 truncate whitespace-nowrap"
                    title={name}
                  >
                    {name}
                  </th>
                ))}
                <th className="py-1.5 px-1 text-center border-r border-slate-200 bg-amber-100 text-amber-950 whitespace-nowrap min-w-[105px]">
                  出勤時間
                </th>
                <th className="py-1.5 px-2 text-center min-w-[130px] border-r-2 border-slate-400 bg-amber-100 text-amber-950 whitespace-nowrap">
                  備考
                </th>

                {/* 現場2 (PARTY): 不透明なemerald-100で統一してスクロール時の透けを防止、幅は68px */}
                <th className="py-1.5 px-0.5 text-center border-r border-slate-200 bg-emerald-100 text-emerald-950 font-bold whitespace-nowrap min-w-[68px] w-[68px]">
                  PA
                </th>
                <th className="py-1.5 px-0.5 text-center border-r border-slate-200 bg-emerald-100 text-emerald-950 font-bold whitespace-nowrap min-w-[68px] w-[68px]">
                  照明
                </th>
                <th className="py-1.5 px-0.5 text-center border-r border-slate-200 bg-emerald-100 text-emerald-950 font-bold whitespace-nowrap min-w-[68px] w-[68px]">
                  受付
                </th>
                <th className="py-1.5 px-0.5 text-center border-r border-slate-200 bg-emerald-100 text-emerald-950 font-bold whitespace-nowrap min-w-[68px] w-[68px]">
                  ドリンク
                </th>
                <th className="py-1.5 px-1 w-16 text-center border-r border-slate-200 bg-pink-100 text-pink-900 font-bold whitespace-nowrap" title="SALA出演">
                  SALA出演
                </th>
                <th className="py-1.5 px-2 text-center min-w-[140px] bg-emerald-100 text-emerald-950 whitespace-nowrap">
                  備考
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {days.map((day, originalIndex) => {
                const isSat = day.isSaturday;
                const isSun = day.isSunday;
                const isHol = day.isHoliday;

                // 1日の行の背景色は一覧のカレンダー項目と揃える（土日祝のみうっすら色をつける、PARTYセクションも同様）
                let rowBg = 'bg-white hover:bg-slate-50/80';
                let stickyDateBg = 'bg-white';
                let dateBadge = 'bg-slate-100 text-slate-800';
                let dayBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                let borderAccent = 'border-l-4 border-l-transparent';

                if (isHol || isSun) {
                  rowBg = 'bg-red-50/35 hover:bg-red-50/60';
                  stickyDateBg = 'bg-[#fdf2f2]';
                  dateBadge = 'bg-red-100 text-red-700 font-bold';
                  dayBadge = 'bg-red-100 text-red-700 border-red-300 font-bold';
                  borderAccent = 'border-l-4 border-l-red-500';
                } else if (isSat) {
                  rowBg = 'bg-blue-50/35 hover:bg-blue-50/60';
                  stickyDateBg = 'bg-[#f0f7ff]';
                  dateBadge = 'bg-blue-100 text-blue-700 font-bold';
                  dayBadge = 'bg-blue-100 text-blue-700 border-blue-300 font-bold';
                  borderAccent = 'border-l-4 border-l-blue-500';
                }

                const outAllChecked = day.outside.staffCheck.all;

                return (
                  <tr key={day.dateStr} className={`transition-colors duration-100 ${rowBg}`}>
                    {/* 日付 (左端固定: 横スクロール時も固定表示) */}
                    <td className={`sticky left-0 z-10 py-1 px-1 text-center align-middle border-r border-slate-200 select-none whitespace-nowrap min-w-[54px] w-[54px] ${stickyDateBg} ${borderAccent}`}>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs tracking-normal font-bold whitespace-nowrap ${dateBadge}`}>
                        {day.dayNumber}日
                      </span>
                    </td>

                    {/* 曜日 (左端固定: 横スクロール時も固定表示) */}
                    <td className={`sticky left-[54px] z-10 py-1 px-1 text-center align-middle border-r-2 border-slate-400 select-none whitespace-nowrap min-w-[52px] w-[52px] ${stickyDateBg}`}>
                      <div className="relative flex items-center justify-center">
                        <span className={`inline-block w-6 py-0.5 text-xs text-center rounded border ${dayBadge}`}>
                          {day.dayOfWeek}
                        </span>
                        {isHol && (
                          <span
                            className="absolute -top-1 -right-0.5 px-0.5 py-0.1 rounded bg-red-600 text-white font-bold text-[9px] leading-tight shadow-2xs pointer-events-none"
                            title={day.holidayName ? `祝日: ${day.holidayName}` : '祝日'}
                          >
                            祝
                          </span>
                        )}
                      </div>
                    </td>

                    {/* --- 【外現場】 --- */}
                    {/* 現場名 (グレーの案内テキストは削除) */}
                    <td className="py-0.5 px-1.5 border-r border-slate-200">
                      <input
                        type="text"
                        value={day.outside.siteName}
                        onChange={(e) => onUpdateOutside(originalIndex, 'siteName', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-amber-500 rounded focus:outline-none font-medium text-slate-800 transition"
                      />
                    </td>

                    {/* 外: 全員チェック */}
                    <td className="py-0.5 px-1 text-center border-r border-slate-200">
                      <button
                        type="button"
                        onClick={() => onToggleOutsideAllCheck(originalIndex)}
                        className={`p-1 rounded transition ${
                          outAllChecked ? 'text-amber-800 bg-amber-200 hover:bg-amber-300' : 'text-slate-300 hover:text-slate-600 hover:bg-white'
                        }`}
                        title="外現場: 全員出勤"
                      >
                        {outAllChecked ? <CheckSquare2 className="w-4 h-4 fill-amber-700 text-white" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* 外: スタッフ5人個別チェック */}
                    {staffNames.map((name) => {
                      const isChecked = outAllChecked || Boolean(day.outside.staffCheck.staff[name]);
                      return (
                        <td
                          key={`out-cell-${name}`}
                          className="py-0.5 px-1 text-center border-r border-slate-200"
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

                    {/* 外現場: 出勤時間 (午前/午後) */}
                    <td className="py-0.5 px-1 border-r border-slate-200 whitespace-nowrap min-w-[105px]">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateOutside(originalIndex, 'isMorning', !day.outside.isMorning)}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                            day.outside.isMorning
                              ? 'bg-amber-200 text-amber-900 border-amber-400 shadow-2xs font-bold'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="午前から稼働"
                        >
                          <Sun className={`w-3 h-3 ${day.outside.isMorning ? 'text-amber-700' : 'text-slate-400'}`} />
                          <span>午前</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onUpdateOutside(originalIndex, 'isAfternoon', !day.outside.isAfternoon)}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                            day.outside.isAfternoon
                              ? 'bg-orange-200 text-orange-950 border-orange-400 shadow-2xs font-bold'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-700'
                          }`}
                          title="午後から稼働"
                        >
                          <Sunset className={`w-3 h-3 ${day.outside.isAfternoon ? 'text-orange-700' : 'text-slate-400'}`} />
                          <span>午後</span>
                        </button>
                      </div>
                    </td>

                    {/* 外現場: 備考 (グレーの案内テキストは削除、境界線はカレンダーと同じslate-400) */}
                    <td className="py-0.5 px-1.5 border-r-2 border-slate-400">
                      <input
                        type="text"
                        value={day.outside.notes}
                        onChange={(e) => onUpdateOutside(originalIndex, 'notes', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-amber-500 rounded focus:outline-none text-slate-700 transition"
                      />
                    </td>

                    {/* --- 【PARTY】（前段カレンダー列は削除、プルダウン背景色なし・未定文字削除・幅短縮） --- */}
                    {/* PARTY: PA (幅68px、背景色なし、未定文字なし) */}
                    <td className="py-0.5 px-0.5 border-r border-slate-200 min-w-[68px] w-[68px]">
                      <select
                        value={day.party.paStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'paStaff', e.target.value)}
                        className="w-full py-1 px-0.5 text-xs rounded border border-slate-300 bg-transparent text-center font-bold text-slate-800 hover:border-slate-400 focus:outline-none focus:bg-white cursor-pointer truncate"
                        title="PA"
                      >
                        <option value=""></option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.paStaff && !staffNames.includes(day.party.paStaff) && (
                          <option value={day.party.paStaff} className="text-emerald-700 font-medium">
                            {day.party.paStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: 照明 (幅68px、背景色なし、未定文字なし) */}
                    <td className="py-0.5 px-0.5 border-r border-slate-200 min-w-[68px] w-[68px]">
                      <select
                        value={day.party.lightingStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'lightingStaff', e.target.value)}
                        className="w-full py-1 px-0.5 text-xs rounded border border-slate-300 bg-transparent text-center font-bold text-slate-800 hover:border-slate-400 focus:outline-none focus:bg-white cursor-pointer truncate"
                        title="照明"
                      >
                        <option value=""></option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.lightingStaff && !staffNames.includes(day.party.lightingStaff) && (
                          <option value={day.party.lightingStaff} className="text-emerald-700 font-medium">
                            {day.party.lightingStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: 受付 (幅68px、背景色なし、未定文字なし) */}
                    <td className="py-0.5 px-0.5 border-r border-slate-200 min-w-[68px] w-[68px]">
                      <select
                        value={day.party.receptionStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'receptionStaff', e.target.value)}
                        className="w-full py-1 px-0.5 text-xs rounded border border-slate-300 bg-transparent text-center font-bold text-slate-800 hover:border-slate-400 focus:outline-none focus:bg-white cursor-pointer truncate"
                        title="受付"
                      >
                        <option value=""></option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.receptionStaff && !staffNames.includes(day.party.receptionStaff) && (
                          <option value={day.party.receptionStaff} className="text-emerald-700 font-medium">
                            {day.party.receptionStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: ドリンク (幅68px、背景色なし、未定文字なし) */}
                    <td className="py-0.5 px-0.5 border-r border-slate-200 min-w-[68px] w-[68px]">
                      <select
                        value={day.party.drinkStaff}
                        onChange={(e) => onUpdateParty(originalIndex, 'drinkStaff', e.target.value)}
                        className="w-full py-1 px-0.5 text-xs rounded border border-slate-300 bg-transparent text-center font-bold text-slate-800 hover:border-slate-400 focus:outline-none focus:bg-white cursor-pointer truncate"
                        title="ドリンク"
                      >
                        <option value=""></option>
                        {staffNames.map((name) => (
                          <option key={name} value={name} className="text-slate-900 font-medium">
                            {name}
                          </option>
                        ))}
                        {day.party.drinkStaff && !staffNames.includes(day.party.drinkStaff) && (
                          <option value={day.party.drinkStaff} className="text-emerald-700 font-medium">
                            {day.party.drinkStaff}
                          </option>
                        )}
                      </select>
                    </td>

                    {/* PARTY: SALA出演 チェック欄 */}
                    <td className="py-0.5 px-1 text-center border-r border-slate-200">
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

                    {/* PARTY: 備考 (グレーの案内テキストは削除) */}
                    <td className="py-0.5 px-1.5">
                      <input
                        type="text"
                        value={day.party.notes}
                        onChange={(e) => onUpdateParty(originalIndex, 'notes', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded focus:outline-none text-slate-700 transition"
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
