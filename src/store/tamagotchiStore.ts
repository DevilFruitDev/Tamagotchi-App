import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TamagotchiState,
  TamagotchiActions,
  PetMood,
  ActivityLog,
  PetStats,
  EvolutionStage,
  PersonalityTraits,
  CareQuality,
  EvolutionBranch,
  EvolutionAbility,
  StatModifiers,
  KnowledgeItem,
  Visitor,
  Reminder
} from '../types/tamagotchi';

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

// Generate random personality traits (30-70 range with slight bias towards balance)
const generateRandomPersonality = (): PersonalityTraits => {
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    intelligence: random(30, 70),
    friendliness: random(30, 70),
    playfulness: random(30, 70),
    discipline: random(30, 70),
  };
};

// Determine evolution branch based on highest personality trait
const determineEvolutionBranch = (
  currentStage: EvolutionStage,
  personality: PersonalityTraits,
  currentBranch: EvolutionBranch
): EvolutionBranch => {
  // Only determine branch when evolving from baby to child
  if (currentStage !== 'child' || currentBranch !== 'none') {
    return currentBranch;
  }

  // Find highest trait
  const traits = [
    { name: 'intelligence' as const, value: personality.intelligence },
    { name: 'playfulness' as const, value: personality.playfulness },
    { name: 'discipline' as const, value: personality.discipline },
  ];

  const highestTrait = traits.reduce((max, trait) =>
    trait.value > max.value ? trait : max
  );

  // Map trait to branch
  if (highestTrait.name === 'intelligence' && highestTrait.value >= 60) {
    return 'smart';
  } else if (highestTrait.name === 'playfulness' && highestTrait.value >= 60) {
    return 'energetic';
  } else if (highestTrait.name === 'discipline' && highestTrait.value >= 60) {
    return 'disciplined';
  }

  return 'none'; // Neutral path if no trait is high enough
};

// Get abilities for current evolution branch and stage
const getAbilities = (branch: EvolutionBranch, stage: EvolutionStage): EvolutionAbility[] => {
  if (branch === 'none' || stage === 'baby') {
    return [];
  }

  const abilities: EvolutionAbility[] = [];

  if (branch === 'smart') {
    if (stage === 'child') {
      abilities.push({
        name: 'Quick Learner',
        description: 'Training costs 30% less energy and grants +0.5 intelligence bonus',
        energyCostModifier: 0.7,
        trainingBonus: 0.5,
      });
    }
    if (stage === 'teen') {
      abilities.push({
        name: 'Sharp Mind',
        description: 'Hunger increases 20% slower, training bonus increased to +1.0',
        trainingBonus: 1.0,
      });
    }
    if (stage === 'adult') {
      abilities.push({
        name: 'Genius',
        description: 'All energy costs reduced by 20%, training gives +1.5 intelligence',
        energyCostModifier: 0.8,
        trainingBonus: 1.5,
      });
    }
  } else if (branch === 'energetic') {
    if (stage === 'child') {
      abilities.push({
        name: 'Playful Spirit',
        description: 'Playing costs 30% less energy and grants +5 happiness bonus',
        energyCostModifier: 0.7,
        happinessBonus: 5,
      });
    }
    if (stage === 'teen') {
      abilities.push({
        name: 'Endless Energy',
        description: 'Happiness decays 30% slower, play happiness bonus +10',
        happinessBonus: 10,
      });
    }
    if (stage === 'adult') {
      abilities.push({
        name: 'Boundless Joy',
        description: 'Energy decays 20% slower, play gives +15 happiness and costs 50% less',
        energyCostModifier: 0.5,
        happinessBonus: 15,
      });
    }
  } else if (branch === 'disciplined') {
    if (stage === 'child') {
      abilities.push({
        name: 'Good Habits',
        description: 'All stats decay 20% slower',
        statDecayModifier: 0.8,
      });
    }
    if (stage === 'teen') {
      abilities.push({
        name: 'Self-Care',
        description: 'Stats decay 30% slower, slight health regeneration',
        statDecayModifier: 0.7,
        healthRegenBonus: 0.5,
      });
    }
    if (stage === 'adult') {
      abilities.push({
        name: 'Perfect Balance',
        description: 'Stats decay 40% slower, moderate health regeneration',
        statDecayModifier: 0.6,
        healthRegenBonus: 1.0,
      });
    }
  }

  return abilities;
};

