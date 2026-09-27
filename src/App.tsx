import React, { useState, useEffect, useCallback } from 'react';
import { 
  DualSiteDayRow, 
  OutsideSiteDayData, 
  PartySiteDayData, 
  DEFAULT_STAFF_MEMBERS, 
  ViewMode 
} from './types/schedule';
import { 
  DAY_NAMES, 
  getDaysInMonth, 
  getHolidaysForYear, 
  getHolidayInfo, 
  formatDateStr,
  fetchLiveJapaneseHolidays
} from './utils/holidays';
import { 
  exportDualSiteToExcel, 
  generateDualSiteTSV 
} from './utils/exportSpreadsheet';
import { Header } from './components/Header';
import { DualSpreadsheetView } from './components/SpreadsheetView';
import { CalendarGridView } from './components/CalendarGridView';
import { StaffSummary } from './components/SummaryStats';
import { GoogleSheetsGuideModal } from './components/GoogleSheetsGuideModal';
import { StaffNamesModal } from './components/StaffNamesModal';
import { 
  HelpCircle, 
  ArrowRight
} from 'lucide-react';

export default function App() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);

  // 5 Staff Names
  const [staffNames, setStaffNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sound_company_staff_names');
      return saved ? JSON.parse(saved) : DEFAULT_STAFF_MEMBERS;
    } catch {
      return DEFAULT_STAFF_MEMBERS;
    }
  });

  const [days, setDays] = useState<DualSiteDayRow[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dual-spreadsheet');
  const [liveHolidays, setLiveHolidays] = useState<Map<string, string>>(new Map());
  const [isLiveHolidaySync, setIsLiveHolidaySync] = useState(false);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Save staff names to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sound_company_staff_names', JSON.stringify(staffNames));
    } catch (e) {
      console.error(e);
    }
  }, [staffNames]);

  // Fetch live Japanese holidays on mount from trusted public source
  useEffect(() => {
    let isMounted = true;
    fetchLiveJapaneseHolidays().then((map) => {
      if (isMounted && map.size > 0) {
        setLiveHolidays(map);
        setIsLiveHolidaySync(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Build calendar for year/month
  const buildDualCalendar = useCallback(
    (targetYear: number, targetMonth: number, currentStaff: string[], remoteHolidays: Map<string, string>): DualSiteDayRow[] => {
      const totalDays = getDaysInMonth(targetYear, targetMonth);
      const holidayMap = getHolidaysForYear(targetYear, remoteHolidays);

      const storageKey = `sound_dual_schedule_${targetYear}_${targetMonth}`;
      let savedData: Record<number, { outside: OutsideSiteDayData; party: PartySiteDayData }> = {};
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          savedData = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Error loading saved dual schedule', e);
      }

      const rows: DualSiteDayRow[] = [];

      for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dateObj = new Date(targetYear, targetMonth - 1, dayNum);
        const dayOfWeekIdx = dateObj.getDay();
        const dayOfWeek = DAY_NAMES[dayOfWeekIdx];
        const isSat = dayOfWeekIdx === 6;
        const isSun = dayOfWeekIdx === 0;
        const holiday = getHolidayInfo(targetYear, targetMonth, dayNum, holidayMap);

        const existing = savedData[dayNum];

        const defaultOutside: OutsideSiteDayData = {
          siteName: '',
          isMorning: false,
          isAfternoon: false,
          staffCheck: {
            all: false,
            staff: {},
          },
          notes: '',
        };

        const defaultParty: PartySiteDayData = {
          paStaff: '',
          lightingStaff: '',
          receptionStaff: '',
          drinkStaff: '',
          isSalaPerformance: false,
          requiredStaffCount: 0,
          staffCheck: {},
          notes: '',
        };

        const outside = existing ? existing.outside : defaultOutside;
        const party = existing ? existing.party : defaultParty;

        // Ensure staff keys exist
        currentStaff.forEach((name) => {
          if (outside.staffCheck.staff[name] === undefined) {
            outside.staffCheck.staff[name] = false;
          }
          if (party.staffCheck[name] === undefined) {
            party.staffCheck[name] = false;
          }
        });

        rows.push({
          dateStr: formatDateStr(targetYear, targetMonth, dayNum),
          dayNumber: dayNum,
          dayOfWeek,
          dayOfWeekIndex: dayOfWeekIdx,
          isSaturday: isSat,
          isSunday: isSun,
          isHoliday: holiday.isHoliday,
          holidayName: holiday.name,
          outside,
          party,
        });
      }

      return rows;
    },
    []
  );

  // Sync days when year, month, or holidays change
  useEffect(() => {
    const newDays = buildDualCalendar(year, month, staffNames, liveHolidays);
    setDays(newDays);
  }, [year, month, staffNames, liveHolidays, buildDualCalendar]);

  // Persist current month
  const persistDays = useCallback((currentDays: DualSiteDayRow[]) => {
    try {
      const storageKey = `sound_dual_schedule_${year}_${month}`;
      const toSave: Record<number, { outside: OutsideSiteDayData; party: PartySiteDayData }> = {};
      currentDays.forEach((d) => {
        toSave[d.dayNumber] = {
          outside: d.outside,
          party: d.party,
        };
      });
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to persist dual schedule', e);
    }
  }, [year, month]);

  // Handlers for Outside Site
  const handleUpdateOutside = (dayIndex: number, field: keyof OutsideSiteDayData, value: any) => {
    setDays((prev) => {
      const updated = prev.map((d, idx) => {
        if (idx !== dayIndex) return d;
        return {
          ...d,
          outside: {
            ...d.outside,
            [field]: value,
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  const handleToggleOutsideStaffCheck = (dayIndex: number, staffName: string) => {
    setDays((prev) => {
      const updated = prev.map((d, idx) => {
        if (idx !== dayIndex) return d;
        const current = Boolean(d.outside.staffCheck.staff[staffName]);
        const nextStaff = {
          ...d.outside.staffCheck.staff,
          [staffName]: !current,
        };
        const nextAll = d.outside.staffCheck.all && current ? false : d.outside.staffCheck.all;

        return {
          ...d,
          outside: {
            ...d.outside,
            staffCheck: {
              all: nextAll,
              staff: nextStaff,
            },
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  const handleToggleOutsideAllCheck = (dayIndex: number) => {
    setDays((prev) => {
      const updated = prev.map((d, idx) => {
        if (idx !== dayIndex) return d;
        const nextAll = !d.outside.staffCheck.all;
        const nextStaff: Record<string, boolean> = {};
        staffNames.forEach((s) => {
          nextStaff[s] = nextAll;
        });

        return {
          ...d,
          outside: {
            ...d.outside,
            staffCheck: {
              all: nextAll,
              staff: nextStaff,
            },
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  // Handlers for PARTY Site
  const handleUpdateParty = (dayIndex: number, field: keyof PartySiteDayData, value: any) => {
    setDays((prev) => {
      const updated = prev.map((d, idx) => {
        if (idx !== dayIndex) return d;
        return {
          ...d,
          party: {
            ...d.party,
            [field]: value,
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  const handleTogglePartyStaffCheck = (dayIndex: number, staffName: string) => {
    setDays((prev) => {
      const updated = prev.map((d, idx) => {
        if (idx !== dayIndex) return d;
        const current = Boolean(d.party.staffCheck[staffName]);
        const nextStaff = {
          ...d.party.staffCheck,
          [staffName]: !current,
        };

        return {
          ...d,
          party: {
            ...d.party,
            staffCheck: nextStaff,
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  // Sample data specifically for Sound Company (Outside + PARTY)
  const handleLoadAudioSampleData = () => {
    setDays((prev) => {
      const updated = prev.map((d) => {
        const isWeekend = d.isSaturday || d.isSunday || d.isHoliday;

        let outside: OutsideSiteDayData = {
          siteName: '',
          isMorning: false,
          isAfternoon: false,
          staffCheck: { all: false, staff: {} },
          notes: '',
        };

        let party: PartySiteDayData = {
          paStaff: '',
          lightingStaff: '',
          receptionStaff: '',
          drinkStaff: '',
          isSalaPerformance: false,
          requiredStaffCount: 0,
          staffCheck: {},
          notes: '',
        };

        // Initialize false
        staffNames.forEach((s) => {
          outside.staffCheck.staff[s] = false;
          party.staffCheck[s] = false;
        });

        if (d.dayNumber === 5 || d.dayNumber === 12 || d.dayNumber === 19 || d.dayNumber === 26) {
          // Friday club / band event at PARTY
          party = {
            paStaff: staffNames[0] || 'スタッフ1',
            lightingStaff: staffNames[1] || 'スタッフ2',
            receptionStaff: staffNames[2] || 'スタッフ3',
            drinkStaff: staffNames[3] || 'スタッフ4',
            isSalaPerformance: d.dayNumber === 19,
            requiredStaffCount: 2,
            staffCheck: {},
            notes: '定期バンドNight (オープン18:00)',
          };
        }

        if (isWeekend) {
          // Weekend: Both sites often active!
          outside = {
            siteName: d.isSaturday ? '市民会館大ホール 音響出向' : '野外音楽フェス PA設営・本番',
            isMorning: true,
            isAfternoon: false,
            staffCheck: {
              all: d.isSunday,
              staff: {
                [staffNames[0]]: true,
                [staffNames[1]]: true,
                [staffNames[2]]: true,
                [staffNames[3]]: d.isSunday,
                [staffNames[4]]: d.isSunday,
              },
            },
            notes: d.isSaturday ? 'ワイヤレス8波 / 機材車9:00搬入' : 'メイン卓CL5 / 雨天対策',
          };

          party = {
            paStaff: staffNames[3] || 'スタッフ4',
            lightingStaff: staffNames[4] || 'スタッフ5',
            receptionStaff: staffNames[1] || 'スタッフ2',
            drinkStaff: staffNames[2] || 'スタッフ3',
            isSalaPerformance: d.isSunday,
            requiredStaffCount: 2,
            staffCheck: {},
            notes: d.isSaturday ? 'ワンマンライブ (リハ14:00)' : 'アコースティック企画',
          };
        } else if (d.dayNumber % 4 === 1) {
          // Regular weekday PARTY booking
          party = {
            paStaff: staffNames[2] || 'スタッフ3',
            lightingStaff: staffNames[0] || 'スタッフ1',
            receptionStaff: staffNames[3] || 'スタッフ4',
            drinkStaff: staffNames[4] || 'スタッフ5',
            isSalaPerformance: false,
            requiredStaffCount: 1,
            staffCheck: {},
            notes: 'ホールレンタル / リハ17:00',
          };
        }

        return {
          ...d,
          outside,
          party,
        };
      });

      persistDays(updated);
      return updated;
    });
  };

  // Clear Month
  const handleClearMonth = () => {
    if (!window.confirm(`${year}年${month}月の予定入力をすべてリセットしますか？`)) return;
    setDays((prev) => {
      const updated = prev.map((d) => {
        const outStaff: Record<string, boolean> = {};
        const pStaff: Record<string, boolean> = {};
        staffNames.forEach((s) => {
          outStaff[s] = false;
          pStaff[s] = false;
        });

        return {
          ...d,
          outside: {
            siteName: '',
            isMorning: false,
            isAfternoon: false,
            staffCheck: { all: false, staff: outStaff },
            notes: '',
          },
          party: {
            paStaff: '',
            lightingStaff: '',
            receptionStaff: '',
            drinkStaff: '',
            isSalaPerformance: false,
            requiredStaffCount: 0,
            staffCheck: pStaff,
            notes: '',
          },
        };
      });
      persistDays(updated);
      return updated;
    });
  };

  // Month navigators
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  // Exports
  const handleCopyTSV = () => {
    const tsv = generateDualSiteTSV(year, month, days, staffNames);
    navigator.clipboard.writeText(tsv);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const handleExportExcel = () => {
    exportDualSiteToExcel(year, month, days, staffNames);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        year={year}
        month={month}
        viewMode={viewMode}
        staffNames={staffNames}
        isLiveHolidaySync={isLiveHolidaySync}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onTodayMonth={handleTodayMonth}
        onViewModeChange={setViewMode}
        onExportExcel={handleExportExcel}
        onCopyTSV={handleCopyTSV}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onPrint={handlePrint}
        copyFeedback={copyFeedback}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Subtle quick tips bar for users */}
        <div className="bg-white/90 border border-slate-200 rounded-xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs print:hidden">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              A1セル連動: {month}月 ({year}年)
            </span>
            <span className="text-slate-600">
              土曜（青）・日曜祝日（赤）自動着色 | 【外現場】と【PARTY（前段日付付き・PA/照明/受付/ドリンク/SALA）】の2現場同時管理
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>A1自動連動数式・内閣府祝日API設定を見る</span>
              <ArrowRight className="w-3 h-3 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        {viewMode === 'dual-spreadsheet' && (
          <DualSpreadsheetView
            days={days}
            year={year}
            month={month}
            staffNames={staffNames}
            onUpdateOutside={handleUpdateOutside}
            onUpdateParty={handleUpdateParty}
            onToggleOutsideStaffCheck={handleToggleOutsideStaffCheck}
            onToggleOutsideAllCheck={handleToggleOutsideAllCheck}
            onTogglePartyStaffCheck={handleTogglePartyStaffCheck}
            onLoadAudioSampleData={handleLoadAudioSampleData}
            onClearMonth={handleClearMonth}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarGridView
            days={days}
            year={year}
            month={month}
            staffNames={staffNames}
          />
        )}

        {viewMode === 'staff-summary' && (
          <StaffSummary
            days={days}
            year={year}
            month={month}
            staffNames={staffNames}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-2.5 text-center text-xs text-slate-400 print:hidden">
        音響会社用 2現場月間予定表 (外現場 ＆ ライブハウス PARTY) | A1セル連動・Googleスプレッドシート/Excel対応
      </footer>

      {/* Modals */}
      <GoogleSheetsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        year={year}
        month={month}
        staffNames={staffNames}
      />

      <StaffNamesModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        staffNames={staffNames}
        onSaveStaffNames={setStaffNames}
      />
    </div>
  );
}
