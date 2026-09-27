import React, { useState } from 'react';
import { X, Users, Check, AlertCircle } from 'lucide-react';

interface StaffNamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffNames: string[];
  onSaveStaffNames: (names: string[]) => void;
}

export const StaffNamesModal: React.FC<StaffNamesModalProps> = ({
  isOpen,
  onClose,
  staffNames,
  onSaveStaffNames,
}) => {
  const [names, setNames] = useState<string[]>([...staffNames]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    const updated = [...names];
    updated[index] = val;
    setNames(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNames = names.map((n, i) => n.trim() || `スタッフ${i + 1}`);
    onSaveStaffNames(finalNames);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">スタッフ名設定 (5名)</h3>
              <p className="text-xs text-slate-500">表のヘッダーやチェック欄に表示される5名の名前です</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-3 text-xs text-slate-700">
          <p className="text-slate-500 text-[11px] mb-2">
            ※ 変更すると、予定表の各列ヘッダーと集計に即時反映されます。
          </p>

          {names.map((name, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-16 font-semibold text-slate-600">スタッフ {idx + 1}:</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={`スタッフ${idx + 1}`}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          ))}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-lg hover:bg-slate-100 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>設定を保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
