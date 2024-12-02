import React from 'react';

interface AudioIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  frequency: number;
}

export const AudioIndicator: React.FC<AudioIndicatorProps> = ({
  isListening,
  isSpeaking,
  frequency
}) => {
  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
      {/* Status Text */}
      <div className="text-white text-sm font-medium">
        {isListening ? 'Listening...' : isSpeaking ? 'AI Speaking...' : 'Press Space to Talk'}
      </div>

      {/* Audio Level Indicator */}
      {(isListening || isSpeaking) && (
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ${isListening ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${frequency}%` }}
          />
        </div>
      )}

      {/* Record Button */}
      <div 
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500 scale-110' : 'bg-gray-700'}`}
      >
        <div 
          className={`w-4 h-4 rounded-full ${isListening ? 'bg-white' : 'bg-red-500'} ${isListening ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
};
