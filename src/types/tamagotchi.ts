export type PetMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'dirty' | 'sleeping';

export type EvolutionStage = 'baby' | 'child' | 'teen' | 'adult';

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

export interface AIConfig {
  provider: AIProvider;
  claudeApiKey?: string;
  openaiApiKey?: string;
}

export interface TamagotchiState {
  name: string;
  birthDate: Date;
  currentMood: PetMood;
  evolutionStage: EvolutionStage;
  stats: PetStats;
  personality: PersonalityTraits;
  careQuality: CareQuality;
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
  updateStats: (elapsed: number) => void;
  namePet: (name: string) => void;
  setAIProvider: (provider: AIProvider, apiKey?: string) => void;
  sendMessage: (message: string) => Promise<string>;
  exportConversations: () => void;
}
