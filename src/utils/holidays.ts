import { DayOfWeekJa, HolidayInfo } from '../types/schedule';

export const DAY_NAMES: DayOfWeekJa[] = ['日', '月', '火', '水', '木', '金', '土'];

/**
 * Calculates the day of the Vernal Equinox (春分の日) for a given year (1980-2099)
 */
function getVernalEquinoxDay(year: number): number {
  if (year >= 1980 && year <= 2099) {
    return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  }
  return 20;
}

/**
 * Calculates the day of the Autumnal Equinox (秋分の日) for a given year (1980-2099)
 */
function getAutumnalEquinoxDay(year: number): number {
  if (year >= 1980 && year <= 2099) {
    return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  }
  return 23;
}

function getNthDayOfWeek(year: number, month: number, nth: number, dayOfWeek: number): number {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month - 1, day);
    if (d.getMonth() !== month - 1) break;
    if (d.getDay() === dayOfWeek) {
      count++;
      if (count === nth) {
        return day;
      }
    }
  }
  return 1;
}

/**
 * Compute official national holidays based on Japanese Law
 */
export function getCalculatedHolidaysForYear(year: number): Map<string, string> {
  const holidayMap = new Map<string, string>();

  const addHoliday = (month: number, day: number, name: string) => {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    holidayMap.set(`${year}-${mm}-${dd}`, name);
  };

  // 1. Fixed & Astronomical Holidays
  addHoliday(1, 1, '元日');
  addHoliday(1, getNthDayOfWeek(year, 1, 2, 1), '成人の日'); // 第2月曜
  addHoliday(2, 11, '建国記念の日');
  addHoliday(2, 23, '天皇誕生日');
  addHoliday(3, getVernalEquinoxDay(year), '春分の日');
  addHoliday(4, 29, '昭和の日');
  addHoliday(5, 3, '憲法記念日');
  addHoliday(5, 4, 'みどりの日');
  addHoliday(5, 5, 'こどもの日');
  addHoliday(7, getNthDayOfWeek(year, 7, 3, 1), '海の日'); // 第3月曜
  addHoliday(8, 11, '山の日');
  addHoliday(9, getNthDayOfWeek(year, 9, 3, 1), '敬老の日'); // 第3月曜
  addHoliday(9, getAutumnalEquinoxDay(year), '秋分の日');
  addHoliday(10, getNthDayOfWeek(year, 10, 2, 1), 'スポーツの日'); // 第2月曜
  addHoliday(11, 3, '文化の日');
  addHoliday(11, 23, '勤労感謝の日');

  // 2. 国民の休日 (Bridge Holiday)
  const keiroDay = getNthDayOfWeek(year, 9, 3, 1);
  const shubunDay = getAutumnalEquinoxDay(year);
  if (shubunDay - keiroDay === 2) {
    const bridgeDay = keiroDay + 1;
    const bridgeDate = new Date(year, 8, bridgeDay);
    if (bridgeDate.getDay() !== 0) {
      addHoliday(9, bridgeDay, '国民の休日');
    }
  }

  // 3. 振替休日 (Substitute Holiday)
  const sortedDates = Array.from(holidayMap.keys()).sort();
  for (const dateKey of sortedDates) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getDay() === 0) { // Sunday
      let nextDay = new Date(y, m - 1, d + 1);
      while (true) {
        const nextKey = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        if (!holidayMap.has(nextKey)) {
          holidayMap.set(nextKey, '振替休日');
          break;
        }
        nextDay.setDate(nextDay.getDate() + 1);
      }
    }
  }

  return holidayMap;
}

// In-memory cache for live fetched holidays
let remoteHolidaysCache: Map<string, string> | null = null;
let lastFetchedTime = 0;

/**
 * Fetch official holidays from trustworthy public source:
 * 1. holidays-jp API (mirrors 内閣府国民の祝日 CSV)
 * 2. Fallback to calculated holiday engine
 */
export async function fetchLiveJapaneseHolidays(): Promise<Map<string, string>> {
  // If cached within the last 2 hours, reuse
  if (remoteHolidaysCache && Date.now() - lastFetchedTime < 1000 * 60 * 120) {
    return remoteHolidaysCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch('https://holidays-jp.github.io/api/v1/date.json', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: Record<string, string> = await response.json();
      const map = new Map<string, string>();
      for (const [dateStr, name] of Object.entries(data)) {
        map.set(dateStr, name);
      }
      remoteHolidaysCache = map;
      lastFetchedTime = Date.now();
      return map;
    }
  } catch (err) {
    console.warn('Live holiday fetch failed, using internal astronomical holiday calculation engine:', err);
  }

  // Fallback
  return new Map<string, string>();
}

/**
 * Returns merged map of holidays for a specific year
 */
export function getHolidaysForYear(year: number, liveMap?: Map<string, string>): Map<string, string> {
  const calculated = getCalculatedHolidaysForYear(year);
  if (!liveMap || liveMap.size === 0) {
    return calculated;
  }

  // Merge live map entries for this year
  const prefix = `${year}-`;
  for (const [key, val] of liveMap.entries()) {
    if (key.startsWith(prefix)) {
      calculated.set(key, val);
    }
  }
  return calculated;
}

export function getHolidayInfo(
  year: number,
  month: number,
  day: number,
  yearHolidayMap: Map<string, string>
): HolidayInfo {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const key = `${year}-${mm}-${dd}`;

  if (yearHolidayMap.has(key)) {
    return {
      isHoliday: true,
      name: yearHolidayMap.get(key)!,
    };
  }

  return {
    isHoliday: false,
    name: '',
  };
}

export function formatDateStr(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
