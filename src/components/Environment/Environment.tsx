import React from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

interface EnvironmentBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const EnvironmentBar: React.FC<EnvironmentBarProps> = ({ label, value, color, icon }) => {
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

export const Environment: React.FC = () => {
  const { environment, knowledgeBase, cleanEnvironment, exportKnowledge, isAlive } = useTamagotchiStore();

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Environment & Knowledge</h2>

      <div className="space-y-3">
        <EnvironmentBar
          label="House Training"
          value={environment.houseTraining}
          color="bg-amber-400"
          icon="🏠"
        />
        <EnvironmentBar
          label="Env. Cleanliness"
          value={environment.cleanliness}
          color="bg-teal-400"
          icon="✨"
        />
        <EnvironmentBar
          label="Enrichment"
          value={environment.enrichment}
          color="bg-purple-400"
          icon="🎨"
        />
        <EnvironmentBar
          label="Knowledge Level"
          value={environment.knowledgeLevel}
          color="bg-indigo-400"
          icon="📚"
        />
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Knowledge Items:</span>
          <span className="text-lg font-bold text-indigo-600">{knowledgeBase.length}</span>
        </div>

        {knowledgeBase.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <p className="text-xs text-gray-600 font-medium">Recent Learning:</p>
            {knowledgeBase.slice(0, 5).map((item) => (
              <div key={item.id} className="bg-indigo-50 p-2 rounded text-xs">
                <p className="font-medium text-indigo-900">{item.title}</p>
                <p className="text-indigo-700 truncate">{item.content.substring(0, 80)}...</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-indigo-600">Source: {item.source}</span>
                  <span className="text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t flex gap-2">
        <motion.button
          whileHover={{ scale: !isAlive ? 1 : 1.02 }}
          whileTap={{ scale: !isAlive ? 1 : 0.98 }}
          onClick={cleanEnvironment}
          disabled={!isAlive}
          className={`flex-1 py-2 rounded-md transition-colors ${
            !isAlive
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-500 text-white hover:bg-teal-600'
          }`}
        >
          🧹 Clean Home
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportKnowledge}
          disabled={knowledgeBase.length === 0}
          className={`flex-1 py-2 rounded-md transition-colors ${
            knowledgeBase.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          📥 Export
        </motion.button>
      </div>
    </div>
  );
};