// Calculate stat modifiers based on personality and abilities
const calculateStatModifiers = (
  personality: PersonalityTraits,
  abilities: EvolutionAbility[]
): StatModifiers => {
  let modifiers: StatModifiers = {
    hungerDecayRate: 1.0,
    happinessDecayRate: 1.0,
    energyDecayRate: 1.0,
    cleanlinessDecayRate: 1.0,
    trainingEnergyCost: 10,
    playEnergyCost: 15,
  };

  // Personality-based modifiers (high = 70+)
  if (personality.intelligence >= 70) {
    modifiers.hungerDecayRate *= 0.85; // 15% slower hunger
  }
  if (personality.playfulness >= 70) {
    modifiers.happinessDecayRate *= 0.75; // 25% slower happiness decay
    modifiers.playEnergyCost -= 3; // 3 less energy for play
  }
  if (personality.discipline >= 70) {
    modifiers.hungerDecayRate *= 0.85;
    modifiers.happinessDecayRate *= 0.85;
    modifiers.energyDecayRate *= 0.85;
    modifiers.cleanlinessDecayRate *= 0.85;
  }
  if (personality.friendliness >= 70) {
    // Friendliness affects happiness from interactions (applied in actions)
  }

  // Ability-based modifiers
  abilities.forEach(ability => {
    if (ability.statDecayModifier) {
      modifiers.hungerDecayRate *= ability.statDecayModifier;
      modifiers.happinessDecayRate *= ability.statDecayModifier;
      modifiers.energyDecayRate *= ability.statDecayModifier;
      modifiers.cleanlinessDecayRate *= ability.statDecayModifier;
    }
    if (ability.energyCostModifier) {
      modifiers.trainingEnergyCost *= ability.energyCostModifier;
      modifiers.playEnergyCost *= ability.energyCostModifier;
    }
  });

  return modifiers;
};

