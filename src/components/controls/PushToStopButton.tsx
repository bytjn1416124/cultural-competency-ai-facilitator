import React from 'react';
import { useConversationFlow } from '@/hooks/useConversationFlow';

const PushToStopButton: React.FC = () => {
  const { isSessionActive, startSession, endSession } = useConversationFlow();

  return (
    <div className="relative">
      <button
        onClick={isSessionActive ? endSession : startSession}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          transition-all duration-300
          ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
        `}
      >
        <div className="absolute inset-0 rounded-full border-2 border-white opacity-20" />
        {isSessionActive ? (
          <div className="w-6 h-6 rounded bg-white" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white" />
        )}
      </button>
      <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm text-gray-300">
        {isSessionActive ? 'Hold space to stop' : 'Hold space to talk'}
      </span>

      {/* Pulse Animation */}
      {isSessionActive && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default PushToStopButton;
