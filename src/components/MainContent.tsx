"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { useAudioProcessing } from '@/hooks/useAudioProcessing';
import GradientAnimation from './animations/GradientAnimation';
import StrawberryAnimation from './animations/StrawberryAnimation';

export default function MainContent() {
  const [animationType, setAnimationType] = useState<'gradient' | 'strawberry'>('gradient');
  const { state, controls } = useSession();
  const [status, setStatus] = useState<string>('');

  const { startProcessing, stopProcessing } = useAudioProcessing({
    onSpeechDetected: () => {
      setStatus('Speech detected');
    },
    onSpeechEnded: () => {
      setStatus('Speech ended');
    },
    onError: (error) => {
      setStatus(`Error: ${error.message}`);
    }
  });

  const handleStartSession = async () => {
    try {
      setStatus('Starting session...');
      await startProcessing();
      await controls.startSession();
      setStatus('Session active - Hold space to talk');
    } catch (error) {
      setStatus(`Failed to start session: ${error}`);
    }
  };

  const handleEndSession = () => {
    stopProcessing();
    controls.endSession();
    setStatus('Session ended');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4">
        <h1 className="text-2xl font-bold">Cultural Competency AI Facilitator</h1>
        <p className="text-gray-400">Interactive AI-powered facilitator for cultural competency sessions</p>
      </header>

      {/* Animation Controls */}
      <div className="fixed top-24 left-4 flex gap-2">
        <button
          onClick={() => setAnimationType('gradient')}
          className={`px-4 py-2 rounded-lg ${animationType === 'gradient' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Gradient
        </button>
        <button
          onClick={() => setAnimationType('strawberry')}
          className={`px-4 py-2 rounded-lg ${animationType === 'strawberry' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Strawberry
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* Animation */}
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {animationType === 'gradient' ? (
            <GradientAnimation frequency={state.frequency} isLoading={false} />
          ) : (
            <StrawberryAnimation
              frequency={state.frequency}
              isLoading={false}
              isPlayingAudio={state.isSpeaking}
            />
          )}
        </div>

        {/* Status and Controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="text-sm text-gray-400">{status}</div>
          
          <button
            onClick={state.isActive ? handleEndSession : handleStartSession}
            className={`
              px-6 py-3 rounded-full font-medium transition-colors
              ${state.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
            `}
          >
            {state.isActive ? 'End Session' : 'Start Session'}
          </button>

          {state.error && (
            <div className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
              {state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
