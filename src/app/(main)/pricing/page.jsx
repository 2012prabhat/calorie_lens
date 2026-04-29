'use client'

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Check, Sparkles, Zap, Star, Shield, ArrowRight, Loader2, Calendar, Clock, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserContext } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'plan_7days',
    name: 'Quick Kickstart',
    duration: '7 Days',
    price: '₹50',
    description: 'Perfect for a week of focused tracking.',
    features: [
      'Smart Photo Analysis',
      'Macro Breakdown',
      'Daily Log History',
      'Meal Presets'
    ],
    color: 'emerald',
    icon: <Clock className="text-emerald-500" size={24} />
  },
  {
    id: 'plan_1month',
    name: 'Monthly Goal-Getter',
    duration: '1 Month',
    price: '₹100',
    description: 'Our most popular choice for consistent progress.',
    features: [
      'Everything in Quick Kickstart',
      'Weight Trend Analytics',
      'Priority AI Analysis',
      'Early Access to Features'
    ],
    popular: true,
    color: 'cyan',
    icon: <Zap className="text-cyan-500" size={24} />
  },
  {
    id: 'plan_1year',
    name: 'Annual Legend',
    duration: '1 Year',
    price: '₹1000',
    description: 'Best value for long-term health transformation.',
    features: [
      'Everything in Monthly',
      'Best Price (Save ₹200)',
      'Lifetime Log Access',
      'Premium Support'
    ],
    color: 'indigo',
    icon: <Star className="text-indigo-500" size={24} />
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
      const res = await axios.post('/api/subscription/trial');
      toast.success("7-Day Free Trial activated!");
      // Update local user state
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
  const isSubscribed = user && (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing');

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500 mb-4 leading-tight">
          Fuel Your Journey with Premium
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your goals. Unlock smart photo analysis, detailed macro tracking, and more.
        </p>
      </div>

      {/* Trial Section */}
      {isTrialAvailable && (
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative group overflow-hidden bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center backdrop-blur-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <Sparkles className="text-emerald-500" size={24} />
              New here? Start with a Free Trial
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
              Get full access to all features for 7 days. No credit card required.
            </p>
            <button
              onClick={handleStartTrial}
              disabled={activatingTrial}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {activatingTrial ? <Loader2 className="animate-spin" size={20} /> : <Calendar size={20} />}
              Activate 7-Day Free Trial
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
              plan.popular 
                ? 'bg-white dark:bg-gray-900 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 scale-105 z-10' 
                : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full text-xs font-black uppercase tracking-widest text-white dark:text-black">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-${plan.color}-500/10 text-${plan.color}-500`}>
                  {React.cloneElement(plan.icon, { size: 24, className: "" })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-500 text-sm font-medium">/ {plan.duration}</span>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium">
                {plan.description}
              </p>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  <div className={`p-1 rounded-full bg-${plan.color}-500/10 text-${plan.color}-500`}>
                    <Check size={14} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id || isSubscribed}
              className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                  : plan.popular
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-white dark:text-black shadow-lg shadow-cyan-500/20'
                    : `bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black`
              }`}
            >
              {loading === plan.id ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isSubscribed ? (
                'Current Plan'
              ) : (
                <>
                  Get Started <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 flex flex-wrap items-center justify-center gap-8 opacity-60 dark:opacity-40">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Shield size={20} className="text-emerald-500" />
          <span className="font-bold">Secure Stripe Payments</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <CreditCard size={20} className="text-cyan-500" />
          <span className="font-bold">No Hidden Fees</span>
        </div>
      </div>
    </div>
  );
}