export const useTamagotchiStore = create<TamagotchiState & TamagotchiActions>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      birthDate: new Date(),
      currentMood: 'happy',
      currentLocation: 'living-room',
      evolutionStage: 'baby',
      evolutionBranch: 'none',
      abilities: [],
      stats: {
        hunger: 50,
        happiness: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      },
      personality: {
        intelligence: 50,
        friendliness: 50,
        playfulness: 50,
        discipline: 50,
      },
      careQuality: {
        feedingScore: 70,
        happinessScore: 90,
        healthScore: 100,
        interactionCount: 0,
      },
      environment: {
        houseTraining: 20,
        cleanliness: 80,
        enrichment: 50,
        knowledgeLevel: 0,
      },
      knowledgeBase: [],
      visitors: [],
      reminders: [],
      activityLogs: [],
      conversations: [],
      isAlive: true,
      lastUpdated: new Date(),
      lastInteractionTime: new Date(),
      notificationsEnabled: false,
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

        // Calculate energy cost with modifiers
        const modifiers = calculateStatModifiers(state.personality, state.abilities);
        const energyCost = Math.round(modifiers.playEnergyCost);

        if (!state.isAlive || state.stats.energy < energyCost) return;

        const statsBefore = { ...state.stats };

        // Calculate happiness bonus from abilities
        const abilityHappinessBonus = state.abilities.reduce(
          (total, ability) => total + (ability.happinessBonus || 0),
          0
        );

        // High friendliness gives +15% happiness from interactions
        const friendlinessBonus = state.personality.friendliness >= 70 ? 3 : 0;

        const totalHappinessGain = 20 + abilityHappinessBonus + friendlinessBonus;

        const statsAfter = {
          ...state.stats,
          happiness: clamp(state.stats.happiness + totalHappinessGain, 0, 100),
          energy: clamp(state.stats.energy - energyCost, 0, 100),
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
        const newBranch = determineEvolutionBranch(newEvolutionStage, newPersonality, state.evolutionBranch);
        const newAbilities = getAbilities(newBranch, newEvolutionStage);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          personality: newPersonality,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          evolutionBranch: newBranch,
          abilities: newAbilities,
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

      wakeUpPet: () => {
        const state = get();
        if (!state.isAlive || state.currentMood !== 'sleeping') return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          energy: clamp(state.stats.energy + 30, 0, 100), // Partial energy restore
          happiness: clamp(state.stats.happiness - 5, 0, 100), // Slightly grumpy when woken up early
        };

        const newCareQuality = { ...state.careQuality };
        newCareQuality.interactionCount += 1;

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          lastInteractionTime: new Date(),
          activityLogs: [
            createActivityLog('wake', statsBefore, statsAfter),
            ...state.activityLogs,
          ],
        });
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

        // Calculate energy cost with modifiers
        const modifiers = calculateStatModifiers(state.personality, state.abilities);
        const energyCost = Math.round(modifiers.trainingEnergyCost);

        if (!state.isAlive || state.stats.energy < energyCost) return;

        const statsBefore = { ...state.stats };
        const statsAfter = {
          ...state.stats,
          energy: clamp(state.stats.energy - energyCost, 0, 100),
          hunger: clamp(state.stats.hunger + 5, 0, 100),
        };

        const newCareQuality = updateCareQuality(statsAfter, state.careQuality);
        newCareQuality.interactionCount += 1;

        // Calculate training bonus from abilities
        const abilityTrainingBonus = state.abilities.reduce(
          (total, ability) => total + (ability.trainingBonus || 0),
          0
        );

        // Base intelligence gain + ability bonuses
        const intelligenceGain = 1.5 + abilityTrainingBonus;

        // Training increases intelligence and discipline
        const newPersonality = {
          ...state.personality,
          intelligence: clamp(state.personality.intelligence + intelligenceGain, 0, 100),
          discipline: clamp(state.personality.discipline + 1, 0, 100),
        };

        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);
        const newBranch = determineEvolutionBranch(newEvolutionStage, newPersonality, state.evolutionBranch);
        const newAbilities = getAbilities(newBranch, newEvolutionStage);

        set({
          stats: statsAfter,
          currentMood: getMood(statsAfter),
          personality: newPersonality,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          evolutionBranch: newBranch,
          abilities: newAbilities,
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

        // Calculate stat modifiers based on personality and abilities
        const modifiers = calculateStatModifiers(state.personality, state.abilities);

        let newStats = {
          hunger: clamp(
            state.stats.hunger + DECAY_RATE.hunger * secondsElapsed * modifiers.hungerDecayRate,
            0,
            100
          ),
          happiness: clamp(
            state.stats.happiness - DECAY_RATE.happiness * secondsElapsed * modifiers.happinessDecayRate,
            0,
            100
          ),
          energy: clamp(
            state.stats.energy - DECAY_RATE.energy * secondsElapsed * modifiers.energyDecayRate,
            0,
            100
          ),
          health: state.stats.health,
          cleanliness: clamp(
            state.stats.cleanliness - DECAY_RATE.cleanliness * secondsElapsed * modifiers.cleanlinessDecayRate,
            0,
            100
          ),
        };

        // Health decay when other stats are low
        if (newStats.hunger > 90 || newStats.cleanliness < 20 || newStats.happiness < 20) {
          newStats.health = clamp(newStats.health - 0.01 * secondsElapsed, 0, 100);
        }

        // Health regeneration from abilities
        const healthRegen = state.abilities.reduce(
          (total, ability) => total + (ability.healthRegenBonus || 0),
          0
        );
        if (healthRegen > 0 && newStats.health < 100) {
          newStats.health = clamp(newStats.health + healthRegen * secondsElapsed * 0.1, 0, 100);
        }

        // Check if pet dies
        const isAlive = newStats.health > 0;

        const newCareQuality = updateCareQuality(newStats, state.careQuality);
        const newEvolutionStage = getEvolutionStage(state.birthDate, newCareQuality);

        // Check for evolution and update branch/abilities
        const newBranch = determineEvolutionBranch(
          newEvolutionStage,
          state.personality,
          state.evolutionBranch
        );
        const newAbilities = getAbilities(newBranch, newEvolutionStage);

        set({
          stats: newStats,
          currentMood: isAlive ? getMood(newStats) : 'sad',
          isAlive,
          careQuality: newCareQuality,
          evolutionStage: newEvolutionStage,
          evolutionBranch: newBranch,
          abilities: newAbilities,
          lastUpdated: new Date(),
        });
      },

      namePet: (name: string) => {
        // Generate random personality when pet is named (birth moment)
        const randomPersonality = generateRandomPersonality();
        set({
          name,
          personality: randomPersonality,
          birthDate: new Date(), // Reset birth date
        });
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
            evolutionBranch: state.evolutionBranch,
            abilities: state.abilities,
            knowledgeBase: state.knowledgeBase.slice(0, 10), // Pass top 10 knowledge items
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

      feedKnowledge: (knowledge) => {
        const state = get();
        if (!state.isAlive) return;

        const newKnowledge: KnowledgeItem = {
          ...knowledge,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        // Add to knowledge base
        const updatedKnowledgeBase = [newKnowledge, ...state.knowledgeBase];

        // Update environment knowledge level
        const knowledgeGain = Math.min(5, 100 - state.environment.knowledgeLevel);
        const newEnvironment = {
          ...state.environment,
          knowledgeLevel: clamp(state.environment.knowledgeLevel + knowledgeGain, 0, 100),
        };

        // "Feeding" knowledge reduces hunger and increases intelligence
        const newStats = {
          ...state.stats,
          hunger: clamp(state.stats.hunger - 15, 0, 100),
        };

        const newPersonality = {
          ...state.personality,
          intelligence: clamp(state.personality.intelligence + 0.5, 0, 100),
        };

        set({
          knowledgeBase: updatedKnowledgeBase,
          environment: newEnvironment,
          stats: newStats,
          personality: newPersonality,
        });
      },

      browseAndLearn: async (url: string) => {
        const state = get();
        if (!state.isAlive) return;

        try {
          // Use CORS proxy to fetch the URL content
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
          const response = await fetch(proxyUrl);

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }

          const data = await response.json();
          const htmlContent = data.contents;

          // Extract text from HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');

          // Remove script and style elements
          const scripts = doc.querySelectorAll('script, style, nav, footer, header');
          scripts.forEach(el => el.remove());

          // Get text content
          let textContent = doc.body.textContent || '';

          // Clean up whitespace
          textContent = textContent
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000); // Limit to 3000 chars

          // Extract title
          const pageTitle = doc.title || url.split('/').pop() || 'Web Page';

          // Extract meta description if available
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

          const fullContent = metaDesc
            ? `${metaDesc}\n\n${textContent}`
            : textContent;

          const newKnowledge: KnowledgeItem = {
            id: crypto.randomUUID(),
            title: pageTitle,
            content: fullContent,
            source: 'url',
            timestamp: new Date(),
            tags: ['web', 'browsed'],
          };

          const updatedKnowledgeBase = [newKnowledge, ...state.knowledgeBase];

          const knowledgeGain = Math.min(10, 100 - state.environment.knowledgeLevel);
          const newEnvironment = {
            ...state.environment,
            knowledgeLevel: clamp(state.environment.knowledgeLevel + knowledgeGain, 0, 100),
          };

          // Learning from web gives more intelligence boost
          const newStats = {
            ...state.stats,
            hunger: clamp(state.stats.hunger - 20, 0, 100),
          };

          const newPersonality = {
            ...state.personality,
            intelligence: clamp(state.personality.intelligence + 1, 0, 100),
          };

          set({
            knowledgeBase: updatedKnowledgeBase,
            environment: newEnvironment,
            stats: newStats,
            personality: newPersonality,
          });
        } catch (error) {
          console.error('Error browsing URL:', error);
          throw error; // Re-throw so UI can handle it
        }
      },

      cleanEnvironment: () => {
        const state = get();
        if (!state.isAlive) return;

        const newEnvironment = {
          ...state.environment,
          cleanliness: clamp(state.environment.cleanliness + 30, 0, 100),
        };

        // Clean environment also improves pet mood
        const newStats = {
          ...state.stats,
          happiness: clamp(state.stats.happiness + 5, 0, 100),
        };

        set({
          environment: newEnvironment,
          stats: newStats,
        });
      },

      exportKnowledge: () => {
        const state = get();

        const exportData = {
          petName: state.name,
          exportDate: new Date().toISOString(),
          totalKnowledge: state.knowledgeBase.length,
          knowledgeLevel: state.environment.knowledgeLevel,
          knowledge: state.knowledgeBase.map(item => ({
            title: item.title,
            content: item.content,
            source: item.source,
            timestamp: item.timestamp,
            category: item.category,
            tags: item.tags,
          })),
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${state.name}-knowledge-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      exportVisitorCard: (message: string, includeKnowledge: boolean) => {
        const state = get();

        const knowledgeGifts = includeKnowledge
          ? state.knowledgeBase.slice(0, 3).map(item => ({
              title: item.title,
              content: item.content,
              source: item.source as 'file' | 'url' | 'conversation' | 'manual',
              category: item.category,
              tags: item.tags,
            }))
          : undefined;

        const visitorCard = {
          name: state.name,
          evolutionStage: state.evolutionStage,
          evolutionBranch: state.evolutionBranch,
          personality: state.personality,
          message,
          knowledgeGifts,
          exportDate: new Date(),
        };

        const dataStr = JSON.stringify(visitorCard, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${state.name}-visitor-card.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      importVisitorCard: (cardData: string) => {
        const state = get();
        if (!state.isAlive) return;

        try {
          const visitorCard = JSON.parse(cardData);

          // Create visitor entry
          const visitor: Visitor = {
            id: crypto.randomUUID(),
            name: visitorCard.name,
            evolutionStage: visitorCard.evolutionStage,
            evolutionBranch: visitorCard.evolutionBranch,
            personality: visitorCard.personality,
            message: visitorCard.message,
            gifts: visitorCard.knowledgeGifts?.map((gift: Omit<KnowledgeItem, 'id' | 'timestamp'>) => ({
              ...gift,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            })),
            visitTimestamp: new Date(),
          };

          // Add gifts to knowledge base if any
          let updatedKnowledgeBase = state.knowledgeBase;
          if (visitor.gifts && visitor.gifts.length > 0) {
            updatedKnowledgeBase = [...visitor.gifts, ...state.knowledgeBase];
          }

          // Keep only last 10 visitors
          const updatedVisitors = [visitor, ...state.visitors].slice(0, 10);

          // Increase happiness and friendliness from visitor
          const newStats = {
            ...state.stats,
            happiness: clamp(state.stats.happiness + 10, 0, 100),
          };

          const newPersonality = {
            ...state.personality,
            friendliness: clamp(state.personality.friendliness + 1, 0, 100),
          };

          set({
            visitors: updatedVisitors,
            knowledgeBase: updatedKnowledgeBase,
            stats: newStats,
            personality: newPersonality,
          });
        } catch (error) {
          console.error('Error importing visitor card:', error);
          throw new Error('Invalid visitor card format');
        }
      },

      updateLocation: (location) => {
        set({ currentLocation: location });
      },

      addReminder: (reminder) => {
        const state = get();

        const newReminder: Reminder = {
          ...reminder,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          completed: false,
          dismissed: false,
        };

        set({
          reminders: [...state.reminders, newReminder],
        });
      },

      completeReminder: (id) => {
        const state = get();
        set({
          reminders: state.reminders.map(r =>
            r.id === id ? { ...r, completed: true } : r
          ),
        });
      },

      dismissReminder: (id) => {
        const state = get();
        set({
          reminders: state.reminders.map(r =>
            r.id === id ? { ...r, dismissed: true } : r
          ),
        });
      },

      checkReminders: () => {
        const state = get();
        const now = new Date();

        // Check for due reminders
        state.reminders.forEach(reminder => {
          if (
            !reminder.completed &&
            !reminder.dismissed &&
            new Date(reminder.scheduledFor) <= now
          ) {
            // Show browser notification if enabled
            if (state.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`${state.name} - ${reminder.title}`, {
                body: reminder.message,
                icon: '/tamagotchi-app/favicon.ico',
                tag: reminder.id,
              });
            }

            // If recurring, create next reminder
            if (reminder.recurring && reminder.recurringInterval) {
              const nextScheduledFor = new Date(reminder.scheduledFor);
              nextScheduledFor.setMinutes(nextScheduledFor.getMinutes() + reminder.recurringInterval);

              get().addReminder({
                type: reminder.type,
                title: reminder.title,
                message: reminder.message,
                scheduledFor: nextScheduledFor,
                recurring: true,
                recurringInterval: reminder.recurringInterval,
              });
            }
          }
        });

        // Check if pet misses you (no interaction for 30 minutes)
        const timeSinceLastInteraction = now.getTime() - new Date(state.lastInteractionTime).getTime();
        const minutesSinceInteraction = timeSinceLastInteraction / (1000 * 60);

        if (
          minutesSinceInteraction >= 30 &&
          state.isAlive &&
          state.notificationsEnabled &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          // Check if we already sent a miss-you reminder recently
          const recentMissYou = state.reminders.find(r =>
            r.type === 'miss-you' &&
            !r.dismissed &&
            (now.getTime() - new Date(r.createdAt).getTime()) < 1800000 // 30 minutes
          );

          if (!recentMissYou) {
            new Notification(`${state.name} misses you! 💙`, {
              body: `It's been ${Math.floor(minutesSinceInteraction)} minutes since you last interacted. Come say hello!`,
              icon: '/tamagotchi-app/favicon.ico',
              tag: 'miss-you',
            });

            // Add miss-you reminder to history
            get().addReminder({
              type: 'miss-you',
              title: 'I miss you!',
              message: `${state.name} was feeling lonely`,
              scheduledFor: now,
            });
          }
        }

        // Auto-dismiss old completed/dismissed reminders (older than 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        set({
          reminders: state.reminders.filter(r => {
            if (r.completed || r.dismissed) {
              return new Date(r.createdAt) > sevenDaysAgo;
            }
            return true;
          }),
        });
      },

      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          return false;
        }

        if (Notification.permission === 'granted') {
          set({ notificationsEnabled: true });
          return true;
        }

        if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            set({ notificationsEnabled: true });
            return true;
          }
        }

        return false;
      },

      toggleNotifications: () => {
        const state = get();
        set({ notificationsEnabled: !state.notificationsEnabled });
      },
    }),
    {
      name: 'tamagotchi-storage',
    }
  )
);
