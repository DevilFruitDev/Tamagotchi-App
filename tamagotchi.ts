export type PetMood = 'happy' | 'sad' | 'hungry' | 'tired' | 'sick' | 'dirty' | 'sleeping';

export interface PetStats {
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  cleanliness: number;
}

export interface ActivityLog {
  id: string;
  action: 'feed' | 'play' | 'clean' | 'sleep' | 'medicine';
  timestamp: Date;
  statsBefore: PetStats;
  statsAfter: PetStats;
}

export interface TamagotchiState {
  name: string;
  birthDate: Date;
  currentMood: PetMood;
  stats: PetStats;
  activityLogs: ActivityLog[];
  isAlive: boolean;
  lastUpdated: Date;
}

export interface TamagotchiActions {
  feedPet: () => void;
  playWithPet: () => void;
  cleanPet: () => void;
  putPetToSleep: () => void;
  giveMedicine: () => void;
  updateStats: (elapsed: number) => void;
  namePet: (name: string) => void;
}
