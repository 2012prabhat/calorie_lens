'use client';

import React, { useState, useRef, useEffect, useContext, Suspense } from 'react';
import axios from 'axios';
import { 
  ArrowLeft,
  Camera, 
  Mic, 
  MicOff, 
  FileText, 
  Bookmark, 
  Sparkles, 
  Loader2, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  UploadCloud, 
  RotateCcw, 
  Zap, 
  Flame, 
  Lightbulb, 
  CheckCircle2,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserContext } from '@/context/UserContext';
import AlertDialog from '@/components/ui/AlertDialog';
import NutriScoreCard from '@/components/dashboard/NutriScoreCard';
import { triggerCelebration } from '@/lib/confetti';

function LogMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab') || 'photo';

  const { user, setUser } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState(
    ['photo', 'voice', 'text', 'saved'].includes(initialTabParam) ? initialTabParam : 'photo'
  );

  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image states
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [wrongFoodError, setWrongFoodError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Voice recording states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Saved meals states
  const [savedMeals, setSavedMeals] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [shouldSaveAsMeal, setShouldSaveAsMeal] = useState(false);
  const [mealName, setMealName] = useState('');

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

  // Fetch saved presets when tab switches
  useEffect(() => {
    if (activeTab === 'saved' && isSubscribed) {
      fetchSavedMeals();
    }
  }, [activeTab, isSubscribed]);

  // Clean up speech recognition on unmount
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
      console.error('Error fetching meals:', err);
      toast.error('Failed to load saved meals.');
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setActivatingTrial(true);
      await axios.post('/api/subscription/trial');
      toast.success('7-Day Free Trial activated! You can now log meals.');
      if (setUser) {
        setUser(prev => ({
          ...prev,
          subscriptionStatus: 'trialing',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
    } catch (err) {
      console.error('Trial activation failed:', err);
      toast.error(err.response?.data?.error || 'Failed to activate trial');
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
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions in your browser.');
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error('Speech recognition error: ' + event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech initialization error:', err);
      setIsListening(false);
    }
  };

  const handleAnalyzeVoiceMeal = async (customText = null) => {
    if (isListening) {
      stopListening();
    }

    const textToAnalyze = (customText || voiceTranscript || input || '').trim();
    if (!textToAnalyze) {
      toast.error('Please speak or enter what you ate first.');
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
        const msg = response.data.data.rejectionReason || 'This does not appear to be food or drink.';
        setWrongFoodError(msg);
        toast.error(msg, { icon: '⚠️', duration: 5000 });
        return;
      }

      setAnalysisResult(response.data.data);
      toast.success('Meal analyzed with Gemini AI!');
    } catch (err) {
      console.error('Error analyzing voice text:', err);
      const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
      const errorMsg = err.response?.data?.error || 'Failed to analyze speech. Please try speaking again.';
      if (isWrongFood) {
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: '⚠️', duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 📸 Image Handlers
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      toast.error('Please drop a valid food image file.');
    }
  };

  const processImageFile = (file) => {
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
        const errorMsg = response.data.error || 'Wrong meal image: No food or drink detected in this photo.';
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: '⚠️', duration: 5000 });
        return;
      }

      setAnalysisResult(response.data);
      const description = response.data.items?.map(i => `${i.quantity} ${i.name}`).join(', ') || '';
      setInput(description);
      toast.success('Meal analyzed with Gemini AI!');
    } catch (err) {
      console.error('Error analyzing image:', err);
      const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
      const errorMsg = err.response?.data?.error || (isWrongFood ? 'Wrong meal image: No food or drink detected.' : 'Failed to analyze image. You can describe it in the text tab.');
      
      if (isWrongFood) {
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: '⚠️', duration: 5000 });
      } else {
        toast.error(errorMsg);
        setImage(null);
        setImagePreview(null);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    stopListening();
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setWrongFoodError(null);
    setInput('');
    setVoiceTranscript('');
    setShouldSaveAsMeal(false);
    setMealName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      triggerCelebration();
      toast.success(`${meal.name} logged successfully!`);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error logging meal:', err);
      toast.error('Failed to log meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSavedMeal = async () => {
    if (!mealIdToDelete) return;
    try {
      await axios.delete(`/api/meals/${mealIdToDelete}`);
      setSavedMeals(prev => prev.filter(m => m._id !== mealIdToDelete));
      toast.success('Meal removed from presets.');
    } catch (err) {
      console.error('Error deleting meal:', err);
      toast.error('Failed to delete meal.');
    } finally {
      setMealIdToDelete(null);
    }
  };

  const handleAnalyzeText = async (e) => {
    if (e) e.preventDefault();
    if (wrongFoodError) {
      toast.error('Please provide a valid meal or food item first.');
      return;
    }
    const textToAnalyze = (input || voiceTranscript || '').trim();
    if (!textToAnalyze) {
      toast.error('Please enter what you ate.');
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
        const msg = response.data.data.rejectionReason || 'This does not appear to be food or drink.';
        setWrongFoodError(msg);
        toast.error(msg, { icon: '⚠️', duration: 5000 });
        return;
      }

      setAnalysisResult(response.data.data);
      toast.success('Nutrients & NutriScore calculated!');
    } catch (err) {
      console.error('Error analyzing text:', err);
      const isWrongFood = err.response?.status === 422 || err.response?.data?.isFood === false;
      const errorMsg = err.response?.data?.error || 'Failed to analyze text. Please check description.';
      if (isWrongFood) {
        setWrongFoodError(errorMsg);
        toast.error(errorMsg, { icon: '⚠️', duration: 5000 });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmLog = async () => {
    if (!analysisResult) return;

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
        userInput: input || mealName || 'Logged via CalorieLens AI',
        aiData: analysisResult
      };

      await axios.post('/api/food/log', payload);
      triggerCelebration();
      toast.success('Food logged successfully!');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error logging food:', err);
      toast.error(err.response?.data?.error || 'Failed to log food. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 🔝 Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-500 transition mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Log Your Meal
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Sparkles size={12} />
              <span>Gemini AI</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Take a photo, dictate hands-free, or describe what you ate. CalorieLens calculates calories, macros, and NutriScores automatically.
          </p>
        </div>

        {/* Quick Reset Button */}
        {(analysisResult || imagePreview || voiceTranscript || input) && (
          <button
            type="button"
            onClick={resetAll}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
          >
            <RotateCcw size={13} />
            <span>Reset Form</span>
          </button>
        )}
      </div>

      {/* 💳 Subscription / Trial Banner */}
      {!isSubscribed && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {canUseTrial ? 'Start 7-Day Free Trial' : 'Pro Membership Required'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {canUseTrial
                  ? 'Unlock instant AI food photo scanning, voice logging, and NutriScore insights.'
                  : 'Upgrade to active plan to unlock unlimited AI meal analyses.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canUseTrial ? (
              <button
                type="button"
                onClick={handleStartTrial}
                disabled={activatingTrial}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {activatingTrial && <Loader2 size={13} className="animate-spin" />}
                <span>Activate Free Trial</span>
              </button>
            ) : (
              <Link
                href="/pricing"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition hover:scale-105 active:scale-95"
              >
                View Plans
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 🧭 Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'photo', label: 'Photo AI', icon: Camera, badge: 'Visual Scan' },
          { id: 'voice', label: 'Hands-Free Voice', icon: Mic, badge: 'Speech AI' },
          { id: 'text', label: 'Describe Meal', icon: FileText, badge: 'Natural Text' },
          { id: 'saved', label: 'Saved Presets', icon: Bookmark, badge: savedMeals.length > 0 ? `${savedMeals.length}` : null },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setWrongFoodError(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-[#0c1017] text-slate-600 dark:text-slate-400 border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 📱 Main Interactive 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Input Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* ⚠️ Non-Food Rejection Alert */}
          {wrongFoodError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                    Non-Food Item Detected
                  </h4>
                  <p className="text-xs text-rose-700/90 dark:text-rose-300/90 mt-1 leading-relaxed">
                    {wrongFoodError}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWrongFoodError(null);
                        if (activeTab === 'photo') fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <UploadCloud size={14} />
                      <span>Upload Food Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetAll}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 📸 PHOTO AI */}
          {activeTab === 'photo' && (
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="text-emerald-500" size={20} />
                  <span>Snap or Upload Food Photo</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gemini Vision detects every dish on your plate, estimates portion weights, and calculates exact calories and macros.
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageChange}
              />

              {!imagePreview ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
                      : 'border-slate-300 dark:border-white/15 bg-slate-50/50 dark:bg-[#090d14]/60 hover:border-emerald-500/50 hover:bg-emerald-500/[0.03]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                    <UploadCloud size={30} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Drop food image here, or <span className="text-emerald-500 underline">browse</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP, or live camera snapshots up to 10MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <Camera size={15} />
                    <span>Choose Photo / Camera</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-[380px] bg-slate-950 flex items-center justify-center group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="w-full h-full object-cover max-h-[380px]"
                    />
                    
                    {/* Overlay Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-950/75 hover:bg-slate-950 text-white font-bold text-xs backdrop-blur-md transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
                      >
                        <Camera size={13} />
                        <span>Retake</span>
                      </button>
                      <button
                        type="button"
                        onClick={resetAll}
                        className="p-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs backdrop-blur-md transition border border-white/20 cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                        <Loader2 className="animate-spin text-emerald-400" size={36} />
                        <span className="font-extrabold text-sm tracking-wide">
                          Gemini Vision is analyzing ingredients...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 🎙️ VOICE AI */}
          {activeTab === 'voice' && (
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="text-emerald-500" size={20} />
                  <span>Hands-Free Speech Meal Logging</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Speak naturally into your device microphone. Gemini extracts each ingredient and portion effortlessly.
                </p>
              </div>

              {!speechSupported && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                  <span>
                    Speech recognition is not natively supported in this browser. Please use Chrome, Safari, or Edge, or switch to the <strong>Describe Meal</strong> tab.
                  </span>
                </div>
              )}

              {/* 🎙️ Glowing Pulse Microphone Orb */}
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 dark:bg-[#090d14]/60 rounded-3xl border border-slate-200/80 dark:border-white/5">
                <div className="relative flex items-center justify-center">
                  {isListening && (
                    <>
                      <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 animate-ping" />
                      <div className="absolute w-28 h-28 rounded-full bg-emerald-500/30 animate-pulse" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={!speechSupported}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isListening
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 scale-105'
                        : 'bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25 hover:scale-105 active:scale-95'
                    } ${!speechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {isListening ? (
                      <>
                        <MicOff size={30} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic size={30} />
                        <span className="text-[10px] font-black uppercase tracking-wider mt-1">Speak</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-5">
                  {isListening ? 'Listening... Speak what you ate naturally' : 'Tap the microphone to start dictating'}
                </p>
              </div>

              {/* Live Voice Transcript Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Voice Transcription:</span>
                  {isListening && (
                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                      Recording Live
                    </span>
                  )}
                </label>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-white/10 min-h-[90px] text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {voiceTranscript || input || (
                    <span className="text-slate-400 italic">
                      Your spoken meal description will appear here in real-time...
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAnalyzeVoiceMeal()}
                  disabled={isAnalyzing || (!voiceTranscript.trim() && !input.trim())}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Analyzing Speech with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Calculate Nutrition from Voice</span>
                    </>
                  )}
                </button>

                {(voiceTranscript || input) && (
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript('');
                      setInput('');
                      setAnalysisResult(null);
                    }}
                    className="p-3 rounded-2xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    title="Clear transcript"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Suggested Test Phrases */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or tap an example to test:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    '2 paneer parathas with 1 cup plain curd',
                    'Grilled chicken breast with steamed broccoli and brown rice',
                    'Oatmeal with blueberries, banana, and 1 scoop whey protein',
                    '1 cup masala chai with 2 whole wheat digestive biscuits'
                  ].map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVoiceTranscript(phrase);
                        setInput(phrase);
                        handleAnalyzeVoiceMeal(phrase);
                      }}
                      className="text-left p-3 rounded-xl bg-slate-50 dark:bg-[#0c1017] hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 transition group flex items-start gap-2 cursor-pointer"
                    >
                      <span className="text-emerald-500 group-hover:scale-110 transition-transform">💬</span>
                      <span className="line-clamp-2">&ldquo;{phrase}&rdquo;</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ✍️ DESCRIBE MEAL */}
          {activeTab === 'text' && (
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-emerald-500" size={20} />
                  <span>Describe Meal in Plain Words</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Type what you ate in everyday conversational English or Hinglish. Include quantities for best precision.
                </p>
              </div>

              <form onSubmit={handleAnalyzeText} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="E.g., 2 slices whole wheat toast with 2 poached eggs, half an avocado, and a black coffee with no sugar"
                    className="w-full p-4 rounded-2xl bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none shadow-sm leading-relaxed"
                  />

                  {/* Dictate shortcut inside textarea */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-3 bottom-3 p-2 rounded-xl transition ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={isListening ? 'Stop dictation' : 'Dictate with voice'}
                    >
                      <Mic size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isAnalyzing || !input.trim()}
                    className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing Text with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Calculate Nutrition</span>
                      </>
                    )}
                  </button>

                  {input && (
                    <button
                      type="button"
                      onClick={() => {
                        setInput('');
                        setAnalysisResult(null);
                      }}
                      className="p-3 rounded-2xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                      title="Clear text"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Quick Prompt Chips */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick examples:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    '2 butter rotis with 1 bowl paneer butter masala',
                    'Protein smoothie with 1 banana, peanut butter, milk, and whey',
                    '1 bowl chicken biryani with raita',
                    'Greek yogurt with mixed berries and honey'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInput(chip);
                        handleAnalyzeVoiceMeal(chip);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-500/10 dark:bg-[#0c1017] dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 🔖 SAVED PRESETS */}
          {activeTab === 'saved' && (
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="text-emerald-500" size={20} />
                    <span>Saved Preset Meals</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    One-tap logging for meals you eat regularly.
                  </p>
                </div>
              </div>

              {isLoadingMeals ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Loader2 className="animate-spin text-emerald-500" size={32} />
                  <span className="text-xs font-semibold">Loading your saved meals...</span>
                </div>
              ) : savedMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {savedMeals.map((meal) => (
                    <div
                      key={meal._id}
                      onClick={() => logSavedMeal(meal)}
                      className="group p-4 bg-white dark:bg-[#0c1017] border border-slate-200/90 dark:border-white/10 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all relative flex flex-col justify-between shadow-sm hover:shadow-md"
                    >
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMealIdToDelete(meal._id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                        title="Delete preset"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap pr-6">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm capitalize">
                            {meal.name}
                          </h4>
                          {meal.healthScore && (
                            <NutriScoreCard compact healthScore={meal.healthScore} />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                          {meal.items?.map(i => i.name).join(', ')}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {meal.total?.calories || 0} kcal
                        </span>
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 transition">
                          <span>Log Now</span>
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 px-4 rounded-3xl bg-slate-50/50 dark:bg-[#0c1017]/60 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-3">
                    <Utensils size={26} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    No Saved Presets Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    When you analyze a meal via Photo, Voice, or Describe tab, check <strong>&ldquo;Save as reusable preset meal&rdquo;</strong> to save it here!
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: AI Analysis Result & NutriScore Card (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">

          {analysisResult ? (
            /* Live AI Analysis Results Card */
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border-2 border-emerald-500/40 bg-emerald-500/[0.03] space-y-5 animate-in fade-in duration-300 shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Analysis Ready
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {analysisResult.total?.calories || 0}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                    kcal
                  </span>
                </div>
              </div>

              {/* Items Breakdown List */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Identified Food Items ({analysisResult.items?.length || 0})
                </span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                  {analysisResult.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/5"
                    >
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">
                        {item.quantity} {item.name}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro Pills Breakdown */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold">
                  <span className="text-base font-black block">{analysisResult.total?.protein || 0}g</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Protein</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold">
                  <span className="text-base font-black block">{analysisResult.total?.carbs || 0}g</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Carbs</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold">
                  <span className="text-base font-black block">{analysisResult.total?.fat || 0}g</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Fat</span>
                </div>
              </div>

              {/* 🥗 NutriScore & Healthy Swap Insights */}
              {(analysisResult.healthScore || analysisResult.insights) && (
                <div className="pt-2">
                  <NutriScoreCard 
                    healthScore={analysisResult.healthScore} 
                    insights={analysisResult.insights} 
                  />
                </div>
              )}

              {/* Save as Preset Checkbox */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    placeholder="Meal Name (e.g. My Power Breakfast)"
                    className="w-full mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                )}
              </div>

              {/* Confirm & Log Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmLog}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Logging to Diary...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} strokeWidth={3} />
                      <span>Confirm & Log to Diary</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition text-center cursor-pointer"
                >
                  Discard Analysis
                </button>
              </div>

            </div>
          ) : (
            /* Empty State / AI Preview Guide Card */
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Sparkles size={24} />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Live AI Food Insights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Provide an image, voice recording, or description on the left. CalorieLens will calculate:
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    title: 'Ingredient & Portion Parsing',
                    desc: 'Accurately estimates grams and servings for individual food components.'
                  },
                  {
                    title: 'Macronutrient Split (P / C / F)',
                    desc: 'Real-time breakdown of Protein, Carbohydrates, and Fats.'
                  },
                  {
                    title: 'NutriScore & Healthy Swap',
                    desc: 'Evidence-based health grade (A–E) and actionable swap tips to cut glycemic spikes.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 dark:bg-[#0c1017]/70 border border-slate-200/70 dark:border-white/5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                <Info size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Pro Tip:</strong> For the most precise nutritional estimation, mention portion sizes (e.g. &ldquo;2 rotis&rdquo; or &ldquo;1 cup cooked rice&rdquo;).
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Delete Preset Meal Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={deleteSavedMeal}
        title="Delete Saved Meal Preset"
        description="Are you sure you want to delete this preset meal? This action cannot be undone."
        confirmText="Delete Preset"
        type="danger"
      />

    </div>
  );
}

function LogMealSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="lg:col-span-5 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    </div>
  );
}

export default function LogMealPage() {
  return (
    <Suspense fallback={<LogMealSkeleton />}>
      <LogMealContent />
    </Suspense>
  );
}
