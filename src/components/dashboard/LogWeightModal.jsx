import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Scale, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogWeightModal({ isOpen, onClose, onSuccess }) {
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
      toast.error("Please enter a valid weight in kg");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/weight/log', { weight: parseFloat(weight) });
      toast.success("Weight recorded successfully!");
      setWeight("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging weight:", err);
      toast.error("Failed to log weight. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shadow-sm">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Log Body Weight
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track your progress on the scale
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            For best consistency, weigh yourself first thing in the morning after waking up.
          </p>
          
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-4 pr-16 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400 text-3xl font-black text-center"
              disabled={isSubmitting}
              autoFocus
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-sm text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
              kg
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!weight || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Record Weight</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
