import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTamagotchiStore } from '../../store/tamagotchiStore';
import { ReminderType } from '../../types/tamagotchi';

export const Reminders: React.FC = () => {
  const {
    reminders,
    addReminder,
    completeReminder,
    dismissReminder,
    checkReminders,
    requestNotificationPermission,
    toggleNotifications,
    notificationsEnabled,
    name,
  } = useTamagotchiStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('task');
  const [scheduledMinutes, setScheduledMinutes] = useState(30);
  const [isRecurring, setIsRecurring] = useState(false);

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders();
    }, 60000); // Check every minute

    // Check immediately on mount
    checkReminders();

    return () => clearInterval(interval);
  }, [checkReminders]);

  const handleAddReminder = () => {
    if (reminderTitle.trim() && reminderMessage.trim()) {
      const scheduledFor = new Date();
      scheduledFor.setMinutes(scheduledFor.getMinutes() + scheduledMinutes);

      addReminder({
        type: reminderType,
        title: reminderTitle.trim(),
        message: reminderMessage.trim(),
        scheduledFor,
        recurring: isRecurring,
        recurringInterval: isRecurring ? scheduledMinutes : undefined,
      });

      setReminderTitle('');
      setReminderMessage('');
      setShowAddForm(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Notifications were denied. Please enable them in your browser settings.');
    }
  };

  const getReminderIcon = (type: ReminderType) => {
    switch (type) {
      case 'task': return '📋';
      case 'miss-you': return '💙';
      case 'care': return '❤️';
      case 'custom': return '⏰';
      default: return '🔔';
    }
  };

  const activeReminders = reminders.filter(r => !r.completed && !r.dismissed);
  const completedReminders = reminders.filter(r => r.completed || r.dismissed).slice(0, 5);

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">⏰ Reminders & Tasks</h2>
        <button
          onClick={notificationsEnabled ? toggleNotifications : handleEnableNotifications}
          className={`text-sm px-3 py-1 rounded ${
            notificationsEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {notificationsEnabled ? '🔔 On' : '🔕 Off'}
        </button>
      </div>

      {!notificationsEnabled && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Enable notifications to receive reminders from {name}!
        </div>
      )}

      <div className="space-y-3">
        {/* Add Reminder Button */}
        <motion.button
          whileHover={{ scale: !name ? 1 : 1.02 }}
          whileTap={{ scale: !name ? 1 : 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={!name}
          className={`w-full flex items-center justify-between p-3 rounded-lg ${
            !name
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">➕</span>
            <span className="font-medium">Add Reminder</span>
          </div>
          <span className="text-sm">{showAddForm ? '▲' : '▼'}</span>
        </motion.button>

        {showAddForm && (
          <div className="p-3 bg-purple-50 rounded-lg space-y-2">
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="task">📋 Task</option>
              <option value="care">❤️ Care Reminder</option>
              <option value="custom">⏰ Custom</option>
            </select>

            <input
              type="text"
              placeholder="Reminder title..."
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              maxLength={50}
            />

            <textarea
              placeholder="What should I remind you about?"
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={2}
              maxLength={200}
            />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Remind in:</label>
              <select
                value={scheduledMinutes}
                onChange={(e) => setScheduledMinutes(Number(e.target.value))}
                className="flex-1 px-3 py-2 border rounded text-sm"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={360}>6 hours</option>
                <option value={1440}>1 day</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              <span>Repeat this reminder</span>
            </label>

            <button
              onClick={handleAddReminder}
              disabled={!reminderTitle.trim() || !reminderMessage.trim()}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Set Reminder
            </button>
          </div>
        )}
      </div>

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-700">Active Reminders</h3>
          {activeReminders.map((reminder) => {
            const isPast = new Date(reminder.scheduledFor) <= new Date();
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  isPast
                    ? 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{getReminderIcon(reminder.type)}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{reminder.title}</div>
                    <div className="text-xs text-gray-700">{reminder.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isPast ? '⏰ Due now!' : `📅 ${new Date(reminder.scheduledFor).toLocaleString()}`}
                      {reminder.recurring && ' 🔁'}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => completeReminder(reminder.id)}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => dismissReminder(reminder.id)}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-gray-700">Recent History</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {completedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-2 bg-gray-50 rounded text-xs text-gray-600"
              >
                {getReminderIcon(reminder.type)} {reminder.title} - {reminder.completed ? 'Completed' : 'Dismissed'}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReminders.length === 0 && completedReminders.length === 0 && (
        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded text-center">
          No reminders yet. Set a task for {name} to remind you!
        </p>
      )}
    </div>
  );
};
