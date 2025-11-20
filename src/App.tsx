import React, { useEffect, useRef, useState } from 'react';
import { useTamagotchiStore } from './store/tamagotchiStore';
import { Pet } from './components/Pet/Pet';
import { Stats } from './components/Stats/Stats';
import { Actions } from './components/Actions/Actions';
import { ActivityLogs } from './components/Logs/ActivityLogs';
import { Personality } from './components/Personality/Personality';
import { Settings } from './components/Settings/Settings';
import { Learn } from './components/Learn/Learn';
import { Environment } from './components/Environment/Environment';

function App() {
  const {
    name,
    namePet,
    updateStats,
    lastUpdated,
    isAlive,
    birthDate,
    evolutionStage
  } = useTamagotchiStore();
  
  const [inputName, setInputName] = useState('');
  const animationFrameRef = useRef<number>();

  // Game loop for updating stats
  useEffect(() => {
    const gameLoop = () => {
      const now = new Date();
      const lastUpdate = new Date(lastUpdated);
      const elapsed = now.getTime() - lastUpdate.getTime();
      
      if (elapsed > 1000) { // Update every second
        updateStats(elapsed);
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateStats, lastUpdated]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      namePet(inputName.trim());
    }
  };

  const getAge = () => {
    const now = new Date();
    const birth = new Date(birthDate);
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays;
  };

  if (!name) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Name Your Tamagotchi! 🐣
          </h1>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter a name..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={20}
            />
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
            >
              Start Adventure!
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800">
            {name} the Tamagotchi
          </h1>
          <p className="text-purple-600">
            Age: {getAge()} {getAge() === 1 ? 'day' : 'days'} old • {evolutionStage.charAt(0).toUpperCase() + evolutionStage.slice(1)} Stage
          </p>
          {!isAlive && (
            <p className="text-red-600 font-bold mt-2">
              Your Tamagotchi has passed away 😢
            </p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Pet />
            <Actions />
            <Learn />
          </div>
          <div className="space-y-6">
            <Stats />
            <Personality />
          </div>
          <div className="space-y-6">
            <Environment />
            <Settings />
            <ActivityLogs />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
