import React, { useState } from 'react';
import axios from 'axios';
import { X, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogWeightModal({ isOpen, onClose, onSuccess }) {
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || isNaN(weight)) {
      toast.error("Please enter a valid weight");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/weight/log', { weight: parseFloat(weight) });
      toast.success("Weight logged successfully!");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Scale className="text-cyan-500" size={20} />
            Log Body Weight
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Enter your current weight in kilograms (kg) to track your progress over time.
          </p>
          
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 text-2xl font-bold"
              disabled={isSubmitting}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">kg</div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!weight || isSubmitting}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-white dark:text-black px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "Save Weight"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
