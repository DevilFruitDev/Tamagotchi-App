import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

export const Learn: React.FC = () => {
  const { feedKnowledge, browseAndLearn, isAlive, currentMood } = useTamagotchiStore();
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [showBrowseForm, setShowBrowseForm] = useState(false);
  const [knowledgeTitle, setKnowledgeTitle] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [browseUrl, setBrowseUrl] = useState('');

  const isSleeping = currentMood === 'sleeping';

  const handleKnowledgeSubmit = () => {
    if (knowledgeTitle.trim() && knowledgeContent.trim()) {
      feedKnowledge({
        title: knowledgeTitle.trim(),
        content: knowledgeContent.trim(),
        source: 'manual',
      });
      setKnowledgeTitle('');
      setKnowledgeContent('');
      setShowKnowledgeForm(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;

        // Automatically feed the knowledge
        feedKnowledge({
          title: file.name,
          content: content.substring(0, 5000), // Limit to 5000 chars
          source: 'file',
        });

        // Reset
        event.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  const handleBrowseSubmit = async () => {
    if (browseUrl.trim()) {
      await browseAndLearn(browseUrl.trim());
      setBrowseUrl('');
      setShowBrowseForm(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Learning & Knowledge</h2>

      <div className="space-y-3">
        {/* Upload File Button */}
        <motion.label
          whileHover={{ scale: isAlive && !isSleeping ? 1.02 : 1 }}
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${
            !isAlive || isSleeping
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-purple-400 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <span className="text-2xl mb-2">📄</span>
          <span className="text-sm font-medium text-purple-900">Upload File to Learn</span>
          <span className="text-xs text-purple-700">Feed knowledge from text files</span>
          <input
            type="file"
            accept=".txt,.md,.json"
            onChange={handleFileUpload}
            disabled={!isAlive || isSleeping}
            className="hidden"
          />
        </motion.label>

        {/* Feed Knowledge Button */}
        <motion.button
          whileHover={{ scale: !isAlive || isSleeping ? 1 : 1.02 }}
          whileTap={{ scale: !isAlive || isSleeping ? 1 : 0.98 }}
          onClick={() => setShowKnowledgeForm(!showKnowledgeForm)}
          disabled={!isAlive || isSleeping}
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            !isAlive || isSleeping
              ? 'bg-gray-200 text-gray-400'
              : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-medium">Feed Knowledge</span>
          </div>
          <span className="text-sm">{showKnowledgeForm ? '▲' : '▼'}</span>
        </motion.button>

        {showKnowledgeForm && (
          <div className="p-3 bg-indigo-50 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Knowledge title..."
              value={knowledgeTitle}
              onChange={(e) => setKnowledgeTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              maxLength={100}
            />
            <textarea
              placeholder="What would you like to teach your Tamagotchi?"
              value={knowledgeContent}
              onChange={(e) => setKnowledgeContent(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={4}
              maxLength={2000}
            />
            <button
              onClick={handleKnowledgeSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Feed Knowledge
            </button>
          </div>
        )}

        {/* Browse & Learn Button */}
        <motion.button
          whileHover={{ scale: !isAlive || isSleeping ? 1 : 1.02 }}
          whileTap={{ scale: !isAlive || isSleeping ? 1 : 0.98 }}
          onClick={() => setShowBrowseForm(!showBrowseForm)}
          disabled={!isAlive || isSleeping}
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            !isAlive || isSleeping
              ? 'bg-gray-200 text-gray-400'
              : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <span className="font-medium">Browse & Learn</span>
          </div>
          <span className="text-sm">{showBrowseForm ? '▲' : '▼'}</span>
        </motion.button>

        {showBrowseForm && (
          <div className="p-3 bg-blue-50 rounded-lg space-y-2">
            <input
              type="url"
              placeholder="Enter URL to learn from..."
              value={browseUrl}
              onChange={(e) => setBrowseUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <button
              onClick={handleBrowseSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Start Learning
            </button>
            <p className="text-xs text-blue-700">
              Note: Web browsing is currently simulated. Your Tamagotchi will record the URL.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
