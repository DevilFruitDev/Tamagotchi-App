import React from 'react';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color, icon }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg w-6">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">{Math.round(value)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const Stats: React.FC = () => {
  const { stats } = useTamagotchiStore();

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Pet Stats</h2>
      <StatBar 
        label="Hunger" 
        value={100 - stats.hunger} 
        color="bg-yellow-400" 
        icon="🍖" 
      />
      <StatBar 
        label="Happiness" 
        value={stats.happiness} 
        color="bg-pink-400" 
        icon="😊" 
      />
      <StatBar 
        label="Energy" 
        value={stats.energy} 
        color="bg-purple-400" 
        icon="⚡" 
      />
      <StatBar 
        label="Health" 
        value={stats.health} 
        color="bg-green-400" 
        icon="❤️" 
      />
      <StatBar 
        label="Cleanliness" 
        value={stats.cleanliness} 
        color="bg-blue-400" 
        icon="🧼" 
      />
    </div>
  );
};
