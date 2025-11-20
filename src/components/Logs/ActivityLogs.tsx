import React from 'react';
import { useTamagotchiStore } from '../../store/tamagotchiStore';
import { ActivityLog } from '../../types/tamagotchi';

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

const getActionIcon = (action: ActivityLog['action']) => {
  switch (action) {
    case 'feed': return '🍖';
    case 'play': return '⚽';
    case 'clean': return '🧼';
    case 'sleep': return '💤';
    case 'medicine': return '💊';
    default: return '❓';
  }
};

export const ActivityLogs: React.FC = () => {
  const { activityLogs } = useTamagotchiStore();

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Activity Log</h2>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {activityLogs.length === 0 ? (
          <p className="text-gray-500 text-center">No activities yet</p>
        ) : (
          activityLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-start space-x-3 p-2 bg-gray-50 rounded"
            >
              <span className="text-xl">{getActionIcon(log.action)}</span>
              <div className="flex-1">
                <p className="font-medium capitalize">{log.action}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(log.timestamp)}
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  <p>Happiness: {Math.round(log.statsBefore.happiness)} → {Math.round(log.statsAfter.happiness)}</p>
                  <p>Hunger: {Math.round(log.statsBefore.hunger)} → {Math.round(log.statsAfter.hunger)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
