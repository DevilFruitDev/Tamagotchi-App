import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TamagotchiState, TamagotchiActions, PetMood, ActivityLog, PetStats } from '../types/tamagotchi';

const DECAY_RATE = {
  hunger: 0.05,    // increases 0.05 per second
  happiness: 0.03, // decreases 0.03 per second
  energy: 0.02,    // decreases 0.02 per second
  health: 0,       // only decreases when other stats are low
  cleanliness: 0.04, // decreases 0.04 per second
};

const createActivityLog = (
  action: ActivityLog['action'],
  statsBefore: PetStats,
  statsAfter: PetStats
): ActivityLog => ({
  id: crypto.randomUUID(),
  action,
  timestamp: new Date(),
  statsBefore: { ...statsBefore },
  statsAfter: { ...statsAfter },
});

const getMood = (stats: PetStats): PetMood => {
  if (stats.energy < 20) return 'tired';
  if (stats.health < 30) return 'sick';
  if (stats.hunger > 80) return 'hungry';
  if (stats.cleanliness < 30) return 'dirty';
  if (stats.happiness < 30) return 'sad';
  return 'happy';
};

const clamp = (value: number, min: number, max: number) => 
  Math.min(Math.max(value, min), max);

export const useTamagotchiStore = create<TamagotchiState & TamagotchiActions>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      birthDate: new Date(),
      currentMood: 'happy',
      stats: {
        hunger: 50,
        happiness: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      },
      activityLogs: [],
      isAlive: true,
      lastUpdated: new Date(),

      // Actions
      feedPet: () => {
        const state = get();
        if (!state.isAlive) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          hunger: clamp(state.stats.hunger - 30, 0, 100),
          happiness: clamp(state.stats.happiness + 10, 0, 100),
        };

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          activityLogs: [
            createActivityLog('feed', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
      },

      playWithPet: () => {
        const state = get();
        if (!state.isAlive || state.stats.energy < 20) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          happiness: clamp(state.stats.happiness + 20, 0, 100),
          energy: clamp(state.stats.energy - 15, 0, 100),
          hunger: clamp(state.stats.hunger + 10, 0, 100),
        };

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          activityLogs: [
            createActivityLog('play', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
      },

      cleanPet: () => {
        const state = get();
        if (!state.isAlive) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          cleanliness: clamp(state.stats.cleanliness + 50, 0, 100),
          happiness: clamp(state.stats.happiness + 5, 0, 100),
        };

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          activityLogs: [
            createActivityLog('clean', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
      },

      putPetToSleep: () => {
        const state = get();
        if (!state.isAlive || state.currentMood === 'sleeping') return;

        const statsBefore = { ...state.stats };
        set({
          currentMood: 'sleeping',
          activityLogs: [
            createActivityLog('sleep', statsBefore, statsBefore),
            ...state.activityLogs,
          ],
        });

        // Wake up after 8 seconds (represent 8 hours)
        setTimeout(() => {
          const currentState = get();
          if (currentState.currentMood === 'sleeping') {
            const statsAfter = {
              ...currentState.stats,
              energy: 100,
              happiness: clamp(currentState.stats.happiness + 10, 0, 100),
            };
            set({
              stats: statsAfter,
              currentMood: getMood(statsAfter),
            });
          }
        }, 8000);
      },

      giveMedicine: () => {
        const state = get();
        if (!state.isAlive || state.stats.health > 80) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          health: clamp(state.stats.health + 40, 0, 100),
          happiness: clamp(state.stats.happiness - 10, 0, 100),
        };

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          activityLogs: [
            createActivityLog('medicine', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
      },

      updateStats: (elapsed: number) => {
        const state = get();
        if (!state.isAlive || state.currentMood === 'sleeping') return;

        const secondsElapsed = elapsed / 1000;
        
        let newStats = {
          hunger: clamp(state.stats.hunger + DECAY_RATE.hunger * secondsElapsed, 0, 100),
          happiness: clamp(state.stats.happiness - DECAY_RATE.happiness * secondsElapsed, 0, 100),
          energy: clamp(state.stats.energy - DECAY_RATE.energy * secondsElapsed, 0, 100),
          health: state.stats.health,
          cleanliness: clamp(state.stats.cleanliness - DECAY_RATE.cleanliness * secondsElapsed, 0, 100),
        };

        // Health decay when other stats are low
        if (newStats.hunger > 90 || newStats.cleanliness < 20 || newStats.happiness < 20) {
          newStats.health = clamp(newStats.health - 0.01 * secondsElapsed, 0, 100);
        }

        // Check if pet dies
        const isAlive = newStats.health > 0;

        set({
          stats: newStats,
          currentMood: isAlive ? getMood(newStats) : 'sad',
          isAlive,
          lastUpdated: new Date(),
        });
      },

      namePet: (name: string) => {
        set({ name });
      },
    }),
    {
      name: 'tamagotchi-storage',
    }
  )
);
