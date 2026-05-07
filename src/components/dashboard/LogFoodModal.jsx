import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { X, Sparkles, Camera, Loader2, Trash2, Utensils, Plus, Bookmark, Check, ShieldAlert, Zap, ArrowRight, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AlertDialog from '@/components/ui/AlertDialog';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LogFoodModal({ isOpen, onClose, onSuccess }) {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'saved'
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image states
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Saved meals states
  const [savedMeals, setSavedMeals] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [shouldSaveAsMeal, setShouldSaveAsMeal] = useState(false);
  const [mealName, setMealName] = useState("");

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mealIdToDelete, setMealIdToDelete] = useState(null);

  const [activatingTrial, setActivatingTrial] = useState(false);

  const fileInputRef = useRef(null);

  const isSubscribed = user && (
    user.subscriptionStatus === 'active' ||
    (user.subscriptionStatus === 'trialing' && new Date(user.trialEndDate) > new Date())
  );
  const canUseTrial = user && !user.hasUsedTrial && user.subscriptionStatus === 'inactive';

  useEffect(() => {
    if (isOpen && activeTab === 'saved' && isSubscribed) {
      fetchSavedMeals();
    }
  }, [isOpen, activeTab, isSubscribed]);

  const fetchSavedMeals = async () => {
    try {
      setIsLoadingMeals(true);
      const response = await axios.get('/api/meals');
      setSavedMeals(response.data.data);
    } catch (err) {
      console.error("Error fetching meals:", err);
      toast.error("Failed to load saved meals.");
    } finally {
      setIsLoadingMeals(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setImage(null);
          setImagePreview(null);
          setAnalysisResult(null);
          setInput("");
          setShouldSaveAsMeal(false);
          setMealName("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          setActiveTab('new');
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

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
    setShouldSaveAsMeal(false);
    setMealName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const logSavedMeal = async (meal) => {
    try {
      setIsSubmitting(true);
      const payload = {
        userInput: meal.name,
        aiData: {
          items: meal.items,
          total: meal.total
        }
      };
      await axios.post('/api/food/log', payload);
      toast.success(`${meal.name} logged successfully!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging meal:", err);
      toast.error("Failed to log meal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSavedMeal = async () => {
    if (!mealIdToDelete) return;
    try {
      await axios.delete(`/api/meals/${mealIdToDelete}`);
      setSavedMeals(prev => prev.filter(m => m._id !== mealIdToDelete));
      toast.success("Meal deleted.");
    } catch (err) {
      console.error("Error deleting meal:", err);
      toast.error("Failed to delete meal.");
    } finally {
      setMealIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !analysisResult) return;

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

    try {
      setIsSubmitting(true);

      // Save as meal if requested
      if (shouldSaveAsMeal && mealName.trim()) {
        await axios.post('/api/meals', {
          name: mealName,
          items: analysisResult.items,
          total: analysisResult.total
        });
      }

      const payload = {
        userInput: input || mealName || "Logged via AI",
        aiData: analysisResult
      };

      await axios.post('/api/food/log', payload);
      toast.success("Food logged successfully!");

      handleClose();
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
    setActiveTab('new');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full ${imagePreview ? 'max-w-2xl' : 'max-w-lg'} max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 transition-all`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="text-emerald-500" size={20} />
              Log Your Meal
            </h2>
            {isSubscribed && (
              <div className="flex gap-4 mt-1">
                <button
                  onClick={() => { setActiveTab('new'); resetImage(); }}
                  className={`text-xs md:text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === 'new' ? 'text-emerald-500 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  New Meal
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`text-xs md:text-sm font-medium pb-1 border-b-2 transition-all ${activeTab === 'saved' ? 'text-emerald-500 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  My Meals
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors self-start"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {!isSubscribed ? (
            <div className="flex flex-col items-center justify-center text-center py-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mb-6 shadow-xl shadow-emerald-500/5">
                <Zap size={40} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                {user?.hasUsedTrial ? "but subscription you have used your free trail" : "Premium Feature"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-[320px] mb-8 leading-relaxed">
                {user?.hasUsedTrial 
                  ? "you have used your free trail. please buy a subscription to continue." 
                  : "Log your food, analyze photos, and track macros with a premium plan or start your free trial."}
              </p>

              <div className="w-full space-y-3">
                {canUseTrial && (
                  <button
                    onClick={handleStartTrial}
                    disabled={activatingTrial}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    {activatingTrial ? <Loader2 className="animate-spin" size={20} /> : <Calendar size={20} />}
                    Activate 7-Day Free Trial
                  </button>
                )}

                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-700 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-[0.98]"
                >
                  View Subscription Plans
                  <ArrowRight size={20} />
                </Link>
              </div>

              <p className="mt-8 text-xs text-gray-400 flex items-center gap-2">
                <ShieldAlert size={14} />
                Secure payments powered by Stripe
              </p>
            </div>
          ) : activeTab === 'new' ? (
            <form onSubmit={handleSubmit} id="food-log-form">
              <div className="space-y-4">
                {!imagePreview ? (
                  <div className="space-y-3">
                    {!analysisResult && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                        Describe what you ate or upload a photo. Our AI will automatically estimate the calories and macros!
                      </p>
                    )}

                    <div className="relative group">
                      <textarea
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          if (analysisResult) setAnalysisResult(null);
                        }}
                        placeholder="e.g. I had 2 slices of pepperoni pizza and a can of diet coke..."
                        className={`w-full ${analysisResult ? 'h-24' : 'h-32'} bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 pr-12 text-sm md:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600`}
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
                      <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={resetImage} className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {analysisResult && (
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between animate-in fade-in slide-in-from-right-2">
                        <div>
                          <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                            <Sparkles size={16} />
                            AI Detected
                          </h3>
                          <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar text-xs md:text-sm">
                            {analysisResult.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{item.quantity} {item.name}</span>
                                <span className="font-medium text-gray-900 dark:text-white ml-2">{item.calories} kcal</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex justify-between font-bold text-emerald-900 dark:text-emerald-400 text-sm md:text-base">
                          <span>Total</span>
                          <span>{analysisResult.total.calories} kcal</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isAnalyzing && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-gray-500 gap-3 border border-dashed border-gray-200 dark:border-gray-700 animate-pulse">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <span className="font-medium text-xs md:text-sm">Analyzing your meal...</span>
                  </div>
                )}

                {!imagePreview && analysisResult && (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2 flex items-center gap-2 text-sm md:text-base">
                      <Sparkles size={16} />
                      AI Detected
                    </h3>
                    <div className="space-y-1 text-xs md:text-sm">
                      {analysisResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">{item.quantity} {item.name}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.calories} kcal</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex justify-between font-bold text-emerald-900 dark:text-emerald-400 text-sm md:text-base">
                      <span>Total Estimate</span>
                      <span>{analysisResult.total.calories} kcal</span>
                    </div>
                  </div>
                )}

                {analysisResult && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setShouldSaveAsMeal(!shouldSaveAsMeal)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${shouldSaveAsMeal ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-gray-300 group-hover:border-emerald-500'}`}
                      >
                        {shouldSaveAsMeal && <Check size={14} className="text-white dark:text-black" />}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Save as reusable meal</span>
                    </label>
                    {shouldSaveAsMeal && (
                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        placeholder="e.g. Protein Breakfast"
                        className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        autoFocus
                      />
                    )}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Pick a saved meal to log it immediately.</p>
              {isLoadingMeals ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <span>Loading your meals...</span>
                </div>
              ) : savedMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedMeals.map((meal) => (
                    <div
                      key={meal._id}
                      onClick={() => logSavedMeal(meal)}
                      className="group p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMealIdToDelete(meal._id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1 pr-6 text-xs md:text-sm">{meal.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                        {meal.items.map(i => i.name).join(', ')}
                      </p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{meal.total.calories} kcal</span>
                        <Plus size={16} className="text-gray-400 group-hover:text-emerald-500 transition-all group-hover:scale-110" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                  <Utensils size={40} className="text-gray-300 dark:text-gray-700" />
                  <p className="text-center text-xs md:text-sm">No saved meals yet.<br /><span className="text-xs">Save your first meal from the "New Meal" tab!</span></p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting || isAnalyzing}
              className="px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            {isSubscribed && (
              activeTab === 'new' ? (
                <button
                  form="food-log-form"
                  type="submit"
                  disabled={(!input.trim() && !analysisResult) || isSubmitting || isAnalyzing}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white dark:text-black px-5 md:px-6 py-2 md:py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : !analysisResult ? "Analyze Food" : "Log Food"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Close
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteSavedMeal}
        title="Delete Saved Meal?"
        description="Are you sure you want to remove this meal? You can always save it again later."
      />
    </div>
  );
}
