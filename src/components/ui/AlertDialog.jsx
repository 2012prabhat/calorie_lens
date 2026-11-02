import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function AlertDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  cancelText = "Cancel", 
  confirmText = "Delete",
  variant = "destructive"
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === 'destructive' ? (
              <div className="shrink-0 w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
            ) : (
              <div className="shrink-0 w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-950/70 px-6 py-4 flex justify-end gap-2.5 border-t border-slate-200/60 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all active:scale-95 shadow-md ${
              variant === 'destructive' 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
