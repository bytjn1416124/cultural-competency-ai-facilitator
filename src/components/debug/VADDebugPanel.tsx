import React from 'react';
import { SESSION_CONFIG } from '@/constants/config';
import { useConversationFlow } from '@/hooks/useConversationFlow';

interface AudioMetrics {
  currentEnergy: number;
  averageEnergy: number;
  peakEnergy: number;
  speechProbability: number;
}

const VADDebugPanel: React.FC = () => {
  const { frequency, isSpeaking } = useConversationFlow();
  const [metrics, setMetrics] = React.useState<AudioMetrics>({
    currentEnergy: 0,
    averageEnergy: 0,
    peakEnergy: 0,
    speechProbability: 0
  });

  // Only render in development mode and when debug is enabled
  if (process.env.NODE_ENV !== 'development' || !SESSION_CONFIG.DEBUG.SHOW_VAD_METRICS) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm font-mono">
      <h3 className="text-xs uppercase mb-2">VAD Debug</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Energy:</span>
          <span>{metrics.currentEnergy.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Energy:</span>
          <span>{metrics.averageEnergy.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Peak:</span>
          <span>{metrics.peakEnergy.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Speech Prob:</span>
          <span>{metrics.speechProbability.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frequency:</span>
          <span>{frequency.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Speaking:</span>
          <span className={isSpeaking ? 'text-green-400' : 'text-red-400'}>
            {isSpeaking ? 'YES' : 'NO'}
          </span>
        </div>
      </div>

      {/* Energy Visualizer */}
      <div className="mt-2 h-20 border border-gray-700 relative">
        <div 
          className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-100"
          style={{ height: `${(metrics.currentEnergy / metrics.peakEnergy) * 100}%` }}
        />
        <div 
          className="absolute w-full border-t border-yellow-500"
          style={{ bottom: `${(SESSION_CONFIG.VAD.ENERGY_THRESHOLD / metrics.peakEnergy) * 100}%` }}
        />
      </div>

      {/* Settings Adjusters */}
      <div className="mt-4 space-y-2">
        <div>
          <label className="text-xs">VAD Threshold</label>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={SESSION_CONFIG.VAD.DEFAULT_THRESHOLD}
            onChange={(e) => {
              // Update threshold in real-time for testing
              SESSION_CONFIG.VAD.DEFAULT_THRESHOLD = parseFloat(e.target.value);
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-xs">Silence Duration (ms)</label>
          <input 
            type="range"
            min={SESSION_CONFIG.VAD.MIN_SILENCE_DURATION}
            max={SESSION_CONFIG.VAD.MAX_SILENCE_DURATION}
            step="50"
            value={SESSION_CONFIG.VAD.DEFAULT_SILENCE_DURATION}
            onChange={(e) => {
              // Update silence duration in real-time for testing
              SESSION_CONFIG.VAD.DEFAULT_SILENCE_DURATION = parseInt(e.target.value);
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default VADDebugPanel;
