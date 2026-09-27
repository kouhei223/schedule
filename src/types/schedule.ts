export type DayOfWeekJa = '日' | '月' | '火' | '水' | '木' | '金' | '土';

export interface HolidayInfo {
  isHoliday: boolean;
  name: string;
}

export const DEFAULT_STAFF_MEMBERS = [
  'スタッフ1',
  'スタッフ2',
  'スタッフ3',
  'スタッフ4',
  'スタッフ5',
];

export interface StaffCheckState {
  all: boolean;
  staff: Record<string, boolean>; // staffName -> boolean
}

// 外現場（PA・音響出向現場など）
export interface OutsideSiteDayData {
  siteName: string;            // 外現場名
  isMorning: boolean;          // 朝から チェック欄
  isAfternoon: boolean;        // 午後から チェック欄
  staffCheck: StaffCheckState; // 全員 + 5人チェック
  notes: string;               // 備考
}

// ライブハウス「PARTY」
export interface PartySiteDayData {
  paStaff: string;             // PA担当
  lightingStaff: string;       // 照明
  receptionStaff: string;      // 受付
  drinkStaff: string;          // ドリンク
  isSalaPerformance: boolean;  // SALA出演 チェック欄
  requiredStaffCount: number;  // 必要人数 (数値)
  staffCheck: Record<string, boolean>; // 5人チェック（「全員」は削除）
  notes: string;               // イベント名・備考
}

export interface DualSiteDayRow {
  dateStr: string;          // YYYY-MM-DD
  dayNumber: number;        // 1 - 31
  dayOfWeek: DayOfWeekJa;   // 日 - 土
  dayOfWeekIndex: number;   // 0 (日) - 6 (土)
  isSaturday: boolean;      // 土曜日フラグ (青)
  isSunday: boolean;        // 日曜日フラグ (赤)
  isHoliday: boolean;       // 祝日フラグ (赤)
  holidayName?: string;     // 祝日名称

  // 2大現場
  outside: OutsideSiteDayData;
  party: PartySiteDayData;
}

export type ViewMode = 'dual-spreadsheet' | 'calendar' | 'staff-summary';
