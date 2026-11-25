import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function FieldDeleteConfirmModal({ isOpen, fieldName, onConfirm, onCancel }) {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[var(--danger)] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">Unmap Field Parcel?</h3>
            <p className="text-xs text-[var(--text-muted)]">
              This will remove <strong className="text-[var(--danger)]">{fieldName}</strong> from your active farm registry in real-time.
            </p>
          </div>
        </div>

        <p className="text-xs p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] mb-5 leading-relaxed text-[var(--text-secondary)]">
          All associated soil moisture sensors, physiological tracking, and agronomy logs for this parcel will be unmapped.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
