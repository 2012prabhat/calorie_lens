import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Sparkles, Camera, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LogFoodModal({ isOpen, onClose, onSuccess }) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Image states
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Auto analyze image
    analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/food/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAnalysisResult(response.data);
      // Also update text input as a fallback/description
      const description = response.data.items.map(i => `${i.quantity} ${i.name}`).join(', ');
      setInput(description);
      
    } catch (err) {
      console.error("Error analyzing image:", err);
      toast.error("Failed to analyze image. Try describing it instead.");
      setImage(null);
      setImagePreview(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetImage = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !analysisResult) return;

    // Phase 1: Analysis (if not already analyzed)
    if (!analysisResult) {
      try {
        setIsAnalyzing(true);
        const response = await axios.post('/api/food/log', { 
          userInput: input,
          analyzeOnly: true 
        });
        setAnalysisResult(response.data.data);
      } catch (err) {
        console.error("Error analyzing text:", err);
        toast.error("Failed to analyze text. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Phase 2: Logging
    try {
      setIsSubmitting(true);
      const payload = {
        userInput: input,
        aiData: analysisResult // Send structured data
      };
      
      await axios.post('/api/food/log', payload);
      toast.success("Food logged successfully!");
      
      // Reset state
      setInput("");
      resetImage();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging food:", err);
      toast.error("Failed to log food. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetImage();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full ${imagePreview ? 'max-w-2xl' : 'max-w-lg'} overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 transition-all`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Sparkles className="text-emerald-500" size={20} />
            Log Your Meal
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {!imagePreview ? (
              <div className="space-y-4">
                {!analysisResult && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Describe what you ate or upload a photo. Our AI will automatically estimate the calories and macros!
                  </p>
                )}
                
                <div className="relative group">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (analysisResult) setAnalysisResult(null); // Reset analysis if text changes
                    }}
                    placeholder="e.g. I had 2 slices of pepperoni pizza and a can of diet coke..."
                    className={`w-full ${analysisResult ? 'h-24' : 'h-32'} bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 pr-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`}
                    disabled={isSubmitting || isAnalyzing}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 bottom-3 p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
                    title="Capture or upload image"
                  >
                    <Camera size={20} />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden aspect-square md:aspect-[4/3] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <img 
                    src={imagePreview} 
                    alt="Meal preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={resetImage}
                    className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {analysisResult && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between animate-in fade-in slide-in-from-right-2 duration-300">
                    <div>
                      <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        AI Detected
                      </h3>
                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {analysisResult.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{item.quantity} {item.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap ml-2">{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex justify-between font-bold text-emerald-900 dark:text-emerald-400">
                      <span>Total</span>
                      <span>{analysisResult.total.calories} kcal</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 gap-3 border border-dashed border-gray-200 dark:border-gray-700 animate-pulse">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <span className="font-medium text-sm">Analyzing your meal...</span>
              </div>
            )}

            {!imagePreview && analysisResult && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  AI Detected
                </h3>
                <div className="space-y-1">
                  {analysisResult.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{item.quantity} {item.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex justify-between font-bold text-emerald-900 dark:text-emerald-400">
                  <span>Total Estimate</span>
                  <span>{analysisResult.total.calories} kcal</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isAnalyzing}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={(!input.trim() && !analysisResult) || isSubmitting || isAnalyzing}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Logging...
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : !analysisResult ? (
                "Analyze Food"
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
