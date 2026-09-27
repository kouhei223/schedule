import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  FileSpreadsheet,
  CheckSquare2,
  CalendarDays
} from 'lucide-react';
import { getCalculatedHolidaysForYear } from '../utils/holidays';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  staffNames: string[];
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  isOpen,
  onClose,
  year,
  month,
  staffNames,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const holidays = getCalculatedHolidaysForYear(year);
  const holidayListText = Array.from(holidays.entries())
    .sort()
    .map(([date, name]) => `${date}\t${name}`)
    .join('\n');

  // Google Sheets Apps Script snippet to automatically fetch Cabinet Office Holiday CSV
  const appsScriptCode = `/**
 * 日本の祝日を内閣府公式CSVから自動取得してシートに反映する関数
 * メニュー「拡張機能」>「Apps Script」に貼り付けて実行してください
 */
function fetchJapanHolidays() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("祝日一覧");
  if (!sheet) {
    sheet = ss.insertSheet("祝日一覧");
  }
  sheet.clear();
  
  // 内閣府公式の祝日CSV (信頼できる外部ソース)
  const url = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";
  const response = UrlFetchApp.fetch(url);
  const csvData = Utilities.parseCsv(response.getContentText("Shift_JIS"));
  
  sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 160);
  SpreadsheetApp.getUi().alert("祝日データを最新に更新しました！");
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Googleスプレッドシート作成＆完全自動設定ガイド
              </h3>
              <p className="text-xs text-slate-600">
                A1セルに月（{month}）を入力すると自動でカレンダー生成・土曜青・日祝赤・2現場列を構築
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Direct Sheets New Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                一番かんたんな方法：コピー＆ペーストで即完成
              </div>
              <p className="text-emerald-800 text-xs mt-0.5">
                本アプリ上部の「シート貼付用コピー」を押して、新規Googleスプレッドシートに貼り付けるだけで、2現場レイアウトが完成します。
              </p>
            </div>
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition shadow-xs shrink-0"
            >
              <span>新規シートを開く (sheets.new)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Section 1: A1入力でカレンダー自動生成の数式 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>A1セルの月入力からカレンダーを自動生成する数式設定</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Googleスプレッドシートでセル <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-blue-800">A1</code> に
              月（例: <code>{month}</code>）を入力します。
              <br />
              カレンダー開始行（例: <strong>A4セル</strong>）に次の数式を入力すると、1日から末日まで自動計算されます：
            </p>

            {/* A4数式 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg font-mono">
                <div>
                  <span className="text-xs text-slate-400 block font-sans">日付列 (A4セル)</span>
                  <span className="text-blue-700 font-semibold text-xs">=DATE({year}, $A$1, ROW()-3)</span>
                </div>
                <button
                  onClick={() => copyToClipboard(`=DATE(${year}, $A$1, ROW()-3)`, 'dateA1')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  {copiedKey === 'dateA1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'dateA1' ? 'コピー済' : '数式コピー'}</span>
                </button>
              </div>

              {/* 曜日列 */}
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg font-mono">
                <div>
                  <span className="text-xs text-slate-400 block font-sans">曜日列 (B4セル)</span>
                  <span className="text-blue-700 font-semibold text-xs">=TEXT(A4, "aaa")</span>
                </div>
                <button
                  onClick={() => copyToClipboard('=TEXT(A4, "aaa")', 'dayA1')}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                >
                  {copiedKey === 'dayA1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'dayA1' ? 'コピー済' : '数式コピー'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                ※ 月末（小の月28日〜30日）を非表示にする場合は <code>=IF(MONTH(DATE({year},$A$1,ROW()-3))=$A$1, DATE({year},$A$1,ROW()-3), "")</code> を使用します。
              </p>
            </div>
          </div>

          {/* Section 2: 条件付き書式（土曜青・日曜赤・祝日赤） */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>「条件付き書式」で土曜を青・日祝を赤に自動色付けする設定</span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Googleスプレッドシートのメニュー <strong>「表示形式」＞「条件付き書式」</strong> を開き、
              範囲を <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">A4:Z34</code>（表全体）に指定して、以下の「カスタム数式」を3つ追加します。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 土曜日 */}
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 text-xs">① 土曜日を青に</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500"></span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">カスタム数式:</p>
                  <code className="block bg-white border border-blue-200 p-1.5 rounded font-mono text-blue-700 font-bold my-1 text-xs">
                    =WEEKDAY($A4)=7
                  </code>
                  <p className="text-[10px] text-blue-600">書式: 背景 薄い青 / 文字 濃い青</p>
                </div>
                <button
                  onClick={() => copyToClipboard('=WEEKDAY($A4)=7', 'condSat')}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-xs bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded transition font-medium"
                >
                  {copiedKey === 'condSat' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>数式コピー</span>
                </button>
              </div>

              {/* 日曜日 */}
              <div className="bg-red-50/70 border border-red-200 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900 text-xs">② 日曜日を赤に</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500"></span>
                  </div>
                  <p className="text-[11px] text-red-800 mt-1">カスタム数式:</p>
                  <code className="block bg-white border border-red-200 p-1.5 rounded font-mono text-red-700 font-bold my-1 text-xs">
                    =WEEKDAY($A4)=1
                  </code>
                  <p className="text-[10px] text-red-600">書式: 背景 薄い赤 / 文字 濃い赤</p>
                </div>
                <button
                  onClick={() => copyToClipboard('=WEEKDAY($A4)=1', 'condSun')}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-xs bg-white border border-red-300 text-red-700 hover:bg-red-100 rounded transition font-medium"
                >
                  {copiedKey === 'condSun' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>数式コピー</span>
                </button>
              </div>

              {/* 祝日 */}
              <div className="bg-red-50/70 border border-red-200 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900 text-xs">③ 祝日を赤に</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600"></span>
                  </div>
                  <p className="text-[11px] text-red-800 mt-1">カスタム数式 (祝日シート参照):</p>
                  <code className="block bg-white border border-red-200 p-1.5 rounded font-mono text-red-700 font-bold my-1 text-xs">
                    =COUNTIF(祝日一覧!$A:$A, $A4)&gt;0
                  </code>
                  <p className="text-[10px] text-red-600">書式: 背景 薄い赤 / 文字 濃い赤</p>
                </div>
                <button
                  onClick={() => copyToClipboard('=COUNTIF(祝日一覧!$A:$A, $A4)>0', 'condHol')}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-xs bg-white border border-red-300 text-red-700 hover:bg-red-100 rounded transition font-medium"
                >
                  {copiedKey === 'condHol' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>数式コピー</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: 信頼できる外部ソースから祝日を自動更新する方法 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>外部の信頼できるソース（内閣府祝日CSV）からの祝日自動連携</span>
              </div>
              <button
                onClick={() => copyToClipboard(appsScriptCode, 'scriptCode')}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium text-xs shadow-xs"
              >
                {copiedKey === 'scriptCode' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>自動取得スクリプトをコピー</span>
              </button>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Googleスプレッドシートのメニュー <strong>「拡張機能」＞「Apps Script」</strong> を開き、
              コピーしたコードを貼り付けて保存・実行すると、内閣府公式サイト（<code>https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv</code>）から
              最新の祝日データを自動取得し、常に最新の祝日色分けが維持されます。
            </p>

            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>

          {/* Section 4: チェックボックス（チェック欄）とプルダウン列構成 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>チェック欄・プルダウン（スタッフ選択）と2現場の列構成</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Googleスプレッドシートでは、該当のセル範囲を選択し、メニューの <strong>「挿入」＞「チェックボックス」</strong> や <strong>「挿入」＞「プルダウン」</strong>（スタッフ名5名をリスト登録）で設定できます。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <span className="font-bold text-amber-950 block mb-1">【外現場】の列構成</span>
                <span className="text-slate-700 leading-normal">
                  現場名 / 全員チェック / スタッフ5名チェック / 出勤時間（午前・午後） / 備考
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <span className="font-bold text-emerald-950 block mb-1">【PARTY】の列構成</span>
                <span className="text-slate-700 leading-normal">
                  PA (プルダウン) / 照明 (プルダウン) / 受付 (プルダウン) / ドリンク (プルダウン) / SALA出演チェック / 備考
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition shadow-xs"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
