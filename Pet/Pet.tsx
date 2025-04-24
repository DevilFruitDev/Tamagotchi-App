import React from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

export const Pet: React.FC = () => {
  const { currentMood, isAlive } = useTamagotchiStore();

  const moodAnimations = {
    happy: {
      y: [0, -10, 0],
      transition: { duration: 1, repeat: Infinity },
    },
    sad: {
      scale: [1, 0.98, 1],
      transition: { duration: 2, repeat: Infinity },
    },
    hungry: {
      rotate: [-2, 2, -2],
      transition: { duration: 1.5, repeat: Infinity },
    },
    tired: {
      y: [0, 2, 0],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, repeat: Infinity },
    },
    sick: {
      scale: [1, 0.97, 1],
      opacity: [1, 0.9, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
    dirty: {
      x: [-1, 1, -1],
      transition: { duration: 0.5, repeat: Infinity },
    },
    sleeping: {
      scale: [1, 1.02, 1],
      transition: { duration: 3, repeat: Infinity },
    },
  };

  const getMoodColor = () => {
    if (!isAlive) return 'bg-gray-400';
    switch (currentMood) {
      case 'happy': return 'bg-pink-400';
      case 'sad': return 'bg-blue-400';
      case 'hungry': return 'bg-yellow-400';
      case 'tired': return 'bg-purple-400';
      case 'sick': return 'bg-green-400';
      case 'dirty': return 'bg-brown-400';
      case 'sleeping': return 'bg-indigo-400';
      default: return 'bg-pink-400';
    }
  };

  const getMoodExpression = () => {
    if (!isAlive) return '×_×';
    switch (currentMood) {
      case 'happy': return '◠‿◠';
      case 'sad': return '︵‿︵';
      case 'hungry': return 'ō~ō';
      case 'tired': return '-_-';
      case 'sick': return '@_@';
      case 'dirty': return '>_<';
      case 'sleeping': return 'ᴗ_ᴗ';
      default: return '◠‿◠';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className={`w-32 h-32 rounded-full flex items-center justify-center ${getMoodColor()} shadow-lg`}
        animate={isAlive ? moodAnimations[currentMood] : {}}
      >
        <span className="text-4xl text-white font-bold">
          {getMoodExpression()}
        </span>
      </motion.div>
      {currentMood === 'sleeping' && (
        <div className="absolute -mt-20 ml-24 text-2xl">
          💤
        </div>
      )}
      {currentMood === 'sick' && (
        <div className="absolute -mt-20 ml-24 text-2xl">
          🤒
        </div>
      )}
      {currentMood === 'hungry' && (
        <div className="absolute -mt-20 ml-24 text-2xl">
          🍽️
        </div>
      )}
      <p className="text-lg font-semibold capitalize">{currentMood}</p>
    </div>
  );
};
