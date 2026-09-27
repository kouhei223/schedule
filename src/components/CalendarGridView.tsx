import React from 'react';
import { DualSiteDayRow } from '../types/schedule';
import { Building2, Music2, Sun, Sunset, Sparkle } from 'lucide-react';

interface CalendarGridViewProps {
  days: DualSiteDayRow[];
  year: number;
  month: number;
  staffNames: string[];
}

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  days,
  year,
  month,
  staffNames,
}) => {
  // 月曜始まり
  const weekdayHeaders = [
    { label: '月', isSunday: false, isSaturday: false },
    { label: '火', isSunday: false, isSaturday: false },
    { label: '水', isSunday: false, isSaturday: false },
    { label: '木', isSunday: false, isSaturday: false },
    { label: '金', isSunday: false, isSaturday: false },
    { label: '土', isSunday: false, isSaturday: true },
    { label: '日', isSunday: true, isSaturday: false },
  ];

  // 日曜始まり(0..6)を月曜始まり(0:月..6:日)に換算してブランク数を算出
  const firstDaySundayBased = days.length > 0 ? days[0].dayOfWeekIndex : 0;
  const leadingBlanksCount = (firstDaySundayBased + 6) % 7;
  const leadingBlanks = Array.from({ length: leadingBlanksCount });

  // 最終日（30日・31日）以降の末尾ブランクを算出し、完全な7列グリッドを形成
  const totalCells = leadingBlanksCount + days.length;
  const trailingBlanksCount = (7 - (totalCells % 7)) % 7;
  const trailingBlanks = Array.from({ length: trailingBlanksCount });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Month Title: 2現場カレンダー → カレンダーに変更、説明文は削除 */}
      <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-bold text-slate-900">
          {year}年 {month}月 カレンダー
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-amber-800">
            <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-950 font-black text-[9px]">外</span>
            外現場
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black text-[9px]">P</span>
            PARTY
          </span>
        </div>
      </div>

      {/* Weekday Headers (月曜始まり) */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold">
        {weekdayHeaders.map((w, idx) => (
          <div
            key={idx}
            className={`py-2 border-r border-slate-200 last:border-r-0 ${
              w.isSunday
                ? 'text-red-700 bg-red-50/60'
                : w.isSaturday
                ? 'text-blue-700 bg-blue-50/60'
                : 'text-slate-700'
            }`}
          >
            {w.label}
          </div>
        ))}
      </div>

      {/* Days Grid: 30日・31日など末尾まで途切れず完全なグリッド線を表示 */}
      <div className="grid grid-cols-7 border-l border-slate-200">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-lead-${i}`} className="bg-slate-50/50 min-h-[130px] p-1.5 border-r border-b border-slate-200" />
        ))}

        {days.map((day) => {
          const isSat = day.isSaturday;
          const isSun = day.isSunday;
          const isHol = day.isHoliday;

          let dayBg = 'bg-white hover:bg-slate-50/70';
          let dateTextColor = 'text-slate-900';
          let headerBg = 'bg-slate-50/70';

          if (isHol || isSun) {
            dayBg = 'bg-red-50/20 hover:bg-red-50/40';
            dateTextColor = 'text-red-700 font-bold';
            headerBg = 'bg-red-50/50';
          } else if (isSat) {
            dayBg = 'bg-blue-50/20 hover:bg-blue-50/40';
            dateTextColor = 'text-blue-700 font-bold';
            headerBg = 'bg-blue-50/50';
          }

          const hasOutside = Boolean(day.outside.siteName);
          const hasParty = Boolean(
            day.party.paStaff || 
            day.party.lightingStaff || 
            day.party.receptionStaff || 
            day.party.drinkStaff || 
            day.party.notes ||
            day.party.isSalaPerformance
          );

          // Checked staff names for outside
          const outChecked = day.outside.staffCheck.all
            ? '全員'
            : staffNames.filter((s) => day.outside.staffCheck.staff[s]).join('、');

          // Checked staff names for party
          const partyChecked = staffNames.filter((s) => day.party.staffCheck[s]).join('、');

          return (
            <div
              key={day.dateStr}
              className={`min-h-[140px] p-1.5 flex flex-col justify-between transition relative text-xs border-r border-b border-slate-200 ${dayBg}`}
            >
              {/* Day Number Header */}
              <div>
                <div className={`flex items-center justify-between -mx-1.5 -mt-1.5 p-1 px-1.5 border-b border-slate-100 ${headerBg}`}>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className={`text-xs sm:text-sm ${dateTextColor}`}>
                      {day.dayNumber}
                    </span>
                    {isHol && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-red-100 text-red-700 font-medium truncate max-w-[65px]" title={day.holidayName}>
                        {day.holidayName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Outside Site Card: [外] 略称表示 */}
                <div className="mt-1 space-y-1">
                  {hasOutside && (
                    <div className="p-1 rounded bg-amber-50/90 border border-amber-200 text-[11px] shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-amber-950 gap-0.5">
                        <span className="truncate flex items-center gap-1" title={day.outside.siteName}>
                          <span className="px-1 py-0.2 rounded bg-amber-200 text-amber-950 font-black text-[9px] shrink-0">外</span>
                          <span className="truncate">{day.outside.siteName}</span>
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {day.outside.isMorning && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">
                              午前
                            </span>
                          )}
                          {day.outside.isAfternoon && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-orange-200 text-orange-950 font-semibold">
                              午後
                            </span>
                          )}
                        </div>
                      </div>
                      {outChecked && (
                        <div className="text-[10px] text-amber-900 mt-0.5 truncate font-medium">
                          👤 {outChecked}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PARTY Card: [P] 略称表示、緑系（エメラルド）配色 */}
                  {hasParty && (
                    <div className="p-1 rounded bg-emerald-50/90 border border-emerald-200 text-[11px] shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-emerald-950 gap-0.5">
                        <span className="truncate flex items-center gap-1">
                          <span className="px-1 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black text-[9px] shrink-0">P</span>
                          {day.party.paStaff ? (
                            <span className="truncate text-emerald-900 text-[10px]">PA:{day.party.paStaff}</span>
                          ) : (
                            <span className="truncate text-emerald-900 text-[10px]">PARTY</span>
                          )}
                        </span>
                        {day.party.isSalaPerformance && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-pink-100 text-pink-700 font-bold border border-pink-200 shrink-0">
                            SALA
                          </span>
                        )}
                      </div>
                      {(day.party.lightingStaff || day.party.receptionStaff || day.party.drinkStaff) && (
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                          {[
                            day.party.lightingStaff && `照:${day.party.lightingStaff}`,
                            day.party.receptionStaff && `受:${day.party.receptionStaff}`,
                            day.party.drinkStaff && `ド:${day.party.drinkStaff}`,
                          ].filter(Boolean).join(' | ')}
                        </div>
                      )}
                      {day.party.notes && (
                        <div className="text-[10px] text-emerald-900 mt-0.5 truncate">
                          {day.party.notes}
                        </div>
                      )}
                      {partyChecked && (
                        <div className="text-[10px] text-emerald-700 truncate font-medium">
                          👥 {partyChecked}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasOutside && !hasParty && (
                    <div className="text-center py-1.5 text-slate-300 text-[11px]">
                      -
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* 最終週の不足マスを埋めて完全なグリッドにする */}
        {trailingBlanks.map((_, i) => (
          <div key={`blank-trail-${i}`} className="bg-slate-50/50 min-h-[130px] p-1.5 border-r border-b border-slate-200" />
        ))}
      </div>
    </div>
  );
};
