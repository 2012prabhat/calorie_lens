'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Target, 
  Utensils, 
  Droplet, 
  Apple, 
  Save, 
  Dumbbell, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Sparkles,
  Flame,
  Scale,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import AlertDialog from '@/components/ui/AlertDialog';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentPlan, setSavedMeals } from '@/store/slices/planSlice';

export default function PlanPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const currentPlan = useSelector(state => state.plan.currentPlan);
  const savedMeals = useSelector(state => state.plan.savedMeals);
  const isPlanLoaded = useSelector(state => state.plan.isPlanLoaded);
  const isMealsLoaded = useSelector(state => state.plan.isMealsLoaded);

  const [loading, setLoading] = useState(!isPlanLoaded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(!isMealsLoaded);

  // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mealIdToDelete, setMealIdToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    goal: 'maintain',
  });

  const fetchPlan = async () => {
    try {
      if (!isPlanLoaded) setLoading(true);
      const res = await axios.get('/api/plan');
      if (res.data.data && res.data.data.length > 0) {
        dispatch(setCurrentPlan(res.data.data[0]));
        // prefill form if available
        const p = res.data.data[0];
        setFormData(prev => ({
          ...prev,
          weight: p.weight || prev.weight,
          height: p.height || prev.height,
          age: p.age || prev.age,
          gender: p.gender || prev.gender,
          activityLevel: p.activityLevel || prev.activityLevel,
          goal: p.goal || prev.goal,
        }));
      } else {
        dispatch(setCurrentPlan(null));
      }
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedMeals = async () => {
    try {
      if (!isMealsLoaded) setLoadingMeals(true);
      const res = await axios.get('/api/meals');
      dispatch(setSavedMeals(res.data.data || []));
    } catch (err) {
      console.error("Failed to fetch saved meals:", err);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchSavedMeals();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteMeal = async () => {
    if (!mealIdToDelete) return;
    try {
      await axios.delete(`/api/meals/${mealIdToDelete}`);
      dispatch(setSavedMeals(savedMeals.filter(m => m._id !== mealIdToDelete)));
      toast.success("Meal removed from presets.");
    } catch (err) {
      console.error("Failed to delete meal:", err);
      toast.error("Failed to delete meal");
    } finally {
      setMealIdToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        weight: Number(formData.weight),
        height: Number(formData.height),
        age: Number(formData.age),
      };

      const res = await axios.post('/api/plan', payload);
      toast.success("Nutrition Plan updated successfully!");
      dispatch(setCurrentPlan(res.data.data));
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Failed to update plan:", err);
      toast.error(err.response?.data?.error || "Failed to update plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="mt-6 text-slate-400 font-medium text-sm animate-pulse">
          Loading your personalized nutrition plan...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Delete Confirmation */}
      <AlertDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteMeal}
        title="Delete Saved Meal?"
        description="This will permanently remove this preset meal from your list. You can save it again anytime."
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Nutrition{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400">
            Strategy & Goals
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Calculate your energy expenditure (TDEE) and customize your target macronutrients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Calculator Form (7 cols) */}
        <div className="lg:col-span-7 glass-panel-elevated rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Dumbbell size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Macro Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scientifically calibrated based on the Mifflin-St Jeor formula
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Metric Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Weight (kg)
                </label>
                <input 
                  type="number" 
                  name="weight" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  required 
                  min="30" 
                  max="300"
                  step="0.5"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold" 
                  placeholder="e.g. 75"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Height (cm)
                </label>
                <input 
                  type="number" 
                  name="height" 
                  value={formData.height} 
                  onChange={handleChange} 
                  required 
                  min="100" 
                  max="250"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold" 
                  placeholder="e.g. 178"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Age (years)
                </label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  required 
                  min="10" 
                  max="100"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold" 
                  placeholder="e.g. 26"
                />
              </div>
            </div>

            {/* Gender Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center ${
                    formData.gender === 'male'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all text-center ${
                    formData.gender === 'female'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            {/* Goal Selector Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Primary Goal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'lose', title: 'Fat Loss', desc: '-500 kcal deficit', emoji: '🔥' },
                  { id: 'maintain', title: 'Maintain', desc: 'Equalize TDEE', emoji: '⚖️' },
                  { id: 'gain', title: 'Muscle Gain', desc: '+500 kcal surplus', emoji: '💪' },
                ].map((g) => {
                  const isSelected = formData.goal === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setFormData({ ...formData, goal: g.id })}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <span className="text-xl mb-1">{g.emoji}</span>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {g.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {g.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Weekly Activity Level
              </label>
              <select 
                name="activityLevel" 
                value={formData.activityLevel} 
                onChange={handleChange} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
              >
                <option value="sedentary">Sedentary (Desk job, little to no exercise)</option>
                <option value="light">Lightly Active (Workouts 1-3 days/week)</option>
                <option value="moderate">Moderately Active (Workouts 3-5 days/week)</option>
                <option value="active">Very Active (Heavy training 6-7 days/week)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Recalculating Plan...</span>
              ) : (
                <>
                  <Save size={16} />
                  <span>Update & Set Target Goals</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Active Plan & Educational Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {currentPlan ? (
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Active Plan</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentPlan.goal === 'lose' ? 'Weight Loss' : currentPlan.goal === 'gain' ? 'Muscle Gain' : 'Maintenance'}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Daily Calorie Target
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                      {currentPlan.targetCalories}
                    </span>
                    <span className="text-sm font-bold text-slate-400">kcal / day</span>
                  </div>
                </div>

                {/* Macro breakdown columns */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <span className="text-[11px] font-bold text-blue-500 uppercase block mb-1">Protein</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {Number(currentPlan.protein || 0).toFixed(0)}g
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">30% kcal</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[11px] font-bold text-amber-500 uppercase block mb-1">Carbs</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {Number(currentPlan.carbs || 0).toFixed(0)}g
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">40% kcal</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[11px] font-bold text-rose-500 uppercase block mb-1">Fat</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {Number(currentPlan.fat || 0).toFixed(0)}g
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">30% kcal</span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                <Target size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Active Plan Set</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Fill out the metrics on the left to calculate your personalized macronutrient plan.
              </p>
            </div>
          )}

          {/* Educational Note */}
          <div className="glass-panel rounded-3xl p-5 border border-cyan-500/20 bg-cyan-500/[0.03]">
            <h4 className="text-cyan-500 font-bold mb-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Info size={14} /> The Science Behind Calorie Lens
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              We calculate your Basal Metabolic Rate (BMR) from your height, weight, and age, scale it with your activity coefficient (TDEE), and apply an optimized deficit or surplus. Macronutrients are balanced dynamically (30% Protein, 40% Carbs, 30% Healthy Fats) to preserve lean mass while optimizing energy levels.
            </p>
          </div>
        </div>

      </div>

      {/* 🍲 Saved Preset Meals Collection */}
      <div className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Utensils size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Saved Meal Presets
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quick-add meals you eat regularly
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {savedMeals.length} Saved
          </span>
        </div>

        {loadingMeals ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : savedMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedMeals.map((meal) => (
              <div 
                key={meal._id}
                className="group glass-panel-elevated rounded-3xl p-5 transition-all hover:border-emerald-500/40 relative overflow-hidden flex flex-col justify-between"
              >
                <button 
                  onClick={() => { setMealIdToDelete(meal._id); setIsDeleteDialogOpen(true); }}
                  className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Preset"
                >
                  <Trash2 size={15} />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                    🍲
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm pr-6 capitalize line-clamp-1">
                      {meal.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {meal.items?.map(i => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/50 dark:border-white/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Calories</span>
                    <span className="text-base font-black text-emerald-500">
                      {meal.total?.calories || 0} <span className="text-[10px] font-normal text-slate-500">kcal</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Protein</span>
                    <span className="text-base font-black text-blue-500">
                      {meal.total?.protein || 0}g
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-xs text-slate-500">
                  <span>Carbs: <strong className="text-amber-500">{meal.total?.carbs || 0}g</strong></span>
                  <span>•</span>
                  <span>Fat: <strong className="text-rose-500">{meal.total?.fat || 0}g</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <Utensils size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Saved Presets</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
              When logging meals in the dashboard, check "Save as reusable preset meal" to store them here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
