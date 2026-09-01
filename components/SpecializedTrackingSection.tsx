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
    const keys = Object.keys(PREGNANCY_SIZES).map(Number).sort((a, b) => a - b);
    let matched = 'Sweet Little Sprout 🌱';
    for (const k of keys) {
      if (week >= k) matched = PREGNANCY_SIZES[k];
    }
    return matched;
  };

  if (archetype === 'food_diary') {
    const water = foodData.waterGlasses || 0;
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Food & Nutrition Log
                <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.2 text-[10px] font-bold text-amber-300">
                  Daily Intake
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log meals, estimate calories, monitor hydration and mindful eating.
              </p>
            </div>
          </div>

          {/* Hydration Tracker */}
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
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

        {/* Meals List */}
        <div className="space-y-2.5">
          {foodData.meals && foodData.meals.length > 0 ? (
            foodData.meals.map((meal, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <select
                  value={meal.type}
                  onChange={(e) => handleUpdateMeal(idx, 'type', e.target.value)}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs font-bold text-amber-300 outline-none"
                >
                  <option value="breakfast">🍳 Breakfast</option>
                  <option value="lunch">🥗 Lunch</option>
                  <option value="dinner">🍲 Dinner</option>
                  <option value="snack">🍎 Snack</option>
                </select>

                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={meal.items}
                    onChange={(e) => handleUpdateMeal(idx, 'items', e.target.value)}
                    placeholder="Items & ingredients (type or speak via mic)..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
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

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={meal.calories || ''}
                    onChange={(e) => handleUpdateMeal(idx, 'calories', Number(e.target.value))}
                    placeholder="kcal (e.g. 450)"
                    className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(idx)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center text-xs text-zinc-500">
              No meals logged today yet. Click a button below to log breakfast, lunch, dinner, or snacks.
            </div>
          )}

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddMeal('breakfast')}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Breakfast</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('lunch')}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Lunch</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('dinner')}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Dinner</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMeal('snack')}
              className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>+ Snack</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'fitness_tracker') {
    return (
      <div className="rounded-2xl border border-lime-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/15 border border-lime-400/30 text-lime-400">
              <Dumbbell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Fitness Progress & PR Tracker
                <span className="rounded-full bg-lime-400/20 border border-lime-400/30 px-2 py-0.2 text-[10px] font-bold text-lime-300">
                  Strength & Stamina
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log exercises, track personal records (PRs), and score recovery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddExercise}
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-lime-400 transition shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Exercise</span>
            </button>
          </div>
        </div>

        {/* Exercises Table */}
        <div className="space-y-2">
          {fitnessData.exercises && fitnessData.exercises.length > 0 ? (
            fitnessData.exercises.map((ex, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                    placeholder="Exercise (e.g. Barbell Squat, Pull-Ups, 5k Pace)"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-8 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-lime-500 focus:outline-none"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
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

                <input
                  type="text"
                  value={ex.sets || ''}
                  onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                  placeholder="Sets (e.g. 4 sets)"
                  className="sm:w-28 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                />
                <input
                  type="text"
                  value={ex.repsOrWeight || ''}
                  onChange={(e) => handleUpdateExercise(idx, 'repsOrWeight', e.target.value)}
                  placeholder="Reps / Weight (e.g. 8 reps @ 185 lbs)"
                  className="sm:w-44 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(idx)}
                  className="p-1 text-zinc-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center text-xs text-zinc-500">
              No exercises logged yet. Click &apos;Add Exercise&apos; to log your workout sets.
            </div>
          )}
        </div>

        {/* PR & Recovery row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                Personal Records (PRs) & Breakthroughs
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-bold uppercase text-lime-400 flex items-center gap-1.5 mb-1.5">
              <Zap className="h-3.5 w-3.5" />
              Recovery & Energy Readiness ({fitnessData.recoveryScore || 85}%)
            </label>
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
              className="w-full accent-lime-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'pregnancy_milestones') {
    const week = pregnancyData.weekNumber || 20;
    const babySize = pregnancyData.babySize || getBabySizeForWeek(week);
    const kicks = pregnancyData.kicksCount || 0;

    return (
      <div className="rounded-2xl border border-rose-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/15 border border-rose-400/30 text-rose-400">
              <Baby className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Pregnancy Milestones & Baby Tracker
                <span className="rounded-full bg-rose-400/20 border border-rose-400/30 px-2 py-0.2 text-[10px] font-bold text-rose-300">
                  Week {week}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Track gestational weeks, baby size comparisons, kicks, symptoms & doctor visits.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Week Selector */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
              Gestational Week (1 - 40)
            </label>
            <div className="flex items-center gap-2">
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
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-extrabold text-rose-300 outline-none"
              />
              <span className="text-xs text-zinc-300 font-bold">Size: {babySize}</span>
            </div>
          </div>

          {/* Kicks Counter */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
              Fetal Kicks & Movements
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onChangeSpecializedData({
                    ...specializedData,
                    pregnancy: { ...pregnancyData, kicksCount: Math.max(0, kicks - 1) },
                  })
                }
                className="h-8 w-8 rounded-lg bg-zinc-800 text-zinc-200 font-extrabold hover:bg-zinc-700"
              >
                -
              </button>
              <span className="text-base font-black text-zinc-100 min-w-12 text-center">
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
                className="h-8 w-8 rounded-lg bg-rose-500 text-zinc-950 font-extrabold hover:bg-rose-400"
              >
                +
              </button>
            </div>
          </div>

          {/* Symptoms/Craving Memo */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Cravings, Symptoms & Doctor Notes
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
                label="Dictate"
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
              placeholder="e.g. Craving fresh watermelon, anatomy scan went great!"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'travel_log') {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Travel Log & Explorer Journey
                <span className="rounded-full bg-cyan-400/20 border border-cyan-400/30 px-2 py-0.2 text-[10px] font-bold text-cyan-300">
                  Wanderlust
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Log destinations, attractions visited, transport routes & food discoveries.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
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
              placeholder="e.g. Amalfi Coast, Italy"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Transportation / Transit
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
              placeholder="e.g. High-speed rail / Vespa rental"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Local Culinary Highlights
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    travel: {
                      ...travelData,
                      localEats: travelData.localEats
                        ? `${travelData.localEats} ${txt}`
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
              value={travelData.localEats || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: { ...travelData, localEats: e.target.value },
                })
              }
              placeholder="e.g. Handmade gnocchi with lemon cream"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Expenses & Budget Notes
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    travel: {
                      ...travelData,
                      costNotes: travelData.costNotes
                        ? `${travelData.costNotes} ${txt}`
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
              value={travelData.costNotes || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  travel: { ...travelData, costNotes: e.target.value },
                })
              }
              placeholder="e.g. €85 dinner + museum passes"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  if (archetype === 'kids_journey') {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-400/15 border border-violet-400/30 text-violet-400">
              <Smile className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                Kids Journey & Milestones Log
                <span className="rounded-full bg-violet-400/20 border border-violet-400/30 px-2 py-0.2 text-[10px] font-bold text-violet-300">
                  Cherished Memories
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Preserve developmental breakthroughs, funny quotes, and daily smiles.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
              Child Name & Age / Stage
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
              placeholder="e.g. Maya (3 years, 4 months)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-amber-400">
                Funny Quote / Phrase
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    kids: {
                      ...kidsData,
                      funnyQuote: kidsData.funnyQuote
                        ? `${kidsData.funnyQuote} ${txt}`
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
              value={kidsData.funnyQuote || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  kids: { ...kidsData, funnyQuote: e.target.value },
                })
              }
              placeholder="e.g. 'Look Mommy, the clouds are wearing fluffy pajamas!'"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-lime-400">
                Milestone Reached
              </label>
              <VoiceDictationButton
                onTranscript={(txt) =>
                  onChangeSpecializedData({
                    ...specializedData,
                    kids: {
                      ...kidsData,
                      milestone: kidsData.milestone
                        ? `${kidsData.milestone} ${txt}`
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
              value={kidsData.milestone || ''}
              onChange={(e) =>
                onChangeSpecializedData({
                  ...specializedData,
                  kids: { ...kidsData, milestone: e.target.value },
                })
              }
              placeholder="e.g. Tied shoes independently for the first time!"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">
                Heartwarming Memory Note
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
                size="icon"
                variant="subtle"
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
              placeholder="e.g. Read 3 bedtime stories together and fell asleep hugging teddy."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 outline-none"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
