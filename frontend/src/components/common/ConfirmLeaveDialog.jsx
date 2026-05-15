import React from 'react';
import Icon from './Icon';

function ConfirmLeaveDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  mode = 'discard',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[220] grid place-items-center bg-[rgba(12,16,24,0.42)] px-4 backdrop-blur-[6px] animate-modal-fade-in"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-[min(460px,100%)] overflow-hidden rounded-[28px] border border-[rgba(106,134,168,0.22)] bg-[rgba(248,250,252,0.96)] shadow-[0_30px_70px_rgba(15,23,42,0.18)] animate-modal-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
      >
        <div className="relative overflow-hidden px-6 pt-6 pb-5">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(52,118,211,0.18),transparent_58%),radial-gradient(circle_at_top_right,rgba(14,74,138,0.12),transparent_52%)]" />
          <div className="relative flex items-start gap-4">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,74,138,0.14),rgba(52,118,211,0.22))] text-blue shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <Icon name={mode === 'save' ? 'edit_square' : 'error_outline'} />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-text-3">Unsaved Changes</p>
              <h2 id="leave-dialog-title" className="m-0 text-[28px] leading-[1.05] tracking-tight text-text">
                {title}
              </h2>
              <p className="mt-3 mb-0 max-w-[34ch] text-[15px] leading-7 text-text-2">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[rgba(106,134,168,0.18)] bg-[rgba(255,255,255,0.74)] px-6 py-5">
          <button
            className="inline-flex min-w-[112px] items-center justify-center rounded-full border border-line bg-white px-4 py-[11px] text-sm font-semibold text-text-2 transition-all duration-150 hover:border-[#a9bacf] hover:text-text"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className="inline-flex min-w-[132px] items-center justify-center rounded-full border-0 bg-blue px-5 py-[11px] text-sm font-bold text-white shadow-sm transition-all duration-150 hover:-translate-y-px hover:bg-blue-2"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLeaveDialog;
