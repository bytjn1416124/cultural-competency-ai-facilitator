"use client";

import React from 'react';
import { useConversationFlow } from '@/hooks/useConversationFlow';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import GradientAnimation from '@/components/animations/GradientAnimation';
import StrawberryAnimation from '@/components/animations/StrawberryAnimation';

export default function Home() {
  const [animationType, setAnimationType] = React.useState<'gradient' | 'strawberry'>('gradient');
  const { startSession, endSession, isSessionActive, frequency, isSpeaking } = useConversationFlow();

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cultural Competency AI Facilitator
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Interactive AI-powered facilitator for cultural competency sessions
        </p>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-4 space-y-8">
        {/* Animation Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setAnimationType('gradient')}
            className={`px-4 py-2 rounded-lg transition-colors ${animationType === 'gradient' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Gradient
          </button>
          <button
            onClick={() => setAnimationType('strawberry')}
            className={`px-4 py-2 rounded-lg transition-colors ${animationType === 'strawberry' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Strawberry
          </button>
        </div>

        {/* Animation Display */}
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {animationType === 'gradient' ? (
            <GradientAnimation frequency={frequency} isLoading={false} />
          ) : (
            <StrawberryAnimation
              frequency={frequency}
              isLoading={false}
              isPlayingAudio={isSpeaking}
            />
          )}
        </div>

        {/* Session Control */}
        <button
          onClick={isSessionActive ? endSession : startSession}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${isSessionActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          {isSessionActive ? 'Stop Session' : 'Start Session'}
        </button>
      </div>
    </main>
  );
}
