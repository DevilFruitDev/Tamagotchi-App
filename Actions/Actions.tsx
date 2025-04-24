import React from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

interface ActionButtonProps {
  onClick: () => void;
  icon: string;
  label: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, label, disabled }) => {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center p-4 rounded-lg
        ${disabled ? 'bg-gray-200 text-gray-400' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'}
        transition-colors duration-200
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

export const Actions: React.FC = () => {
  const { 
    feedPet, 
    playWithPet, 
    cleanPet, 
    putPetToSleep, 
    giveMedicine,
    isAlive,
    currentMood,
    stats
  } = useTamagotchiStore();

  const isSleeping = currentMood === 'sleeping';

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Actions</h2>
      <div className="grid grid-cols-3 gap-4">
        <ActionButton 
          onClick={feedPet} 
          icon="🍖" 
          label="Feed" 
          disabled={!isAlive || isSleeping}
        />
        <ActionButton 
          onClick={playWithPet} 
          icon="⚽" 
          label="Play" 
          disabled={!isAlive || isSleeping || stats.energy < 20}
        />
        <ActionButton 
          onClick={cleanPet} 
          icon="🧼" 
          label="Clean" 
          disabled={!isAlive || isSleeping}
        />
        <ActionButton 
          onClick={putPetToSleep} 
          icon="💤" 
          label="Sleep" 
          disabled={!isAlive || isSleeping}
        />
        <ActionButton 
          onClick={giveMedicine} 
          icon="💊" 
          label="Medicine" 
          disabled={!isAlive || isSleeping || stats.health > 80}
        />
      </div>
    </div>
  );
};
