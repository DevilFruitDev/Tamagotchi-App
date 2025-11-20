import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

export const Chat: React.FC = () => {
  const {
    conversations = [],
    aiSuggestions = [],
    sendMessage,
    acknowledgeSuggestion,
    executeSuggestion,
    isAlive,
    name,
    aiConfig,
  } = useTamagotchiStore();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error]);

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      setIsSending(true);
      setError('');
      const userMessage = message;
      setMessage('');

      try {
        const response = await sendMessage(userMessage);
        if (response && response.includes('Sorry')) {
          setError(response);
        }
      } catch (err) {
        console.error('Chat error:', err);
        setError('Failed to send message. Please check your AI configuration.');
        setMessage(userMessage); // Restore message if failed
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'action': return '⚡';
      case 'environment': return '🏠';
      case 'learning': return '📚';
      case 'care': return '❤️';
      default: return '💡';
    }
  };

  const activeSuggestions = aiSuggestions.filter(s => !s.acknowledged).slice(0, 3);

  if (!isAlive || !name) {
    return (
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">💬 Chat with {name || 'Tamagotchi'}</h2>
        <p className="text-gray-500 italic text-center p-8">
          {!name ? 'Name your Tamagotchi first!' : 'Your Tamagotchi is not alive.'}
        </p>
      </div>
    );
  }

  if (aiConfig.provider === 'none') {
    return (
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">💬 Chat with {name}</h2>
        <p className="text-yellow-700 bg-yellow-50 p-4 rounded text-sm">
          ⚠️ Please configure an AI provider in Settings first!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow flex flex-col" style={{ height: '500px' }}>
      <h2 className="text-xl font-bold mb-4">💬 Chat with {name}</h2>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Active AI Suggestions */}
      {activeSuggestions.length > 0 && (
        <div className="mb-3 space-y-2">
          {activeSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-purple-900">{suggestion.title}</div>
                  <div className="text-xs text-gray-700">{suggestion.message}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {suggestion.action && suggestion.action !== 'none' && (
                    <button
                      onClick={() => executeSuggestion(suggestion)}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      title="Do it!"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => acknowledgeSuggestion(suggestion.id)}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-1">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 italic py-8">
            Start a conversation with {name}!
          </div>
        ) : (
          [...conversations].reverse().map((conv) => (
            <div key={conv.id} className="space-y-2">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
                  {conv.userMessage}
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-[75%] bg-gray-100 text-gray-900 px-3 py-2 rounded-lg text-sm">
                  {conv.aiResponse}
                  {conv.aiRecommendation && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="text-xs font-semibold text-purple-700">
                        {getSuggestionIcon(conv.aiRecommendation.type)} {conv.aiRecommendation.title}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Chat with ${name}...`}
          disabled={isSending}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          maxLength={500}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
