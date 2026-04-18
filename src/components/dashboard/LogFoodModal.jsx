import React, { useState } from 'react';
import axios from 'axios';
import { X, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogFoodModal({ isOpen, onClose, onSuccess }) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsSubmitting(true);
      await axios.post('/api/food/log', { userInput: input });
      toast.success("Food logged successfully!");
      setInput("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging food:", err);
      toast.error("Failed to log food. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="text-emerald-500" size={20} />
            Log Your Meal
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
            Describe what you ate in natural language. Our AI will automatically estimate the calories and macros!
          </p>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I had 2 slices of pepperoni pizza and a can of diet coke..."
            className="w-full h-32 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
            disabled={isSubmitting}
            autoFocus
          />

          <div className="mt-6 flex justify-end gap-3">
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
              disabled={!input.trim() || isSubmitting}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                "Log Food"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
