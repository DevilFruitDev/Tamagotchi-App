import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';
import { AIProvider } from '../../types/tamagotchi';

export const Settings: React.FC = () => {
  const { aiConfig, setAIProvider, exportConversations, conversations } = useTamagotchiStore();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(aiConfig.provider);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = () => {
    if (selectedProvider === 'none') {
      setAIProvider('none');
      setMessage('AI disabled');
    } else if (!apiKey.trim()) {
      setMessage('Please enter an API key');
      return;
    } else {
      setAIProvider(selectedProvider, apiKey.trim());
      setMessage(`${selectedProvider === 'claude' ? 'Claude' : 'OpenAI'} configured successfully!`);
      setApiKey('');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">AI Provider</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="none">None (Disabled)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="openai">OpenAI (ChatGPT)</option>
          </select>
        </div>

        {selectedProvider !== 'none' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              API Key
              {selectedProvider === 'claude' && (
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  Get key
                </a>
              )}
              {selectedProvider === 'openai' && (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-blue-500 hover:underline"
                >
                  Get key
                </a>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${selectedProvider === 'claude' ? 'Claude' : 'OpenAI'} API key`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally in your browser only.
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full bg-pink-500 text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
        >
          Save Settings
        </motion.button>

        {message && (
          <p className={`text-sm text-center ${message.includes('error') || message.includes('Please') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-md font-semibold mb-2">Conversations</h3>
        <p className="text-sm text-gray-600 mb-3">
          Total conversations: {conversations.length}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportConversations}
          disabled={conversations.length === 0}
          className={`w-full py-2 rounded-md transition-colors ${
            conversations.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          📥 Export Conversations
        </motion.button>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-md font-semibold mb-2">Current Status</h3>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">AI Provider:</span>{' '}
            <span className={aiConfig.provider === 'none' ? 'text-gray-500' : 'text-green-600'}>
              {aiConfig.provider === 'none' ? 'Disabled' : aiConfig.provider === 'claude' ? 'Claude' : 'OpenAI'}
            </span>
          </p>
          <p>
            <span className="font-medium">API Key:</span>{' '}
            {aiConfig.provider === 'none' ? (
              <span className="text-gray-500">Not required</span>
            ) : aiConfig.provider === 'claude' && aiConfig.claudeApiKey ? (
              <span className="text-green-600">Configured ✓</span>
            ) : aiConfig.provider === 'openai' && aiConfig.openaiApiKey ? (
              <span className="text-green-600">Configured ✓</span>
            ) : (
              <span className="text-red-600">Not configured</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
