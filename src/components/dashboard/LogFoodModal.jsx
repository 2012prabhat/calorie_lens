import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  X, 
  Sparkles, 
  Camera, 
  Loader2, 
  Trash2, 
  Utensils, 
  Plus, 
  Bookmark, 
  Check, 
  ShieldAlert, 
  Zap, 
  ArrowRight, 
  Calendar,
  UploadCloud,
  FileText,
  Star,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  Square,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AlertDialog from '@/components/ui/AlertDialog';
import { UserContext } from '@/context/UserContext';
import Link from 'next/link';
import { triggerCelebration } from '@/lib/confetti';
import NutriScoreCard from '@/components/dashboard/NutriScoreCard';

export default function LogFoodModal({ isOpen, onClose, onSuccess, initialTab = 'photo' }) {
  const { user, setUser } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState(initialTab || 'photo'); // 'photo', 'voice', 'text', 'saved'
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image states
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [wrongFoodError, setWrongFoodError] = useState(null);

  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

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
    (user.subscriptionStatus === 'active' && (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date())) ||
    (user.subscriptionStatus === 'trialing' && (!user.trialEndDate || new Date(user.trialEndDate) > new Date()))
  );
  const canUseTrial = user && !user.hasUsedTrial && user.subscriptionStatus === 'inactive';

  // Check speech recognition capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'photo');
      setWrongFoodError(null);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'saved' && isSubscribed) {
      fetchSavedMeals();
    }
  }, [isOpen, activeTab, isSubscribed]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const fetchSavedMeals = async () => {
    try {
      setIsLoadingMeals(true);
      const response = await axios.get('/api/meals');
      setSavedMeals(response.data.data || []);
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
          handleClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartTrial = async () => {
    try {
      setActivatingTrial(true);
      await axios.post('/api/subscription/trial');
      toast.success("7-Day Free Trial activated! You can now log meals.");
      if (setUser) {
        setUser(prev => ({
          ...prev,
          subscriptionStatus: 'trialing',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
    } catch (err) {
      console.error("Trial activation failed:", err);
      toast.error(err.response?.data?.error || "Failed to activate trial");
    } finally {
      setActivatingTrial(false);
    }
  };

  // 🎙️ Voice Recognition Handlers
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition isn't supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      setWrongFoodError(null);
      setAnalysisResult(null);

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + ' ';
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        const full = (finalTrans + interimTrans).trim();
        setVoiceTranscript(full);
        setInput(full);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
        } else if (event.error === 'no-speech') {
          // ignore silent timeout
        } else if (event.error !== 'aborted') {
          toast.error("Speech recognition error: " + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech initialization error:", err);
      setIsListening(false);
    }
  };

  const handleAnalyzeVoiceMeal = async (customText = null) => {
    if (isListening) {
      stopListening();
    }

    const textToAnalyze = (customText || voiceTranscript || input || "").trim();
    if (!textToAnalyze) {
      toast.error("Please speak or enter what you ate first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setWrongFoodError(null);
      setAnalysisResult(null);

      const response = await axios.post('/api/food/log', {
        userInput: textToAnalyze,
        analyzeOnly: true
      });

      if (response.data?.data && response.data.data.isFood === false) {
        const msg = response.data.data.rejectionReason || "This does not appear to be food or drink.";
        setWrongFoodError(msg);
        toast.error(msg, { icon: "⚠️", duration: 5000 });
        return;
      }

      setAnalysisResult(response.data.data);
      toast.success("Voice meal analyzed with Gemini AI!");
    } catch (err) {
      console.error("Error analyzing voice text:", err);
      const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
      const errorMsg = err.response?.data?.error || "Failed to analyze speech. Please try speaking again.";
      if (isWrongFood) {
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: "⚠️", duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    setWrongFoodError(null);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    try {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      setWrongFoodError(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/food/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.isFood === false) {
        const errorMsg = response.data.error || "Wrong meal image: No food or drink detected in this photo.";
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: "⚠️", duration: 5000 });
        return;
      }

      setAnalysisResult(response.data);
      const description = response.data.items?.map(i => `${i.quantity} ${i.name}`).join(', ') || "";
      setInput(description);
      toast.success("Meal analyzed with Gemini AI!");

    } catch (err) {
      console.error("Error analyzing image:", err);
      const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
      const errorMsg = err.response?.data?.error || (isWrongFood ? "Wrong meal image: No food or drink detected." : "Failed to analyze image. You can describe it in the text tab.");
      
      if (isWrongFood) {
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: "⚠️", duration: 5000 });
      } else {
        toast.error(errorMsg);
        setImage(null);
        setImagePreview(null);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetImage = () => {
    stopListening();
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setWrongFoodError(null);
    setInput("");
    setVoiceTranscript("");
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
          total: meal.total,
          healthScore: meal.healthScore,
          insights: meal.insights,
        }
      };
      await axios.post('/api/food/log', payload);
      toast.success(`${meal.name} logged successfully!`);
      if (onSuccess) onSuccess();
      handleClose();
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
      toast.success("Meal removed from presets.");
    } catch (err) {
      console.error("Error deleting meal:", err);
      toast.error("Failed to delete meal.");
    } finally {
      setMealIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (wrongFoodError) {
      toast.error("Please provide a valid meal or food item first.");
      return;
    }
    if (!input.trim() && !analysisResult) return;

    // If only text/voice is entered and not yet analyzed
    if (!analysisResult) {
      try {
        setIsAnalyzing(true);
        setWrongFoodError(null);
        const response = await axios.post('/api/food/log', {
          userInput: input,
          analyzeOnly: true
        });

        if (response.data?.data && response.data.data.isFood === false) {
          const msg = response.data.data.rejectionReason || "This does not appear to be food or drink.";
          setWrongFoodError(msg);
          toast.error(msg, { icon: "⚠️", duration: 5000 });
          return;
        }

        setAnalysisResult(response.data.data);
        toast.success("Nutrients calculated!");
      } catch (err) {
        console.error("Error analyzing text:", err);
        const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
        const errorMsg = err.response?.data?.error || "Failed to analyze text. Please check description.";
        if (isWrongFood) {
          setWrongFoodError(errorMsg);
          toast.error(errorMsg, { icon: "⚠️", duration: 5000 });
        } else {
          toast.error(errorMsg);
        }
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Log the confirmed analysis
    try {
      setIsSubmitting(true);

      if (shouldSaveAsMeal && mealName.trim()) {
        await axios.post('/api/meals', {
          name: mealName,
          items: analysisResult.items,
          total: analysisResult.total,
          healthScore: analysisResult.healthScore,
          insights: analysisResult.insights,
        });
      }

      const payload = {
        userInput: input || mealName || "Logged via AI Voice/Photo",
        aiData: analysisResult
      };

      await axios.post('/api/food/log', payload);
      triggerCelebration();
      toast.success("Food logged successfully!");

      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error logging food:", err);
      toast.error(err.response?.data?.error || "Failed to log food. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    stopListening();
    resetImage();
    setActiveTab('photo');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl w-full ${imagePreview ? 'max-w-2xl' : 'max-w-xl'} max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}>

        {/* 🔝 Modal Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              {activeTab === 'voice' ? <Mic size={18} /> : activeTab === 'text' ? <FileText size={18} /> : <Camera size={18} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeTab === 'voice' ? "Hands-Free Voice Log" : "Log Meal & Macros"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered by Gemini Multimodal AI
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4-Tab Segmented Bar (Only if subscribed) */}
        {isSubscribed && (
          <div className="px-5 pt-4 pb-2 border-b border-slate-200/60 dark:border-white/5 shrink-0">
            <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5">
              
              {/* Tab 1: Photo */}
              <button
                type="button"
                onClick={() => { stopListening(); setActiveTab('photo'); resetImage(); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'photo'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Camera size={14} />
                <span className="hidden sm:inline">Photo Scan</span>
                <span className="sm:hidden">Photo</span>
              </button>

              {/* Tab 2: Voice Log 🎙️ */}
              <button
                type="button"
                onClick={() => { resetImage(); setActiveTab('voice'); }}
                className={`relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'voice'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mic size={14} className={isListening ? "animate-pulse text-rose-500" : ""} />
                <span className="hidden sm:inline">Voice Log</span>
                <span className="sm:hidden">Voice</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>

              {/* Tab 3: Quick Describe */}
              <button
                type="button"
                onClick={() => { stopListening(); setActiveTab('text'); resetImage(); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'text'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText size={14} />
                <span className="hidden sm:inline">Describe</span>
                <span className="sm:hidden">Text</span>
              </button>

              {/* Tab 4: Saved Presets */}
              <button
                type="button"
                onClick={() => { stopListening(); setActiveTab('saved'); resetImage(); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Star size={14} />
                <span className="hidden sm:inline">Presets</span>
                <span className="sm:hidden">Saved</span>
              </button>
            </div>
          </div>
        )}

        {/* 📦 Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
          {!isSubscribed ? (
            /* Subscription Gate Banner */
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-3xl flex items-center justify-center text-slate-950 mb-5 shadow-xl shadow-emerald-500/20">
                <Zap size={30} fill="currentColor" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {user?.hasUsedTrial ? "Upgrade to Log Meals" : "Activate 7-Day Free Trial"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-7 leading-relaxed">
                {user?.hasUsedTrial 
                  ? "Your 7-day free trial has expired. Subscribe to an affordable plan to continue logging food and analyzing calories." 
                  : "Instant AI meal photography, hands-free voice logging, and unlimited macro tracking are included in the 7-day trial."}
              </p>

              <div className="w-full max-w-sm space-y-3">
                {canUseTrial && (
                  <button
                    onClick={handleStartTrial}
                    disabled={activatingTrial}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
                  >
                    {activatingTrial ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                    <span>Start 7-Day Free Trial</span>
                  </button>
                )}

                <Link
                  href="/pricing"
                  onClick={handleClose}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                >
                  <span>View All Plans</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                <ShieldAlert size={14} />
                <span>Instant activation • Cancel anytime</span>
              </div>
            </div>
          ) : activeTab === 'photo' ? (
            /* AI Photo Scan Tab */
            <div className="space-y-4">
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group cursor-pointer rounded-3xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] p-8 text-center transition-all flex flex-col items-center justify-center min-h-[220px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud size={28} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Click or Drag to Upload Meal Photo
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Our AI scans the image, separates ingredients, and estimates portion sizes and calories.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                </div>
              ) : (
                /* Image Preview with Scanning Animation */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800">
                    <img 
                      src={imagePreview} 
                      alt="Meal snapshot" 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Laser overlay while analyzing */}
                    {isAnalyzing && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-scan-laser pointer-events-none"></div>
                    )}

                    <button 
                      type="button" 
                      onClick={resetImage} 
                      className="absolute top-3 right-3 p-2 bg-slate-950/70 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition-colors"
                      title="Discard photo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {isAnalyzing && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
                      <Loader2 className="animate-spin shrink-0" size={18} />
                      <span>Gemini Vision AI is verifying meal & calculating macros...</span>
                    </div>
                  )}

                  {/* ⚠️ Wrong Meal Alert Banner */}
                  {wrongFoodError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                          <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-rose-700 dark:text-rose-300">
                              Wrong Meal Image Detected
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Not Food
                            </span>
                          </div>
                          <p className="text-xs text-rose-600/90 dark:text-rose-300/90 mt-1.5 leading-relaxed">
                            {wrongFoodError}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                            >
                              <UploadCloud size={14} />
                              <span>Upload Food Photo</span>
                            </button>
                            <button
                              type="button"
                              onClick={resetImage}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition"
                            >
                              Discard
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Results Card */}
                  {analysisResult && (
                    <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <Sparkles size={14} /> AI Analysis Complete
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {analysisResult.total?.calories || 0} kcal total
                        </span>
                      </div>

                      {/* Items breakdown list */}
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                        {analysisResult.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-white/5">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {item.quantity} {item.name}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.calories} kcal
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Macro totals summary */}
                      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                          {analysisResult.total?.protein || 0}g <span className="text-[10px] opacity-75">Protein</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                          {analysisResult.total?.carbs || 0}g <span className="text-[10px] opacity-75">Carbs</span>
                        </div>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                          {analysisResult.total?.fat || 0}g <span className="text-[10px] opacity-75">Fat</span>
                        </div>
                      </div>

                      {/* NutriScore & Healthy Swap Insights */}
                      {(analysisResult.healthScore || analysisResult.insights) && (
                        <div className="pt-1">
                          <NutriScoreCard 
                            healthScore={analysisResult.healthScore} 
                            insights={analysisResult.insights} 
                          />
                        </div>
                      )}

                      {/* Save Preset Checkbox */}
                      <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={shouldSaveAsMeal}
                            onChange={(e) => setShouldSaveAsMeal(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span>Save as reusable preset meal</span>
                        </label>
                        {shouldSaveAsMeal && (
                          <input
                            type="text"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="Meal Name (e.g. Daily Power Lunch)"
                            className="w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'voice' ? (
            /* 🎙️ Hands-Free Voice Meal Logging Tab */
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Header Guidance */}
              <div className="text-center pt-1 pb-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
                  <Sparkles size={12} />
                  <span>Hands-Free Speech AI</span>
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Speak what you ate naturally
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Tap the microphone and describe your food. Gemini AI will extract ingredients, portion sizes, and calculate calories.
                </p>
              </div>

              {!speechSupported && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                  <span>
                    Native speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari, or switch to the <strong>Describe</strong> tab.
                  </span>
                </div>
              )}

              {/* Central Pulsing Microphone Orb */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative flex items-center justify-center">
                  
                  {/* Outer Pulsing Halo when recording */}
                  {isListening && (
                    <>
                      <div className="absolute w-32 h-32 rounded-full bg-rose-500/20 animate-ping pointer-events-none"></div>
                      <div className="absolute w-28 h-28 rounded-full bg-rose-500/30 animate-pulse pointer-events-none"></div>
                    </>
                  )}

                  {/* Main Mic Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isAnalyzing}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                      isListening
                        ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/40 animate-pulse ring-4 ring-rose-500/30'
                        : 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-emerald-500/30 hover:scale-105'
                    }`}
                    title={isListening ? "Stop listening" : "Start speaking"}
                  >
                    {isListening ? (
                      <>
                        <Square size={28} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic size={32} />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">Speak</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status label under mic button */}
                <div className="mt-4 text-center">
                  {isListening ? (
                    <div className="flex items-center justify-center gap-2 text-rose-500 text-xs font-black animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Listening... Speak clearly</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {voiceTranscript ? "Tap mic to speak more" : "Tap the button to start recording"}
                    </span>
                  )}
                </div>
              </div>

              {/* Live Speech Transcript Box */}
              {(voiceTranscript || isListening) && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1017]/80 border border-slate-200/90 dark:border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Volume2 size={13} className="text-emerald-500" />
                      <span>Detected Speech</span>
                    </span>

                    {voiceTranscript && (
                      <button
                        type="button"
                        onClick={() => {
                          setVoiceTranscript("");
                          setInput("");
                          setAnalysisResult(null);
                          setWrongFoodError(null);
                        }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition"
                      >
                        <RotateCcw size={11} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic min-h-[38px]">
                    &ldquo;{voiceTranscript || "Listening for your voice..."}&rdquo;
                    {isListening && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle"></span>}
                  </p>

                  {/* Action row under transcript */}
                  {voiceTranscript && !isAnalyzing && !analysisResult && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Looks accurate?
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAnalyzeVoiceMeal()}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-4 py-1.5 rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95 transition"
                      >
                        <Sparkles size={13} />
                        <span>Calculate Macros</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Analyzing pulse banner */}
              {isAnalyzing && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
                  <Loader2 className="animate-spin shrink-0" size={18} />
                  <span>Gemini AI is parsing voice ingredients & calculating nutrition...</span>
                </div>
              )}

              {/* ⚠️ Wrong Meal Error for Voice */}
              {wrongFoodError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-xs text-rose-700 dark:text-rose-300">
                        Not Recognized as Food
                      </h4>
                      <p className="text-xs text-rose-600/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                        {wrongFoodError}
                      </p>
                      <button
                        type="button"
                        onClick={toggleListening}
                        className="mt-2.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Mic size={13} />
                        <span>Speak Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Voice Prompts (when no transcript yet) */}
              {!voiceTranscript && !analysisResult && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                    Try speaking phrases like:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "2 paneer parathas with 1 cup plain curd",
                      "Grilled chicken breast with steamed broccoli and brown rice",
                      "Oatmeal with blueberries, banana, and 1 scoop whey protein",
                      "1 cup masala chai with 2 whole wheat digestive biscuits"
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVoiceTranscript(example);
                          setInput(example);
                          handleAnalyzeVoiceMeal(example);
                        }}
                        className="text-left p-2.5 rounded-xl bg-white dark:bg-[#0b0f16]/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-200/90 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-300 transition group flex items-start gap-2"
                      >
                        <span className="text-emerald-500 font-bold group-hover:scale-110 transition-transform">💬</span>
                        <span className="line-clamp-2">&ldquo;{example}&rdquo;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Analysis Result Display */}
              {analysisResult && (
                <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> Nutrition Calculated from Voice
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {analysisResult.total?.calories || 0} kcal total
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                    {analysisResult.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-white/5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {item.quantity} {item.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Macro Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                      {analysisResult.total?.protein || 0}g <span className="text-[10px] opacity-75">Protein</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                      {analysisResult.total?.carbs || 0}g <span className="text-[10px] opacity-75">Carbs</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                      {analysisResult.total?.fat || 0}g <span className="text-[10px] opacity-75">Fat</span>
                    </div>
                  </div>

                  {/* NutriScore & Healthy Swap Insights */}
                  {(analysisResult.healthScore || analysisResult.insights) && (
                    <div className="pt-1">
                      <NutriScoreCard 
                        healthScore={analysisResult.healthScore} 
                        insights={analysisResult.insights} 
                      />
                    </div>
                  )}

                  {/* Save Preset Checkbox */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={shouldSaveAsMeal}
                        onChange={(e) => setShouldSaveAsMeal(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Save as reusable preset meal</span>
                    </label>
                    {shouldSaveAsMeal && (
                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        placeholder="Meal Name (e.g. Morning Protein Bowl)"
                        className="w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : activeTab === 'text' ? (
            /* Quick Text Description Tab */
            <form onSubmit={handleSubmit} id="food-log-form" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Type or dictate what you ate in natural language.
                </p>

                {/* Inline Dictate Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title={isListening ? "Stop voice dictation" : "Dictate with voice"}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    <span>{isListening ? "Listening..." : "Dictate"}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (analysisResult) setAnalysisResult(null);
                    if (wrongFoodError) setWrongFoodError(null);
                  }}
                  placeholder="e.g. 2 boiled eggs, 1 medium banana, and a cup of black coffee with 1 tsp sugar..."
                  className="w-full h-32 bg-[#f8faf9] dark:bg-[#0b0f16] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all placeholder:text-slate-400"
                  disabled={isSubmitting || isAnalyzing}
                  autoFocus
                />
              </div>

              {/* Quick suggestion tags */}
              <div className="flex flex-wrap gap-1.5">
                {["Oatmeal with berries", "Grilled Chicken Salad", "Protein Shake & Banana", "2 Roti with Dal"].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { 
                      setInput(preset); 
                      setAnalysisResult(null); 
                      setWrongFoodError(null);
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {isAnalyzing && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-semibold animate-pulse">
                  <Loader2 className="animate-spin shrink-0" size={18} />
                  <span>Verifying food items & calculating breakdown...</span>
                </div>
              )}

              {/* ⚠️ Wrong Meal Error for Text */}
              {wrongFoodError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-xs text-rose-700 dark:text-rose-300">
                        Not Recognized as Food
                      </h4>
                      <p className="text-xs text-rose-600/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                        {wrongFoodError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis result for text */}
              {analysisResult && (
                <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-500/[0.04] space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={14} /> Nutrition Calculated
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {analysisResult.total?.calories || 0} kcal total
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                    {analysisResult.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-white/5">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {item.quantity} {item.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold">
                      {analysisResult.total?.protein || 0}g <span className="text-[10px] opacity-75">P</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                      {analysisResult.total?.carbs || 0}g <span className="text-[10px] opacity-75">C</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                      {analysisResult.total?.fat || 0}g <span className="text-[10px] opacity-75">F</span>
                    </div>
                  </div>

                  {/* NutriScore & Healthy Swap Insights */}
                  {(analysisResult.healthScore || analysisResult.insights) && (
                    <div className="pt-1">
                      <NutriScoreCard 
                        healthScore={analysisResult.healthScore} 
                        insights={analysisResult.insights} 
                      />
                    </div>
                  )}

                  {/* Save Preset Checkbox */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={shouldSaveAsMeal}
                        onChange={(e) => setShouldSaveAsMeal(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Save as reusable preset meal</span>
                    </label>
                    {shouldSaveAsMeal && (
                      <input
                        type="text"
                        value={mealName}
                        onChange={(e) => setMealName(e.target.value)}
                        placeholder="Meal Name (e.g. My Favorite Breakfast)"
                        className="w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    )}
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Saved Presets Tab */
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any saved meal to log it immediately to today's diary.
              </p>

              {isLoadingMeals ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-emerald-500" size={28} />
                  <span className="text-xs font-medium">Loading your presets...</span>
                </div>
              ) : savedMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedMeals.map((meal) => (
                    <div
                      key={meal._id}
                      onClick={() => logSavedMeal(meal)}
                      className="group p-4 bg-white/60 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all relative flex flex-col justify-between"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMealIdToDelete(meal._id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-rose-500/10"
                        title="Delete saved meal"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap pr-6">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                            {meal.name}
                          </h4>
                          {meal.healthScore && (
                            <NutriScoreCard compact healthScore={meal.healthScore} />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {meal.items?.map(i => i.name).join(', ')}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/50 dark:border-white/5">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {meal.total?.calories || 0} kcal
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition">
                          <span>Log</span>
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-center p-6">
                  <Utensils size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs text-slate-500">
                    No saved presets yet.<br />Check "Save as reusable preset meal" when logging from Photo, Voice, or Describe tabs!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 🔻 Modal Footer Actions */}
        <div className="p-4 md:p-5 border-t border-slate-200/80 dark:border-white/10 bg-[#f8faf9]/80 dark:bg-[#0b0f16]/80 shrink-0 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isAnalyzing}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancel
          </button>

          {isSubscribed && activeTab !== 'saved' && (
            <button
              onClick={activeTab === 'voice' && !analysisResult ? () => handleAnalyzeVoiceMeal() : handleSubmit}
              disabled={(!input.trim() && !voiceTranscript.trim() && !analysisResult) || isSubmitting || isAnalyzing || !!wrongFoodError}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Logging to Diary...</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Analyzing...</span>
                </>
              ) : !analysisResult ? (
                <>
                  <Sparkles size={16} />
                  <span>{activeTab === 'voice' ? "Calculate Macros" : "Analyze Meal"}</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirm & Log</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteSavedMeal}
        title="Delete Saved Preset?"
        description="Are you sure you want to remove this meal from your presets? You can re-save it anytime."
      />
    </div>
  );
}
