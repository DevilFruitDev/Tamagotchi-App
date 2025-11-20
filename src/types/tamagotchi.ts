export type PetMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'dirty' | 'sleeping';

export type EvolutionStage = 'baby' | 'child' | 'teen' | 'adult';

export type EvolutionBranch = 'none' | 'smart' | 'energetic' | 'disciplined';

export type AIProvider = 'claude' | 'openai' | 'none';

export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  cleanliness: number;
}

export interface PersonalityTraits {
  intelligence: number;    // 0-100, increased by training/teaching
  friendliness: number;    // 0-100, increased by interactions
  playfulness: number;     // 0-100, increased by play activities
  discipline: number;      // 0-100, increased by consistent care
}

export interface EvolutionAbility {
  name: string;
  description: string;
  statDecayModifier?: number;    // Multiplier for stat decay (0.7 = 30% slower)
  energyCostModifier?: number;   // Multiplier for energy costs (0.8 = 20% less)
  trainingBonus?: number;        // Extra intelligence gain from training
  happinessBonus?: number;       // Extra happiness from interactions
  healthRegenBonus?: number;     // Bonus health regeneration
}

export interface StatModifiers {
  hungerDecayRate: number;      // Multiplier for hunger increase
  happinessDecayRate: number;   // Multiplier for happiness decrease
  energyDecayRate: number;      // Multiplier for energy decrease
  cleanlinessDecayRate: number; // Multiplier for cleanliness decrease
  trainingEnergyCost: number;   // Energy cost for training
  playEnergyCost: number;       // Energy cost for playing
}

export interface CareQuality {
  feedingScore: number;    // How well fed (average over time)
  happinessScore: number;  // How happy (average over time)
  healthScore: number;     // How healthy (average over time)
  interactionCount: number; // Total interactions
}

export interface ActivityLog {
  id: string;
  action: 'feed' | 'play' | 'clean' | 'sleep' | 'medicine' | 'train' | 'talk';
  timestamp: Date;
  statsBefore: PetStats;
  statsAfter: PetStats;
}

export interface Conversation {
  id: string;
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  evolutionStage: EvolutionStage;
  mood: PetMood;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source: 'file' | 'url' | 'conversation' | 'manual';
  timestamp: Date;
  category?: string;
  tags?: string[];
}

export interface Environment {
  houseTraining: number;      // 0-100, affects behavior and abilities
  cleanliness: number;         // 0-100, environment cleanliness
  enrichment: number;          // 0-100, toys and activities available
  knowledgeLevel: number;      // 0-100, accumulated learning
}

export type CurrentLocation = 'bedroom' | 'study' | 'living-room' | 'play-area' | 'outside';

export interface Visitor {
  id: string;
  name: string;
  evolutionStage: EvolutionStage;
  evolutionBranch: EvolutionBranch;
  personality: PersonalityTraits;
  message: string;
  gifts?: KnowledgeItem[];
  visitTimestamp: Date;
}

export interface VisitorCard {
  name: string;
  evolutionStage: EvolutionStage;
  evolutionBranch: EvolutionBranch;
  personality: PersonalityTraits;
  message: string;
  knowledgeGifts?: Omit<KnowledgeItem, 'id' | 'timestamp'>[];
  exportDate: Date;
}

export interface AIConfig {
  provider: AIProvider;
  claudeApiKey?: string;
  openaiApiKey?: string;
}

export interface TamagotchiState {
  name: string;
  birthDate: Date;
  currentMood: PetMood;
  currentLocation: CurrentLocation;
  evolutionStage: EvolutionStage;
  evolutionBranch: EvolutionBranch;
  abilities: EvolutionAbility[];
  stats: PetStats;
  personality: PersonalityTraits;
  careQuality: CareQuality;
  environment: Environment;
  knowledgeBase: KnowledgeItem[];
  visitors: Visitor[];
  activityLogs: ActivityLog[];
  conversations: Conversation[];
  isAlive: boolean;
  lastUpdated: Date;
  aiConfig: AIConfig;
}

export interface TamagotchiActions {
  feedPet: () => void;
  playWithPet: () => void;
  cleanPet: () => void;
  putPetToSleep: () => void;
  giveMedicine: () => void;
  trainPet: () => void;
  feedKnowledge: (knowledge: Omit<KnowledgeItem, 'id' | 'timestamp'>) => void;
  browseAndLearn: (url: string) => Promise<void>;
  cleanEnvironment: () => void;
  updateStats: (elapsed: number) => void;
  namePet: (name: string) => void;
  setAIProvider: (provider: AIProvider, apiKey?: string) => void;
  sendMessage: (message: string) => Promise<string>;
  exportConversations: () => void;
  exportKnowledge: () => void;
  exportVisitorCard: (message: string, includeKnowledge: boolean) => void;
  importVisitorCard: (cardData: string) => void;
  updateLocation: (location: CurrentLocation) => void;
}
