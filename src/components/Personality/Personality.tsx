import React from 'react';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

interface TraitBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const TraitBar: React.FC<TraitBarProps> = ({ label, value, color, icon }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-lg w-6">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">{Math.round(value)}</span>
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

export const Personality: React.FC = () => {
  const { personality, careQuality, evolutionStage } = useTamagotchiStore();

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Personality & Growth</h2>

      <div className="space-y-3">
        <TraitBar
          label="Intelligence"
          value={personality.intelligence}
          color="bg-indigo-400"
          icon="🧠"
        />
        <TraitBar
          label="Friendliness"
          value={personality.friendliness}
          color="bg-pink-400"
          icon="💖"
        />
        <TraitBar
          label="Playfulness"
          value={personality.playfulness}
          color="bg-yellow-400"
          icon="🎮"
        />
        <TraitBar
          label="Discipline"
          value={personality.discipline}
          color="bg-blue-400"
          icon="⭐"
        />
      </div>

      <div className="pt-4 border-t text-sm space-y-2">
        <h3 className="font-semibold text-md">Care Quality</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-gray-600">Feeding:</p>
            <p className="font-medium">{Math.round(careQuality.feedingScore)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Happiness:</p>
            <p className="font-medium">{Math.round(careQuality.happinessScore)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Health:</p>
            <p className="font-medium">{Math.round(careQuality.healthScore)}%</p>
          </div>
          <div>
            <p className="text-gray-600">Interactions:</p>
            <p className="font-medium">{careQuality.interactionCount}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Evolution Stage:</span>
          <span className="text-lg font-bold text-purple-600 capitalize">
            {evolutionStage}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {evolutionStage === 'baby' && '🍼 Grows to Child at 2 days with good care'}
          {evolutionStage === 'child' && '🧒 Grows to Teen at 5 days with good care'}
          {evolutionStage === 'teen' && '👦 Grows to Adult at 10 days with good care'}
          {evolutionStage === 'adult' && '👨 Fully grown! Keep caring for your pet'}
        </div>
      </div>
    </div>
  );
};
