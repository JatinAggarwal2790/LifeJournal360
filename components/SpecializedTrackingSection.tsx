'use client';

import React, { useState } from 'react';
import type { JournalArchetype, SpecializedTrackingData } from '@/lib/types';
import {
  Utensils,
  Dumbbell,
  Baby,
  Compass,
  Smile,
  Plus,
  Trash2,
  Droplets,
  Zap,
  Trophy,
  Heart,
  Footprints,
  MapPin,
  Coffee,
  Sun,
  Moon,
  Sparkles,
  Mic,
  Calendar,
  CheckCircle2,
  Tag,
  Clock,
  Check,
  Award,
} from 'lucide-react';
import { VoiceDictationButton } from './VoiceDictationButton';

interface SpecializedTrackingSectionProps {
  archetype: JournalArchetype;
  specializedData: SpecializedTrackingData;
  onChangeSpecializedData: (data: SpecializedTrackingData) => void;
}

export function SpecializedTrackingSection({
  archetype,
  specializedData,
  onChangeSpecializedData,
}: SpecializedTrackingSectionProps) {
  // Food helpers
  const foodData = specializedData.food || {};
  const fitnessData = specializedData.fitness || {};
  const pregnancyData = specializedData.pregnancy || {};
  const travelData = specializedData.travel || {};
  const kidsData = specializedData.kids || {};

  // Custom milestone input states for pregnancy and kids
  const [newPregnancyMilestone, setNewPregnancyMilestone] = useState('');
  const [newPregnancyMilestoneWeek, setNewPregnancyMilestoneWeek] = useState<number | ''>('');
  const [newKidsMilestone, setNewKidsMilestone] = useState('');
  const [newKidsCategory, setNewKidsCategory] = useState('Firsts & Breakthroughs');

  // Food methods
  const handleAddMeal = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const currentMeals = foodData.meals || [];
    onChangeSpecializedData({
      ...specializedData,
      food: {
        ...foodData,
        meals: [...currentMeals, { type, items: '', calories: undefined }],
      },
    });
  };

  const handleUpdateMeal = (idx: number, field: string, val: any) => {
    const currentMeals = [...(foodData.meals || [])];
    if (currentMeals[idx]) {
      currentMeals[idx] = { ...currentMeals[idx], [field]: val };
      onChangeSpecializedData({
        ...specializedData,
        food: { ...foodData, meals: currentMeals },
      });
    }
  };

  const handleRemoveMeal = (idx: number) => {
    const currentMeals = (foodData.meals || []).filter((_, i) => i !== idx);
    onChangeSpecializedData({
      ...specializedData,
      food: { ...foodData, meals: currentMeals },
    });
  };

  // Fitness methods
  const handleAddExercise = () => {
    const currentEx = fitnessData.exercises || [];
    onChangeSpecializedData({
      ...specializedData,
      fitness: {
        ...fitnessData,
        exercises: [...currentEx, { name: '', sets: '3', repsOrWeight: '10 reps' }],
      },
    });
  };

  const handleUpdateExercise = (idx: number, field: string, val: any) => {
    const currentEx = [...(fitnessData.exercises || [])];
    if (currentEx[idx]) {
      currentEx[idx] = { ...currentEx[idx], [field]: val };
      onChangeSpecializedData({
        ...specializedData,
        fitness: { ...fitnessData, exercises: currentEx },
      });
    }
  };

  const handleRemoveExercise = (idx: number) => {
    const currentEx = (fitnessData.exercises || []).filter((_, i) => i !== idx);
    onChangeSpecializedData({
      ...specializedData,
      fitness: { ...fitnessData, exercises: currentEx },
    });
  };

  // Pregnancy helpers
  const PREGNANCY_SIZES: Record<number, string> = {
    4: 'Poppy seed 🌱',
    8: 'Raspberry 🍓',
    12: 'Lime 🍈',
    16: 'Avocado 🥑',
    20: 'Banana 🍌',
    24: 'Ear of corn 🌽',
    28: 'Eggplant 🍆',
    32: 'Pineapple 🍍',
    36: 'Papaya 🍈',
    40: 'Watermelon 🍉',
  };

  const getBabySizeForWeek = (week: number) => {
    const keys = Object.keys(PREGNANCY_SIZES)
      .map(Number)
      .sort((a, b) => a - b);
    let matched = 'Sweet Little Sprout 🌱';
    for (const k of keys) {
      if (week >= k) matched = PREGNANCY_SIZES[k];
    }
    return matched;
  };

  const PREGNANCY_SUGGESTED_MILESTONES = [
    'First Positive Test & Heartbeat Echo',
    '12-Week Ultrasound & Nuchal Scan',
    'Felt First Flutter & Kicks',
    '20-Week Anatomy Scan (Gender reveal)',
    'Glucose Screening Completed',
    'Nursery Setup & Crib Ready',
    'Baby Shower & Family Celebration',
    'Hospital Bag Packed & Ready',
  ];

  const handleAddPregnancyMilestoneItem = (titleToAdd: string, targetWeek?: number) => {
    if (!titleToAdd.trim()) return;
    const currentLogs = pregnancyData.milestoneLogs || [];
    const newLog = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: titleToAdd.trim(),
      week: targetWeek || pregnancyData.weekNumber || 20,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    };
    onChangeSpecializedData({
      ...specializedData,
      pregnancy: {
        ...pregnancyData,
        milestoneLogs: [...currentLogs, newLog],
      },
    });
    setNewPregnancyMilestone('');
    setNewPregnancyMilestoneWeek('');
  };

  const handleUpdatePregnancyMilestoneItem = (id: string, field: string, val: any) => {
    const currentLogs = (pregnancyData.milestoneLogs || []).map((log) =>
      log.id === id ? { ...log, [field]: val } : log
    );
    onChangeSpecializedData({
      ...specializedData,
      pregnancy: {
        ...pregnancyData,
        milestoneLogs: currentLogs,
      },
    });
  };

  const handleRemovePregnancyMilestoneItem = (id: string) => {
    const currentLogs = (pregnancyData.milestoneLogs || []).filter((log) => log.id !== id);
    onChangeSpecializedData({
      ...specializedData,
      pregnancy: {
        ...pregnancyData,
        milestoneLogs: currentLogs,
      },
    });
  };

  // Kids milestone helpers
  const KIDS_SUGGESTED_CATEGORIES = [
    'Speech & Words 🗣️',
    'Physical & Steps 🏃',
    'Social & Kindness 🤝',
    'Creative & Play 🎨',
    'Firsts & Breakthroughs ⭐',
    'Funny Quotes 😂',
  ];

  const handleAddKidsMilestoneItem = (titleToAdd: string, categoryToAdd: string) => {
    if (!titleToAdd.trim()) return;
    const currentLogs = kidsData.milestoneLogs || [];
    const newLog = {
      id: `kmilestone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: titleToAdd.trim(),
      category: categoryToAdd,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    };
    onChangeSpecializedData({
      ...specializedData,
      kids: {
        ...kidsData,
        milestoneLogs: [...currentLogs, newLog],
      },
    });
    setNewKidsMilestone('');
  };

  const handleUpdateKidsMilestoneItem = (id: string, field: string, val: any) => {
    const currentLogs = (kidsData.milestoneLogs || []).map((log) =>
      log.id === id ? { ...log, [field]: val } : log
    );
    onChangeSpecializedData({
      ...specializedData,
      kids: {
        ...kidsData,
        milestoneLogs: currentLogs,
      },
    });
  };

  const handleRemoveKidsMilestoneItem = (id: string) => {
    const currentLogs = (kidsData.milestoneLogs || []).filter((log) => log.id !== id);
    onChangeSpecializedData({
      ...specializedData,
      kids: {
        ...kidsData,
        milestoneLogs: currentLogs,
      },
    });
  };

  // =========================================================================
  // 1. FOOD & NUTRITION (ORGANIZED IN SPACIOUS ROWS)
  // =========================================================================
  if (archetype === 'food_diary') {
    const water = foodData.waterGlasses || 0;
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Food & Nutrition Log
                <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.2 text-[10px] font-bold text-amber-300">
                  Full Row Layout
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log meals, ingredients, caloric breakdown, hydration, and mindful digestive notes.
              </p>
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <Droplets className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-bold text-zinc-300">Water:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                <button
                  key={glass}
                  type="button"
                  onClick={() =>
                    onChangeSpecializedData({
                      ...specializedData,
                      food: { ...foodData, waterGlasses: glass === water ? glass - 1 : glass },
                    })
                  }
                  className={`h-5 w-4 rounded transition text-[9px] font-extrabold flex items-center justify-center ${
                    glass <= water
                      ? 'bg-sky-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  }`}
                  title={`${glass} glasses`}
                >
                  💧
                </button>
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">({water}/8)</span>
          </div>
        </div>

        {/* Meals List (Full-Width Spacious Rows) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Meals & Daily Nutrition Entries
            </label>
            <span className="text-[10px] text-zinc-500">
              Spacious rows with voice dictation & calorie counter
            </span>
          </div>

          {foodData.meals && foodData.meals.length > 0 ? (
            foodData.meals.map((meal, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 shadow-sm"
              >
                <select
                  value={meal.type}
                  onChange={(e) => handleUpdateMeal(idx, 'type', e.target.value)}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-amber-300 outline-none shrink-0"
                >
                  <option value="breakfast">🍳 Breakfast</option>
                  <option value="lunch">🥗 Lunch</option>
                  <option value="dinner">🍲 Dinner</option>
                  <option value="snack">🍎 Snack</option>
                </select>

                {/* Wide Expansive Food Item Input */}
                <div className="relative flex-1 flex items-center min-w-0">
                  <input
                    type="text"
                    value={meal.items}
                    onChange={(e) => handleUpdateMeal(idx, 'items', e.target.value)}
                    placeholder="Enter meal items, ingredients & recipe details (type or click mic)..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3.5 pr-9 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none transition shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(txt) =>
                        handleUpdateMeal(
                          idx,
                          'items',
                          meal.items ? `${meal.items} ${txt}` : txt
                        )
                      }
                      size="icon"
                      variant="subtle"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Cal:</span>
                    <input
                      type="number"
                      min={0}
                      value={meal.calories || ''}
                      onChange={(e) =>
                        handleUpdateMeal(
                          idx,
                          'calories',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      placeholder="kcal"
                      className="w-16 bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(idx)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition rounded-lg hover:bg-zinc-800"
                    title="Remove meal entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No meals logged today yet. Click a button below to add Breakfast, Lunch, Dinner, or Snacks in full-width rows.
            </div>
          )}

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddMeal('breakfast')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Breakfast</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('lunch')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Lunch</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('dinner')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Dinner</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('snack')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Snack</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. FITNESS PROGRESS & PR TRACKER (ORGANIZED IN SPACIOUS ROWS)
  // =========================================================================
  if (archetype === 'fitness_tracker') {
    return (
      <div className="rounded-2xl border border-lime-500/30 bg-zinc-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/15 border border-lime-400/30 text-lime-400">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Fitness Progress &amp; Workout Log
                <span className="rounded-full bg-lime-400/20 border border-lime-400/30 px-2 py-0.2 text-[10px] font-bold text-lime-300">
                  Strength &amp; Stamina
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log exercises in clear full-width rows with sets, weights, PR breakthroughs, and recovery readiness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddExercise}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 py-1.5 text-xs font-black text-zinc-950 hover:bg-lime-300 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Add Exercise Row</span>
            </button>
          </div>
        </div>

        {/* Exercises Table (Full-Width Rows) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-lime-400">
              Workout Exercises &amp; Sets
            </label>
            <span className="text-[10px] text-zinc-500">
              Spacious rows with wide exercise names &amp; sets
            </span>
          </div>

          {fitnessData.exercises && fitnessData.exercises.length > 0 ? (
            fitnessData.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 shadow-sm"
              >
                {/* Wide Exercise Name */}
                <div className="relative flex-1 flex items-center min-w-0">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                    placeholder="Exercise name (e.g. Barbell Incline Bench Press, Deadlift, 5km Tempo Run)..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3.5 pr-9 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-lime-500 focus:outline-none transition shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(txt) =>
                        handleUpdateExercise(
                          idx,
                          'name',
                          ex.name ? `${ex.name} ${txt}` : txt
                        )
                      }
                      size="icon"
                      variant="subtle"
                    />
                  </div>
                </div>

                {/* Sets */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={ex.sets || ''}
                    onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                    placeholder="Sets (e.g. 4 sets)"
                    className="w-28 sm:w-32 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                  />
                  {/* Reps / Weight */}
                  <input
                    type="text"
                    value={ex.repsOrWeight || ''}
                    onChange={(e) => handleUpdateExercise(idx, 'repsOrWeight', e.target.value)}
                    placeholder="Reps / Weight (e.g. 10 reps @ 185 lbs)"
                    className="w-36 sm:w-48 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(idx)}
                    className="p-2 text-zinc-500 hover:text-rose-400 transition rounded-lg hover:bg-zinc-800"
                    title="Remove exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No exercises logged yet. Click &apos;Add Exercise Row&apos; to log your workout sets.
            </div>
          )}
        </div>

        {/* PR Breakthrough Row (Full Width) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              Personal Records (PRs) &amp; Breakthroughs
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  fitness: {
                    ...fitnessData,
                    prNotes: fitnessData.prNotes ? `${fitnessData.prNotes} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak PR"
            />
          </div>
          <input
            type="text"
            value={fitnessData.prNotes || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                fitness: { ...fitnessData, prNotes: e.target.value },
              })
            }
            placeholder="e.g. Hit new Deadlift PR of 315 lbs! Clean form, zero lower back strain."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400"
          />
        </div>

        {/* Recovery & Energy Readiness Row (Full Width) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-lime-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Recovery &amp; Energy Readiness ({fitnessData.recoveryScore || 85}%)
            </label>
            <span className="text-[11px] font-bold text-zinc-400">
              {(fitnessData.recoveryScore || 85) >= 80
                ? '🔥 High Readiness & Fresh'
                : (fitnessData.recoveryScore || 85) >= 50
                ? '⚡ Moderate Energy'
                : '🛌 Rest & Recovery Recommended'}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={fitnessData.recoveryScore || 85}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                fitness: { ...fitnessData, recoveryScore: Number(e.target.value) },
              })
            }
            className="w-full accent-lime-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PREGNANCY JOURNEY & MILESTONE LOGS (ORGANIZED IN SPACIOUS ROWS)
  // =========================================================================
  if (archetype === 'pregnancy_milestones') {
    const week = pregnancyData.weekNumber || 20;
    const babySize = pregnancyData.babySize || getBabySizeForWeek(week);
    const kicks = pregnancyData.kicksCount || 0;
    const milestoneLogs = pregnancyData.milestoneLogs || [];

    return (
      <div className="rounded-2xl border border-rose-500/30 bg-zinc-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/15 border border-rose-400/30 text-rose-400">
              <Baby className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Pregnancy Journey &amp; Milestones Log
                <span className="rounded-full bg-rose-400/20 border border-rose-400/30 px-2 py-0.2 text-[10px] font-bold text-rose-300">
                  Week {week} ({babySize})
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Track gestational progress, baby size comparisons, kicks, symptoms, and medical milestones in full-width rows.
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Gestational Week & Kicks Status (Full-Width Flex Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Week Selector & Baby Size Badge */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase text-rose-300">
                Gestational Week (1 - 42)
              </label>
              <span className="text-[11px] text-zinc-400 font-bold">
                {week <= 13 ? 'Trimester 1' : week <= 26 ? 'Trimester 2' : 'Trimester 3'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={42}
                value={week}
                onChange={(e) => {
                  const newWeek = Number(e.target.value);
                  onChangeSpecializedData({
                    ...specializedData,
                    pregnancy: {
                      ...pregnancyData,
                      weekNumber: newWeek,
                      babySize: getBabySizeForWeek(newWeek),
                    },
                  });
                }}
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-base font-black text-rose-300 outline-none"
              />
              <div className="flex-1 bg-zinc-900 border border-zinc-800/80 px-3 py-1.5 rounded-lg text-xs text-zinc-200 font-bold flex items-center gap-1.5">
                <span>Baby Size:</span>
                <span className="text-rose-300 font-black">{babySize}</span>
              </div>
            </div>
          </div>

          {/* Fetal Kicks Counter */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase text-rose-300">
                Fetal Kicks &amp; Movements
              </label>
              <span className="text-[10px] text-zinc-500">Tap + to log kicks</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() =>
                  onChangeSpecializedData({
                    ...specializedData,
                    pregnancy: { ...pregnancyData, kicksCount: Math.max(0, kicks - 1) },
                  })
                }
                className="h-8 w-12 rounded-lg bg-zinc-800 text-zinc-200 font-extrabold hover:bg-zinc-700 active:scale-95 transition"
              >
                -
              </button>
              <span className="text-base font-black text-rose-300 min-w-20 text-center">
                {kicks} kicks
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeSpecializedData({
                    ...specializedData,
                    pregnancy: { ...pregnancyData, kicksCount: kicks + 1 },
                  })
                }
                className="h-8 w-12 rounded-lg bg-rose-500 text-zinc-950 font-black hover:bg-rose-400 active:scale-95 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Symptoms, Cravings & Doctor Visit Notes (Full-Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-rose-300 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              Cravings, Symptoms &amp; Doctor Visit Notes
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  pregnancy: {
                    ...pregnancyData,
                    notes: pregnancyData.notes ? `${pregnancyData.notes} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Notes"
            />
          </div>
          <input
            type="text"
            value={pregnancyData.notes || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                pregnancy: { ...pregnancyData, notes: e.target.value },
              })
            }
            placeholder="e.g. Craving fresh watermelon, felt baby hiccup, anatomy ultrasound went wonderful!"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-400"
          />
        </div>

        {/* Row 3: Dedicated Milestone Logs & Scans Tracker (Full-Width Rows) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-rose-400" />
              Milestones &amp; Scans Log Entries
            </label>
            <span className="text-[10px] text-zinc-500">
              Log key appointments, ultrasounds &amp; baby moments
            </span>
          </div>

          {/* Existing Milestone Logs List in Full-Width Rows */}
          {milestoneLogs.length > 0 && (
            <div className="space-y-2">
              {milestoneLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 shadow-sm"
                >
                  <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-1 rounded-lg text-xs font-black shrink-0">
                    Week {log.week || week}
                  </span>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={log.title}
                      onChange={(e) =>
                        handleUpdatePregnancyMilestoneItem(log.id, 'title', e.target.value)
                      }
                      placeholder="Milestone title..."
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-100 outline-none focus:border-b focus:border-rose-400"
                    />
                    <input
                      type="text"
                      value={log.notes || ''}
                      onChange={(e) =>
                        handleUpdatePregnancyMilestoneItem(log.id, 'notes', e.target.value)
                      }
                      placeholder="Add notes, ultrasound findings, or emotions..."
                      className="w-full bg-transparent text-[11px] text-zinc-400 placeholder-zinc-600 outline-none mt-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-[10px] text-zinc-500">{log.date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePregnancyMilestoneItem(log.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition rounded-lg hover:bg-zinc-800"
                      title="Remove milestone"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Milestone Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-dashed border-zinc-800">
            <input
              type="number"
              min={1}
              max={42}
              value={newPregnancyMilestoneWeek}
              onChange={(e) =>
                setNewPregnancyMilestoneWeek(e.target.value ? Number(e.target.value) : '')
              }
              placeholder={`Wk ${week}`}
              className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-bold text-rose-300 outline-none"
            />
            <input
              type="text"
              value={newPregnancyMilestone}
              onChange={(e) => setNewPregnancyMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPregnancyMilestoneItem(
                    newPregnancyMilestone,
                    newPregnancyMilestoneWeek ? Number(newPregnancyMilestoneWeek) : undefined
                  );
                }
              }}
              placeholder="Add custom milestone (e.g. 20-week anatomy scan, nursery crib assembled)..."
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            />
            <button
              type="button"
              onClick={() =>
                handleAddPregnancyMilestoneItem(
                  newPregnancyMilestone,
                  newPregnancyMilestoneWeek ? Number(newPregnancyMilestoneWeek) : undefined
                )
              }
              disabled={!newPregnancyMilestone.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-rose-400 disabled:opacity-50 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          {/* Quick Add Preset Milestones Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Quick Add:</span>
            {PREGNANCY_SUGGESTED_MILESTONES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddPregnancyMilestoneItem(preset)}
                className="rounded-lg bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white transition border border-zinc-700/50"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. KIDS JOURNEY & MEMORIES LOG (ORGANIZED IN SPACIOUS ROWS)
  // =========================================================================
  if (archetype === 'kids_journey') {
    const milestoneLogs = kidsData.milestoneLogs || [];

    return (
      <div className="rounded-2xl border border-violet-500/30 bg-zinc-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-400/15 border border-violet-400/30 text-violet-400">
              <Smile className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Kids Journey &amp; Milestones Log
                <span className="rounded-full bg-violet-400/20 border border-violet-400/30 px-2 py-0.2 text-[10px] font-bold text-violet-300">
                  Cherished Memories
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Preserve developmental breakthroughs, funny quotes, and daily smiles in full-width rows.
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Child Name & Stage (Full Width) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <label className="text-[11px] font-extrabold uppercase text-violet-300">
            Child Name &amp; Age / Stage
          </label>
          <input
            type="text"
            value={kidsData.childName || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                kids: { ...kidsData, childName: e.target.value },
              })
            }
            placeholder="e.g. Maya (3 years, 4 months) — Preschool Explorer"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400"
          />
        </div>

        {/* Row 2: Milestone Reached Today (Full Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-lime-400 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-lime-400" />
              Key Milestone Reached Today
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  kids: {
                    ...kidsData,
                    milestone: kidsData.milestone ? `${kidsData.milestone} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Milestone"
            />
          </div>
          <input
            type="text"
            value={kidsData.milestone || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                kids: { ...kidsData, milestone: e.target.value },
              })
            }
            placeholder="e.g. Tied shoes independently for the first time without help!"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-lime-400"
          />
        </div>

        {/* Row 3: Funny Quote / Sayings (Full Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Funny Quotes &amp; Memorable Sayings
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  kids: {
                    ...kidsData,
                    funnyQuote: kidsData.funnyQuote ? `${kidsData.funnyQuote} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Quote"
            />
          </div>
          <input
            type="text"
            value={kidsData.funnyQuote || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                kids: { ...kidsData, funnyQuote: e.target.value },
              })
            }
            placeholder="e.g. 'Look Daddy, the clouds are wearing fluffy pajamas today!'"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400"
          />
        </div>

        {/* Row 4: Heartwarming Memory & Daily Story (Full Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-violet-300 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-violet-400" />
              Heartwarming Memory &amp; Daily Routine Story
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  kids: {
                    ...kidsData,
                    notes: kidsData.notes ? `${kidsData.notes} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Story"
            />
          </div>
          <input
            type="text"
            value={kidsData.notes || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                kids: { ...kidsData, notes: e.target.value },
              })
            }
            placeholder="e.g. Read 3 bedtime books together, gave the biggest hug, and fell fast asleep."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-400"
          />
        </div>

        {/* Row 5: Detailed Kids Milestone Log History (Full-Width Rows) */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-violet-400" />
              Milestones &amp; Breakthroughs History
            </label>
            <span className="text-[10px] text-zinc-500">
              Categorized milestones &amp; growth events
            </span>
          </div>

          {milestoneLogs.length > 0 && (
            <div className="space-y-2">
              {milestoneLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 shadow-sm"
                >
                  <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                    {log.category || 'Breakthrough'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={log.title}
                      onChange={(e) =>
                        handleUpdateKidsMilestoneItem(log.id, 'title', e.target.value)
                      }
                      placeholder="Milestone description..."
                      className="w-full bg-transparent text-xs sm:text-sm font-bold text-zinc-100 outline-none focus:border-b focus:border-violet-400"
                    />
                    <input
                      type="text"
                      value={log.notes || ''}
                      onChange={(e) =>
                        handleUpdateKidsMilestoneItem(log.id, 'notes', e.target.value)
                      }
                      placeholder="Add reflections, location, or reactions..."
                      className="w-full bg-transparent text-[11px] text-zinc-400 placeholder-zinc-600 outline-none mt-0.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className="text-[10px] text-zinc-500">{log.date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKidsMilestoneItem(log.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition rounded-lg hover:bg-zinc-800"
                      title="Remove milestone entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Milestone Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-dashed border-zinc-800">
            <select
              value={newKidsCategory}
              onChange={(e) => setNewKidsCategory(e.target.value)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-bold text-violet-300 outline-none shrink-0"
            >
              {KIDS_SUGGESTED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newKidsMilestone}
              onChange={(e) => setNewKidsMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKidsMilestoneItem(newKidsMilestone, newKidsCategory);
                }
              }}
              placeholder="Add breakthrough (e.g. Swam across the pool without floaties, counted to 50)..."
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            />
            <button
              type="button"
              onClick={() => handleAddKidsMilestoneItem(newKidsMilestone, newKidsCategory)}
              disabled={!newKidsMilestone.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-violet-400 disabled:opacity-50 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. TRAVEL LOG & EXPLORER JOURNEY (ORGANIZED IN SPACIOUS ROWS)
  // =========================================================================
  if (archetype === 'travel_log') {
    return (
      <div className="rounded-2xl border border-sky-500/30 bg-zinc-900/80 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400/15 border border-sky-400/30 text-sky-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Travel Log &amp; Explorer Journey
                <span className="rounded-full bg-sky-400/20 border border-sky-400/30 px-2 py-0.2 text-[10px] font-bold text-sky-300">
                  Wanderlust
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log destinations, transit routes, culinary highlights, sights visited, and travel expenses in full-width rows.
              </p>
            </div>
          </div>
        </div>

        {/* Row 1: Destination / Region & Transit Route (Full Width) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase text-sky-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                Destination / Region
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    travel: {
                      ...travelData,
                      destination: travelData.destination
                        ? `${travelData.destination} ${txt}`
                        : txt,
                    },
                  })
                }
                size="icon"
                variant="subtle"
              />
            </div>
            <input
              type="text"
              value={travelData.destination || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: { ...travelData, destination: e.target.value },
                })
              }
              placeholder="e.g. Kyoto & Arashiyama Bamboo Grove, Japan"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-400"
            />
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase text-sky-300 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                Transportation &amp; Transit Routes
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    travel: {
                      ...travelData,
                      transportation: travelData.transportation
                        ? `${travelData.transportation} ${txt}`
                        : txt,
                    },
                  })
                }
                size="icon"
                variant="subtle"
              />
            </div>
            <input
              type="text"
              value={travelData.transportation || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: { ...travelData, transportation: e.target.value },
                })
              }
              placeholder="e.g. Shinkansen Bullet Train + Rental Bicycle through old town"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Row 2: Local Culinary Highlights (Full Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-amber-400" />
              Local Culinary Highlights &amp; Discoveries
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: {
                    ...travelData,
                    localEats: travelData.localEats ? `${travelData.localEats} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Food"
            />
          </div>
          <input
            type="text"
            value={travelData.localEats || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                travel: { ...travelData, localEats: e.target.value },
              })
            }
            placeholder="e.g. Freshly pulled matcha soba noodles, grilled wagyu skewers, and yuzu sorbet"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-400"
          />
        </div>

        {/* Row 3: Expenses, Budget & Travel Tips (Full Width Row) */}
        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase text-sky-300 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-sky-400" />
              Expenses, Budget &amp; Practical Travel Notes
            </label>
            <VoiceDictationButton
              onTranscript={(txt) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: {
                    ...travelData,
                    costNotes: travelData.costNotes ? `${travelData.costNotes} ${txt}` : txt,
                  },
                })
              }
              size="sm"
              variant="subtle"
              label="Speak Budget"
            />
          </div>
          <input
            type="text"
            value={travelData.costNotes || ''}
            onChange={(e) =>
              onChangeSpecializedData({
                ...specializedData,
                travel: { ...travelData, costNotes: e.target.value },
              })
            }
            placeholder="e.g. ¥6,500 temple tickets + dinner; buy ICOCA card at station for easy subway taps"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-400"
          />
        </div>
      </div>
    );
  }

  return null;
}
