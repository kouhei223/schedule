import React from 'react';
import { DualSiteDayRow } from '../types/schedule';
import { Users, Building2, Music2, Disc } from 'lucide-react';

interface StaffSummaryProps {
  days: DualSiteDayRow[];
  year: number;
  month: number;
  staffNames: string[];
}

export const StaffSummary: React.FC<StaffSummaryProps> = ({
  days,
  year,
  month,
  staffNames,
}) => {
  // Aggregate stats per staff member
  const stats = staffNames.map((name) => {
    let outsideDays = 0;
    let partyDays = 0;
    let dualSiteDays = 0; // Both on same day

    days.forEach((d) => {
      const isOutsideChecked = d.outside.staffCheck.all || Boolean(d.outside.staffCheck.staff[name]);
      const isPartyChecked = Boolean(d.party.staffCheck[name]);

      const hasOutsideSite = Boolean(d.outside.siteName);
      const hasPartySite = Boolean(
        d.party.paStaff || 
        d.party.lightingStaff || 
        d.party.receptionStaff || 
        d.party.drinkStaff || 
        d.party.notes ||
        d.party.isSalaPerformance
      );

      const workedOutside = hasOutsideSite && isOutsideChecked;
      const workedParty = hasPartySite && isPartyChecked;

      if (workedOutside) outsideDays++;
      if (workedParty) partyDays++;
      if (workedOutside && workedParty) dualSiteDays++;
    });

    return {
      name,
      outsideDays,
      partyDays,
      dualSiteDays,
      totalWorkDays: outsideDays + partyDays - dualSiteDays,
    };
  });

  // Total site days
  let totalOutsideDays = 0;
  let totalPartyDays = 0;
  let totalBothDays = 0;

  days.forEach((d) => {
    const hasOut = Boolean(d.outside.siteName);
    const hasP = Boolean(
      d.party.paStaff || 
      d.party.lightingStaff || 
      d.party.receptionStaff || 
      d.party.drinkStaff || 
      d.party.notes ||
      d.party.isSalaPerformance
    );
    if (hasOut) totalOutsideDays++;
    if (hasP) totalPartyDays++;
    if (hasOut && hasP) totalBothDays++;
  });

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">外現場 稼働日数</span>
            <Building2 className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalOutsideDays}</span>
            <span className="text-xs text-slate-500">日 / 今月</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ホール・野外・出向音響現場の合計</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">PARTY 稼働日数</span>
            <Music2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalPartyDays}</span>
            <span className="text-xs text-slate-500">日 / 今月</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ライブハウス「PARTY」のイベント・通常営業</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
          <div className="flex items-center justify-between text-purple-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">2現場同時稼働日 (多忙日)</span>
            <Disc className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900">{totalBothDays}</span>
            <span className="text-xs text-purple-700">日間</span>
          </div>
          <p className="text-[11px] text-purple-800 mt-1">外現場とPARTYが重なる日（スタッフ調整が重要）</p>
        </div>
      </div>

      {/* Staff Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              スタッフ5名の現場別 出勤日数集計
            </h3>
          </div>
          <span className="text-xs text-slate-500">{year}年 {month}月度</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">スタッフ名</th>
                <th className="py-2.5 px-4 text-center bg-amber-50/50 text-amber-900">外現場 出勤</th>
                <th className="py-2.5 px-4 text-center bg-indigo-50/50 text-indigo-900">PARTY 出勤</th>
                <th className="py-2.5 px-4 text-center bg-purple-50/50 text-purple-900">同日2現場</th>
                <th className="py-2.5 px-4 text-center font-bold">実稼働日数 (合計)</th>
                <th className="py-2.5 px-4">稼働バランス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats.map((s) => (
                <tr key={s.name} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-amber-800 bg-amber-50/20">
                    {s.outsideDays} 日
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-indigo-800 bg-indigo-50/20">
                    {s.partyDays} 日
                  </td>
                  <td className="py-3 px-4 text-center text-purple-700 font-semibold bg-purple-50/20">
                    {s.dualSiteDays} 日
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                    {s.totalWorkDays} 日間
                  </td>
                  <td className="py-3 px-4 min-w-[160px]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 flex overflow-hidden">
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${s.totalWorkDays > 0 ? (s.outsideDays / (s.outsideDays + s.partyDays || 1)) * 100 : 0}%` }}
                          title={`外現場: ${s.outsideDays}日`}
                        />
                        <div
                          className="bg-indigo-500 h-full"
                          style={{ width: `${s.totalWorkDays > 0 ? (s.partyDays / (s.outsideDays + s.partyDays || 1)) * 100 : 0}%` }}
                          title={`PARTY: ${s.partyDays}日`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.outsideDays}外 / {s.partyDays}P
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
