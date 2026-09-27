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
  const weekdayHeaders = [
    { label: '日', isSunday: true, isSaturday: false },
    { label: '月', isSunday: false, isSaturday: false },
    { label: '火', isSunday: false, isSaturday: false },
    { label: '水', isSunday: false, isSaturday: false },
    { label: '木', isSunday: false, isSaturday: false },
    { label: '金', isSunday: false, isSaturday: false },
    { label: '土', isSunday: false, isSaturday: true },
  ];

  const firstDayOfWeek = days.length > 0 ? days[0].dayOfWeekIndex : 0;
  const leadingBlanks = Array.from({ length: firstDayOfWeek });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Month Title */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {year}年 {month}月 2現場カレンダー
          </h2>
          <p className="text-xs text-slate-500">
            各日の「外現場」とライブハウス「PARTY」の稼働を並べて確認できます（土曜：青 / 日祝：赤）
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold text-amber-800">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span>
            外現場
          </span>
          <span className="flex items-center gap-1 font-semibold text-indigo-800">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"></span>
            PARTY
          </span>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold">
        {weekdayHeaders.map((w, idx) => (
          <div
            key={idx}
            className={`py-2.5 border-r border-slate-200 last:border-r-0 ${
              w.isSunday
                ? 'text-red-700 bg-red-50/60'
                : w.isSaturday
                ? 'text-blue-700 bg-blue-50/60'
                : 'text-slate-700'
            }`}
          >
            {w.label}曜日
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} className="bg-slate-50/50 min-h-[140px] p-2" />
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

          // Checked staff names for party (「全員」は削除)
          const partyChecked = staffNames.filter((s) => day.party.staffCheck[s]).join('、');

          return (
            <div
              key={day.dateStr}
              className={`min-h-[150px] p-2 flex flex-col justify-between transition relative text-xs ${dayBg}`}
            >
              {/* Day Number Header */}
              <div>
                <div className={`flex items-center justify-between -mx-2 -mt-2 p-1.5 px-2 border-b border-slate-100 ${headerBg}`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm ${dateTextColor}`}>
                      {day.dayNumber}
                    </span>
                    {isHol && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-red-100 text-red-700 font-medium truncate max-w-[80px]" title={day.holidayName}>
                        {day.holidayName}
                      </span>
                    )}
                  </div>
                  {hasOutside && hasParty && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">
                      2現場重
                    </span>
                  )}
                </div>

                {/* Outside Site Card */}
                <div className="mt-1.5 space-y-1">
                  {hasOutside && (
                    <div className="p-1.5 rounded-lg bg-amber-50/90 border border-amber-200 text-[11px] shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span className="truncate flex items-center gap-1" title={day.outside.siteName}>
                          <Building2 className="w-3 h-3 text-amber-700 shrink-0" />
                          <span className="truncate">{day.outside.siteName}</span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {day.outside.isMorning && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">
                              朝
                            </span>
                          )}
                          {day.outside.isAfternoon && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-orange-200 text-orange-950 font-semibold">
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

                  {/* PARTY Card */}
                  {hasParty && (
                    <div className="p-1.5 rounded-lg bg-indigo-50/90 border border-indigo-200 text-[11px] shadow-2xs">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span className="truncate flex items-center gap-1">
                          <Music2 className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>PARTY</span>
                          {day.party.paStaff && (
                            <span className="font-normal text-indigo-800"> (PA:{day.party.paStaff})</span>
                          )}
                        </span>
                        {day.party.isSalaPerformance && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-pink-100 text-pink-700 font-bold border border-pink-200 shrink-0">
                            SALA
                          </span>
                        )}
                      </div>
                      {(day.party.lightingStaff || day.party.receptionStaff || day.party.drinkStaff) && (
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                          {[
                            day.party.lightingStaff && `照:${day.party.lightingStaff}`,
                            day.party.receptionStaff && `受:${day.party.receptionStaff}`,
                            day.party.drinkStaff && `D:${day.party.drinkStaff}`,
                          ].filter(Boolean).join(' | ')}
                        </div>
                      )}
                      {day.party.notes && (
                        <div className="text-[10px] text-indigo-900 mt-0.5 truncate">
                          {day.party.notes}
                        </div>
                      )}
                      {partyChecked && (
                        <div className="text-[10px] text-indigo-700 truncate font-medium">
                          👥 {partyChecked}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasOutside && !hasParty && (
                    <div className="text-center py-2 text-slate-300 text-[11px]">
                      -
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
