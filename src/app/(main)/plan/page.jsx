'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Target, Utensils, Droplet, Apple, Save, Dumbbell, ShieldCheck, Trash2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import AlertDialog from '@/components/ui/AlertDialog';

export default function PlanPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Saved meals state
  const [savedMeals, setSavedMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

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
      setLoading(true);
      const res = await axios.get('/api/plan');
      if (res.data.data && res.data.data.length > 0) {
        setCurrentPlan(res.data.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedMeals = async () => {
    try {
      setLoadingMeals(true);
      const res = await axios.get('/api/meals');
      setSavedMeals(res.data.data);
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
      setSavedMeals(prev => prev.filter(m => m._id !== mealIdToDelete));
      toast.success("Meal deleted successfully!");
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
      toast.success("Plan updated successfully!");
      setCurrentPlan(res.data.data);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
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
        <p className="mt-6 text-gray-400 font-medium">Loading your plan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Delete Confirmation */}
      <AlertDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteMeal}
        title="Delete Saved Meal?"
        description="This will permanently remove this meal from your saved meals list. You'll need to log it manually next time."
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Nutrition Plan
        </h1>
        <p className="text-gray-400 mt-1">Calculate and set your daily macronutrient goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Calculator Form */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white mb-6">
            <Dumbbell className="text-emerald-500" size={22} />
            Calculate Goals
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight" 
                  value={formData.weight} 
                  onChange={handleChange} 
                  required 
                  min="30" max="300"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                  placeholder="e.g. 75"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  value={formData.height} 
                  onChange={handleChange} 
                  required 
                  min="100" max="250"
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                  placeholder="e.g. 175"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age} 
                onChange={handleChange} 
                required 
                min="10" max="100"
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
                placeholder="e.g. 25"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Goal</label>
                <select 
                  name="goal" 
                  value={formData.goal} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="lose">Weight Loss</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Muscle Gain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Activity Level</label>
              <select 
                name="activityLevel" 
                value={formData.activityLevel} 
                onChange={handleChange} 
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                   <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                   Calculating...
                </>
              ) : (
                <>
                  <Save size={18} /> Generate Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Current Plan Output */}
        <div className="space-y-6">
          {currentPlan ? (
            <div className="bg-gradient-to-br from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden group shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    Active Plan
                  </h2>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentPlan.goal === 'lose' ? 'Weight Loss' : currentPlan.goal === 'gain' ? 'Muscle Gain' : 'Maintain'}
                  </span>
                </div>

                <div className="mb-8">
                  <p className="text-gray-400 text-sm font-medium mb-1">Daily Target</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      {currentPlan.targetCalories}
                    </span>
                    <span className="text-gray-500 font-bold mb-1">kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Protein */}
                  <div className="bg-white dark:bg-gray-950 border border-slate-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                         <Utensils size={14} className="text-blue-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Protein</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{Number(currentPlan.protein || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</p>
                    <p className="text-xs text-gray-500 mt-1">~30%</p>
                  </div>

                  {/* Carbs */}
                  <div className="bg-white dark:bg-gray-950 border border-slate-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg">
                         <Apple size={14} className="text-purple-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Carbs</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{Number(currentPlan.carbs || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</p>
                    <p className="text-xs text-gray-500 mt-1">~40%</p>
                  </div>

                  {/* Fat */}
                  <div className="bg-white dark:bg-gray-950 border border-slate-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                         <Droplet size={14} className="text-yellow-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Fat</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{Number(currentPlan.fat || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}g</p>
                    <p className="text-xs text-gray-500 mt-1">~30%</p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Target size={28} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">No Active Plan</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">
                Fill out the calculator form to generate your personalized macronutrient goals.
              </p>
            </div>
          )}

          {/* Educational Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6">
            <h4 className="text-blue-400 font-bold mb-2 text-sm flex items-center gap-2">
               <Activity size={16} /> How it works
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We calculate your Base Metabolic Rate (BMR) based on your metrics, adjust for your activity level to find your TDEE, and then add or subtract 500 calories depending on your specific goal. Macros are split dynamically into 30% Protein, 40% Carbs, and 30% Fat for a balanced diet.
            </p>
          </div>
        </div>

      </div>

      {/* My Meals Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Utensils className="text-emerald-500" size={24} />
            My Meals
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
            {savedMeals.length} Saved
          </span>
        </div>

        {loadingMeals ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
          </div>
        ) : savedMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedMeals.map((meal) => (
              <div 
                key={meal._id}
                className="group bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 transition-all hover:shadow-xl hover:border-emerald-500/30 relative overflow-hidden"
              >
                <button 
                  onClick={() => { setMealIdToDelete(meal._id); setIsDeleteDialogOpen(true); }}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Meal"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 pr-6">{meal.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {meal.items.map(i => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Calories</p>
                    <p className="text-lg font-black text-emerald-500">{meal.total.calories}<span className="text-xs ml-1 font-normal text-gray-500">kcal</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Protein</p>
                    <p className="text-lg font-black text-blue-500">{meal.total.protein}<span className="text-xs ml-1 font-normal text-gray-500">g</span></p>
                  </div>
                </div>

                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Carbs</p>
                    <p className="text-sm font-bold text-purple-500">{meal.total.carbs}g</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Fat</p>
                    <p className="text-sm font-bold text-yellow-500">{meal.total.fat}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
              <Utensils size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200">No Saved Meals</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[280px] mt-2">
              Save your frequent meals while logging food to see them here for quick access.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
