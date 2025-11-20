import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TamagotchiState, TamagotchiActions, PetMood, ActivityLog, PetStats, EvolutionStage, PersonalityTraits, CareQuality } from '../types/tamagotchi';

const DECAY_RATE = {
  hunger: 0.05,    // increases 0.05 per second
  happiness: 0.03, // decreases 0.03 per second
  energy: 0.02,    // decreases 0.02 per second
  health: 0,       // only decreases when other stats are low
  cleanliness: 0.04, // decreases 0.04 per second
};

// Evolution thresholds (in days)
const EVOLUTION_THRESHOLDS = {
  baby: 0,    // 0-2 days
  child: 2,   // 2-5 days
  teen: 5,    // 5-10 days
  adult: 10,  // 10+ days
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

const getEvolutionStage = (birthDate: Date, careQuality: CareQuality): EvolutionStage => {
  const now = new Date();
  const ageInDays = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate average care quality (0-100)
  const avgCare = (careQuality.feedingScore + careQuality.happinessScore + careQuality.healthScore) / 3;

  // Poor care can delay evolution
  const careFactor = avgCare > 50 ? 1 : 0.7;
  const adjustedAge = ageInDays * careFactor;

  if (adjustedAge >= EVOLUTION_THRESHOLDS.adult) return 'adult';
  if (adjustedAge >= EVOLUTION_THRESHOLDS.teen) return 'teen';
  if (adjustedAge >= EVOLUTION_THRESHOLDS.child) return 'child';
  return 'baby';
};

const updateCareQuality = (stats: PetStats, careQuality: CareQuality): CareQuality => {
  // Use exponential moving average to track care quality
  const alpha = 0.1; // smoothing factor

  return {
    feedingScore: careQuality.feedingScore * (1 - alpha) + (100 - stats.hunger) * alpha,
    happinessScore: careQuality.happinessScore * (1 - alpha) + stats.happiness * alpha,
    healthScore: careQuality.healthScore * (1 - alpha) + stats.health * alpha,
    interactionCount: careQuality.interactionCount,
  };
};

export const useTamagotchiStore = create<TamagotchiState & TamagotchiActions>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      birthDate: new Date(),
      currentMood: 'happy',
      evolutionStage: 'baby',
      stats: {
        hunger: 50,
        happiness: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      },
      personality: {
        intelligence: 30,
        friendliness: 50,
        playfulness: 50,
        discipline: 30,
      },
      careQuality: {
        feedingScore: 70,
        happinessScore: 90,
        healthScore: 100,
        interactionCount: 0,
      },
      activityLogs: [],
      conversations: [],
      isAlive: true,
      lastUpdated: new Date(),
      aiConfig: {
        provider: 'none',
      },

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

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        // Increase discipline slightly for consistent care
        const newPersonality = {
          ...state.personality,
          discipline: clamp(state.personality.discipline + 0.5, 0, 100),
        };

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          personality: newPersonality,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
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

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        // Increase playfulness and friendliness
        const newPersonality = {
          ...state.personality,
          playfulness: clamp(state.personality.playfulness + 1, 0, 100),
          friendliness: clamp(state.personality.friendliness + 0.5, 0, 100),
        };

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          personality: newPersonality,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
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

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
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
        const newCareQuality = { ...state.careQuality };
        newCareQuality.interactionCount += 1;

        set({
          currentMood: 'sleeping',
          careQuality: newCareQuality,
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
            const newCareQualityAfter = updateCareQuality(statsAfter, currentState.careQuality);
            const newEvolutionStage = getEvolutionStage(currentState.birthDate, newCareQualityAfter);

            set({
              stats: statsAfter,
              currentMood: getMood(statsAfter),
              careQuality: newCareQualityAfter,
              evolutionStage: newEvolutionStage,
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

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          activityLogs: [
            createActivityLog('medicine', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
      },

      trainPet: () => {
        const state = get();
        if (!state.isAlive || state.stats.energy < 15) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          energy: clamp(state.stats.energy - 10, 0, 100),
          hunger: clamp(state.stats.hunger + 5, 0, 100),
        };

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        // Training increases intelligence and discipline
        const newPersonality = {
          ...state.personality,
          intelligence: clamp(state.personality.intelligence + 1.5, 0, 100),
          discipline: clamp(state.personality.discipline + 1, 0, 100),
        };

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          personality: newPersonality,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          activityLogs: [
            createActivityLog('train', statsBefore, statsAfter),
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

        const newCareQuality = updateCareQuality(newStats, state.careQuality);
        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: newStats,
          currentMood: isAlive ? getMood(newStats) : 'sad',
          isAlive,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          lastUpdated: new Date(),
        });
      },

      namePet: (name: string) => {
        set({ name });
      },

      setAIProvider: (provider, apiKey) => {
        const state = get();
        const newConfig = { ...state.aiConfig, provider };

        if (provider === 'claude' && apiKey) {
          newConfig.claudeApiKey = apiKey;
        } else if (provider === 'openai' && apiKey) {
          newConfig.openaiApiKey = apiKey;
        }

        set({ aiConfig: newConfig });
      },

      sendMessage: async (message: string) => {
        const state = get();

        if (state.aiConfig.provider === 'none') {
          return 'Please configure an AI provider in settings first!';
        }

        // Import AI service dynamically
        const { callAI } = await import('../services/aiService');

        try {
          const response = await callAI({
            message,
            petName: state.name,
            mood: state.currentMood,
            stats: state.stats,
            personality: state.personality,
            evolutionStage: state.evolutionStage,
            conversationHistory: state.conversations.slice(-5), // Last 5 conversations for context
            provider: state.aiConfig.provider,
            claudeApiKey: state.aiConfig.claudeApiKey,
            openaiApiKey: state.aiConfig.openaiApiKey,
          });

          // Save conversation
          const conversation = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            userMessage: message,
            aiResponse: response,
            evolutionStage: state.evolutionStage,
            mood: state.currentMood,
          };

          // Increase friendliness from conversation
          const newPersonality = {
            ...state.personality,
            friendliness: clamp(state.personality.friendliness + 0.3, 0, 100),
          };

          set({
            conversations: [conversation, ...state.conversations],
            personality: newPersonality,
          });

          return response;
        } catch (error) {
          console.error('AI Error:', error);
          return 'Sorry, I had trouble understanding that. Please try again!';
        }
      },

      exportConversations: () => {
        const state = get();

        const exportData = {
          petName: state.name,
          exportDate: new Date().toISOString(),
          totalConversations: state.conversations.length,
          conversations: state.conversations.map(conv => ({
            timestamp: conv.timestamp,
            evolutionStage: conv.evolutionStage,
            mood: conv.mood,
            userMessage: conv.userMessage,
            aiResponse: conv.aiResponse,
          })),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${state.name}-conversations-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: 'tamagotchi-storage',
    }
  )
);
