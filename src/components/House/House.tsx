import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';
import { CurrentLocation } from '../../types/tamagotchi';

const ROOM_CONFIG = {
  bedroom: {
    icon: '🛏️',
    name: 'Bedroom',
    description: 'Resting and sleeping',
  },
  study: {
    icon: '📚',
    name: 'Study',
    description: 'Learning and training',
  },
  'living-room': {
    icon: '🛋️',
    name: 'Living Room',
    description: 'Relaxing and socializing',
  },
  'play-area': {
    icon: '🎮',
    name: 'Play Area',
    description: 'Playing and having fun',
  },
  outside: {
    icon: '🌳',
    name: 'Outside',
    description: 'Exploring and exercising',
  },
};

export const House: React.FC = () => {
  const { currentLocation, currentMood, stats, updateLocation, isAlive } = useTamagotchiStore();

  // Auto-update location based on pet state
  useEffect(() => {
    if (!isAlive) return;

    let newLocation: CurrentLocation = currentLocation;

    if (currentMood === 'sleeping' || currentMood === 'tired') {
      newLocation = 'bedroom';
    } else if (currentMood === 'sick') {
      newLocation = 'bedroom';
    } else if (stats.hunger > 70) {
      newLocation = 'study'; // Hungry for knowledge
    } else if (stats.happiness < 40) {
      newLocation = 'bedroom'; // Sad, staying in room
    } else if (stats.energy > 70 && stats.happiness > 60) {
      newLocation = 'play-area';
    } else if (stats.happiness > 70) {
      newLocation = 'living-room';
    } else {
      newLocation = 'study'; // Default to studying
    }

    if (newLocation !== currentLocation) {
      updateLocation(newLocation);
    }
  }, [currentMood, stats, isAlive, currentLocation, updateLocation]);

  const rooms: CurrentLocation[] = ['bedroom', 'study', 'living-room', 'play-area', 'outside'];

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🏠 {isAlive ? "Your Tamagotchi's Home" : "Empty Home"}</h2>

      <div className="grid grid-cols-2 gap-3">
        {rooms.map((room) => {
          const isCurrentLocation = room === currentLocation && isAlive;
          const roomConfig = ROOM_CONFIG[room];

          return (
            <motion.div
              key={room}
              whileHover={{ scale: 1.03 }}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                isCurrentLocation
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{roomConfig.icon}</div>
                <div className="font-semibold text-sm">{roomConfig.name}</div>
                <div className="text-xs text-gray-600 mt-1">{roomConfig.description}</div>

                {isCurrentLocation && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isAlive && (
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-900">
          <span className="font-semibold">{ROOM_CONFIG[currentLocation].icon} Currently in:</span>{' '}
          {ROOM_CONFIG[currentLocation].name}
        </div>
      )}
    </div>
  );
};
