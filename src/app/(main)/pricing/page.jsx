'use client'

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Check, Sparkles, Zap, Star, Shield, ArrowRight, Loader2, Calendar, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'plan_7days',
    name: 'Quick Kickstart',
    duration: '7 Days',
    price: '₹50',
    description: 'Perfect for a week of focused tracking and testing.',
    features: [
      'Multimodal AI Photo Analysis',
      'Targeted Protein, Carb & Fat Breakdown',
      '7-Day Diary History & Trends',
      'Unlimited Meal Presets'
    ],
    accent: 'emerald',
    icon: <Clock size={22} className="text-emerald-500" />
  },
  {
    id: 'plan_1month',
    name: 'Monthly Goal-Getter',
    duration: '1 Month',
    price: '₹100',
    description: 'Our most popular choice for sustainable body transformation.',
    popular: true,
    features: [
      'Everything in Quick Kickstart',
      'Weight Journey & Trend Analytics',
      'Priority Gemini Vision AI Processing',
      'Early Access to New Health Features',
      'Personalized Nutrition Plan Generator'
    ],
    accent: 'cyan',
    icon: <Zap size={22} className="text-cyan-500" />
  },
  {
    id: 'plan_1year',
    name: 'Annual Legend',
    duration: '1 Year',
    price: '₹1000',
    description: 'Best long-term value for permanent health & fitness mastery.',
    features: [
      'Everything in Monthly Goal-Getter',
      'Best Price Guarantee (Save ₹200/year)',
      'Lifetime Diary & Weight Trend Access',
      'Priority Customer & AI Support',
      'VIP Feature Request Access'
    ],
    accent: 'indigo',
    icon: <Star size={22} className="text-indigo-500" />
  }
];

export default function PricingPage() {
  const { user, setUser, loading: userLoading } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const router = useRouter();

  const handleSubscribe = async (planId) => {
    try {
      setLoading(planId);
      const res = await axios.post('/api/stripe/checkout', { planId });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Subscription failed:", err);
      toast.error(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setActivatingTrial(true);
      await axios.post('/api/subscription/trial');
      toast.success("7-Day Free Trial activated successfully!");
      if (setUser) {
        setUser(prev => ({
          ...prev,
          subscriptionStatus: 'trialing',
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
      }
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      console.error("Trial activation failed:", err);
      toast.error(err.response?.data?.error || "Failed to activate trial");
    } finally {
      setActivatingTrial(false);
    }
  };

  if (userLoading) return null;

  const isTrialAvailable = user && !user.hasUsedTrial && user.subscriptionStatus === 'inactive';
  const isSubscribed = user && (
    (user.subscriptionStatus === 'active' && (!user.subscriptionEndDate || new Date(user.subscriptionEndDate) > new Date())) || 
    (user.subscriptionStatus === 'trialing' && (!user.trialEndDate || new Date(user.trialEndDate) > new Date()))
  );

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* 🏷️ Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4 backdrop-blur-md">
          <Sparkles size={14} />
          <span>Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          Fuel Your Fitness with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
            Calorie Lens Pro
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          No complicated subscriptions. Choose the duration that suits your routine and cancel anytime.
        </p>
      </div>

      {/* 🌟 7-Day Free Trial Banner if eligible */}
      {isTrialAvailable && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 text-center border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={13} />
                Risk Free
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
                Start Your 7-Day Free Trial
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto mb-6">
                Test full AI meal scanning and macro tracking with zero upfront cost. No credit card required.
              </p>

              <button
                onClick={handleStartTrial}
                disabled={activatingTrial}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 flex items-center gap-2 mx-auto text-sm"
              >
                {activatingTrial ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Activating your trial...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Activate 7-Day Free Trial</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💳 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => {
          const isPop = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col p-7 sm:p-8 rounded-3xl transition-all duration-300 justify-between ${
                isPop 
                  ? 'glass-panel-elevated bg-white/95 dark:bg-slate-900/95 border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/15 md:-translate-y-2' 
                  : 'glass-panel-elevated bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {isPop && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-950 shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-2xl ${
                    plan.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                    plan.accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                    'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <span className="text-xs text-slate-400 font-medium">Valid for {plan.duration}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 my-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">
                    one-time pass
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="h-px bg-slate-200/60 dark:bg-white/10 my-4" />

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${
                        plan.accent === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                        plan.accent === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                        'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || isSubscribed}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isSubscribed
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-white/5'
                    : isPop
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 shadow-md'
                }`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Processing...</span>
                  </>
                ) : isSubscribed ? (
                  <span>Currently Active</span>
                ) : (
                  <>
                    <span>Unlock {plan.name}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 🛡️ Trust Signals */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-500" />
          <span className="font-semibold">Stripe 256-bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-cyan-500" />
          <span className="font-semibold">Cards, UPI & Net Banking</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="font-semibold">Instant Access Guarantee</span>
        </div>
      </div>

    </div>
  );
}
