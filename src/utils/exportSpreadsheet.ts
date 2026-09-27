import * as XLSX from 'xlsx';
import { DualSiteDayRow } from '../types/schedule';
import { getCalculatedHolidaysForYear } from './holidays';

export function generateDualSiteTSV(year: number, month: number, days: DualSiteDayRow[], staffNames: string[]): string {
  const headers = [
    '日付',
    '曜日',
    // 外現場
    '【外現場】現場名',
    '外:朝から',
    '外:午後から',
    '外現場:全員',
    ...staffNames.map((s) => `外現場:${s}`),
    '外現場:備考',
    // PARTY前段の日付・曜日
    'PARTY:日付',
    'PARTY:曜日',
    // PARTY
    '【PARTY】PA担当',
    'PARTY:照明',
    'PARTY:受付',
    'PARTY:ドリンク',
    'PARTY:SALA出演',
    'PARTY:イベント・備考',
  ];

  const rows: string[] = [headers.join('\t')];

  days.forEach((day) => {
    const dayLabel = day.isHoliday ? `${day.dayOfWeek}(祝)` : day.dayOfWeek;
    const dateVal = `${year}/${String(month).padStart(2, '0')}/${String(day.dayNumber).padStart(2, '0')}`;

    // Outside checks
    const outMorning = day.outside.isMorning ? '✔ 朝から' : '';
    const outAfternoon = day.outside.isAfternoon ? '✔ 午後から' : '';
    const outAll = day.outside.staffCheck.all ? '✔ 全員' : '';
    const outStaffCols = staffNames.map((s) => (day.outside.staffCheck.staff[s] ? '✔' : ''));

    // Party checks (必要人数・スタッフチェック列は削除)
    const partySala = day.party.isSalaPerformance ? '✔ SALA出演' : '';

    rows.push([
      dateVal,
      dayLabel,
      day.outside.siteName || '',
      outMorning,
      outAfternoon,
      outAll,
      ...outStaffCols,
      day.outside.notes || '',
      dateVal,
      dayLabel,
      day.party.paStaff || '',
      day.party.lightingStaff || '',
      day.party.receptionStaff || '',
      day.party.drinkStaff || '',
      partySala,
      day.party.notes || '',
    ].join('\t'));
  });

  return rows.join('\n');
}

export function exportDualSiteToExcel(year: number, month: number, days: DualSiteDayRow[], staffNames: string[]): void {
  const wb = XLSX.utils.book_new();

  const titleRow = [`${year}年 ${month}月 音響現場・PARTY 2現場月間予定表`];
  const subTitle = [`作成日: ${new Date().toLocaleDateString('ja-JP')} | A1月指定 自動連動`];

  const headerRow1 = [
    '日付',
    '曜日',
    // Outside site
    '【外現場】現場名',
    '朝から',
    '午後から',
    '外:全員',
    ...staffNames.map((s) => `外:${s}`),
    '外:備考',
    // Livehouse PARTY前段の日付・曜日
    'PARTY:日付',
    'PARTY:曜日',
    // Livehouse PARTY
    '【PARTY】PA担当',
    '照明',
    '受付',
    'ドリンク',
    'SALA出演',
    'PARTY:イベント・備考',
  ];

  const sheetData: (string | number)[][] = [
    titleRow,
    subTitle,
    [],
    headerRow1,
  ];

  days.forEach((day) => {
    const dayLabel = day.isHoliday ? `${day.dayOfWeek}(祝)` : day.dayOfWeek;
    const dateVal = `${year}/${String(month).padStart(2, '0')}/${String(day.dayNumber).padStart(2, '0')}`;
    const outStaffCols = staffNames.map((s) => (day.outside.staffCheck.staff[s] ? '✔' : ''));

    sheetData.push([
      dateVal,
      dayLabel,
      day.outside.siteName || '',
      day.outside.isMorning ? '✔' : '',
      day.outside.isAfternoon ? '✔' : '',
      day.outside.staffCheck.all ? '✔' : '',
      ...outStaffCols,
      day.outside.notes || '',
      dateVal,
      dayLabel,
      day.party.paStaff || '',
      day.party.lightingStaff || '',
      day.party.receptionStaff || '',
      day.party.drinkStaff || '',
      day.party.isSalaPerformance ? '✔' : '',
      day.party.notes || '',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 11 }, // 日付
    { wch: 8 },  // 曜日
    // Outside
    { wch: 22 }, // 外現場名
    { wch: 7 },  // 朝から
    { wch: 8 },  // 午後から
    { wch: 7 },  // 外:全員
    ...staffNames.map(() => ({ wch: 8 })),
    { wch: 18 }, // 外:備考
    // Party 前段の日付・曜日
    { wch: 11 }, // PARTY日付
    { wch: 8 },  // PARTY曜日
    // Party
    { wch: 14 }, // PA担当
    { wch: 14 }, // 照明
    { wch: 14 }, // 受付
    { wch: 14 }, // ドリンク
    { wch: 10 }, // SALA出演
    { wch: 26 }, // P:備考
  ];

  XLSX.utils.book_append_sheet(wb, ws, `${month}月予定表`);

  // Holiday reference sheet
  const holidayMap = getCalculatedHolidaysForYear(year);
  const holidayData: (string)[][] = [
    ['祝日日付', '祝日名'],
    ...Array.from(holidayMap.entries()).sort().map(([dateStr, name]) => [dateStr, name]),
  ];
  const wsHolidays = XLSX.utils.aoa_to_sheet(holidayData);
  wsHolidays['!cols'] = [{ wch: 14 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsHolidays, '祝日一覧');

  XLSX.writeFile(wb, `${year}年${month}月_2現場予定表_外現場_PARTY.xlsx`);
}
