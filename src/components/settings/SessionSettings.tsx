import React, { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';

interface SettingItemProps {
  label: string;
  children: React.ReactNode;
  description?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, children, description }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 py-4">
    <label className="block">
      <span className="text-gray-700 dark:text-gray-200 font-medium">{label}</span>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
      <div className="mt-2">{children}</div>
    </label>
  </div>
);

const SessionSettings: React.FC = () => {
  const { config, state } = useSession();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Can't change settings during active session
  const isDisabled = state.isActive;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Session Settings
      </h2>

      {/* Voice Selection */}
      <SettingItem
        label="AI Voice"
        description="Select the voice for the AI facilitator"
      >
        <select
          className="w-full mt-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          value={config.voice}
          disabled={isDisabled}
        >
          {SESSION_CONFIG.VOICE_OPTIONS.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name} - {voice.description}
            </option>
          ))}
        </select>
      </SettingItem>

      {/* Voice Activity Detection */}
      <SettingItem
        label="Voice Detection Sensitivity"
        description="Adjust how sensitive the system is to detecting speech"
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.vadThreshold}
          disabled={isDisabled}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Less Sensitive</span>
          <span>More Sensitive</span>
        </div>
      </SettingItem>

      {/* Silence Duration */}
      <SettingItem
        label="Silence Duration"
        description="How long to wait after speech ends before processing"
      >
        <input
          type="range"
          min={SESSION_CONFIG.MIN_SILENCE_DURATION}
          max={SESSION_CONFIG.MAX_SILENCE_DURATION}
          step={100}
          value={config.silenceDuration}
          disabled={isDisabled}
          className="w-full"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {config.silenceDuration}ms
        </div>
      </SettingItem>

      {/* Advanced Settings Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-4 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 focus:outline-none"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="mt-4 space-y-4">
          {/* Session Duration */}
          <SettingItem
            label="Maximum Session Duration"
            description="Maximum allowed time for the entire session"
          >
            <select
              className="w-full mt-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              value={config.maxSessionDuration}
              disabled={isDisabled}
            >
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
              <option value={240}>4 hours</option>
              <option value={300}>5 hours</option>
            </select>
          </SettingItem>

          {/* Break Duration */}
          <SettingItem
            label="Default Break Duration"
            description="Length of breaks between major sections"
          >
            <select
              className="w-full mt-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              value={config.breakDuration / 60000} // Convert from ms to minutes
              disabled={isDisabled}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
            </select>
          </SettingItem>

          {/* Debug Mode */}
          <SettingItem
            label="Debug Mode"
            description="Show additional debugging information"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={SESSION_CONFIG.getRuntimeConfig().debugMode}
                disabled={isDisabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Enable debug information
              </span>
            </div>
          </SettingItem>
        </div>
      )}

      {/* Warning when session is active */}
      {isDisabled && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Settings cannot be changed while a session is active. End the current session to modify settings.
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionSettings;
