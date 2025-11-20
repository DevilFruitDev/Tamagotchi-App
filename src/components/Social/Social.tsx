import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';

export const Social: React.FC = () => {
  const { exportVisitorCard, importVisitorCard, visitors, isAlive, name } = useTamagotchiStore();
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [includeKnowledge, setIncludeKnowledge] = useState(true);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const handleExport = () => {
    if (exportMessage.trim()) {
      exportVisitorCard(exportMessage.trim(), includeKnowledge);
      setExportMessage('');
      setShowExportForm(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          importVisitorCard(content);
          setImportSuccess('Visitor arrived successfully!');
          setImportError('');
          setTimeout(() => setImportSuccess(''), 3000);
        } catch (error) {
          setImportError('Invalid visitor card format. Please check the file.');
          setImportSuccess('');
        }
        event.target.value = '';
      };
      reader.onerror = () => {
        setImportError('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    }
  };

  const getEvolutionIcon = (branch: string) => {
    switch (branch) {
      case 'smart': return '🧠';
      case 'energetic': return '⚡';
      case 'disciplined': return '🎯';
      default: return '🥚';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'baby': return '👶';
      case 'child': return '🧒';
      case 'teen': return '🧑';
      case 'adult': return '👨';
      default: return '🥚';
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">👥 Social & Visitors</h2>

      {/* Success/Error Messages */}
      {importSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-green-100 text-green-800 rounded text-sm"
        >
          ✓ {importSuccess}
        </motion.div>
      )}

      {importError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-red-100 text-red-800 rounded text-sm"
        >
          ⚠ {importError}
        </motion.div>
      )}

      <div className="space-y-3">
        {/* Export Visitor Card */}
        <motion.button
          whileHover={{ scale: !isAlive || !name ? 1 : 1.02 }}
          whileTap={{ scale: !isAlive || !name ? 1 : 0.98 }}
          onClick={() => setShowExportForm(!showExportForm)}
          disabled={!isAlive || !name}
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            !isAlive || !name
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-100 text-green-900 hover:bg-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">📤</span>
            <span className="font-medium">Create Visitor Card</span>
          </div>
          <span className="text-sm">{showExportForm ? '▲' : '▼'}</span>
        </motion.button>

        {showExportForm && (
          <div className="p-3 bg-green-50 rounded-lg space-y-2">
            <textarea
              placeholder="Leave a message for your friends..."
              value={exportMessage}
              onChange={(e) => setExportMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {exportMessage.length}/200
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeKnowledge}
                onChange={(e) => setIncludeKnowledge(e.target.checked)}
                className="rounded"
              />
              <span>Include knowledge gifts (top 3)</span>
            </label>

            <button
              onClick={handleExport}
              disabled={!exportMessage.trim()}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Export Visitor Card
            </button>
            <p className="text-xs text-gray-600">
              Share the downloaded file with friends so their Tamagotchis can visit!
            </p>
          </div>
        )}

        {/* Import Visitor Card */}
        <motion.label
          whileHover={{ scale: isAlive ? 1.02 : 1 }}
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${
            !isAlive
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-blue-400 bg-blue-50 hover:bg-blue-100'
          }`}
        >
          <span className="text-2xl mb-2">📥</span>
          <span className="text-sm font-medium text-blue-900">Import Visitor Card</span>
          <span className="text-xs text-blue-700">Receive a visitor from a friend</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            disabled={!isAlive}
            className="hidden"
          />
        </motion.label>
      </div>

      {/* Visitor Guestbook */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">📖 Visitor Guestbook</h3>
        {visitors.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
            No visitors yet. Import visitor cards to receive guests!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {visitors.map((visitor) => (
              <motion.div
                key={visitor.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-start gap-2">
                  <div className="text-2xl">
                    {getStageIcon(visitor.evolutionStage)}
                    {getEvolutionIcon(visitor.evolutionBranch)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{visitor.name}</div>
                    <div className="text-xs text-gray-600 mb-1">
                      {visitor.evolutionStage} • {visitor.evolutionBranch}
                    </div>
                    <div className="text-sm text-gray-700 italic">"{visitor.message}"</div>
                    {visitor.gifts && visitor.gifts.length > 0 && (
                      <div className="mt-1 text-xs text-purple-700">
                        🎁 Brought {visitor.gifts.length} knowledge gift{visitor.gifts.length > 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(visitor.visitTimestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
