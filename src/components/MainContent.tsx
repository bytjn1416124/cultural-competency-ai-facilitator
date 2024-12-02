"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import GradientAnimation from './animations/GradientAnimation';
import StrawberryAnimation from './animations/StrawberryAnimation';
import { AudioIndicator } from './AudioIndicator';
import { TranscriptDisplay } from './TranscriptDisplay';
import { useRealtimeApi } from '@/hooks/useRealtimeApi';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export default function MainContent() {
  const [animationType, setAnimationType] = useState<'gradient' | 'strawberry'>('gradient');
  const { state, controls } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { startRealtimeSession, stopRealtimeSession, isConnected } = useRealtimeApi({
    onTranscript: (text) => {
      setMessages(prev => [...prev, { type: 'user', text, timestamp: Date.now() }]);
    },
    onResponse: (text) => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'ai', text, timestamp: Date.now() }]);
    },
    onTyping: () => setIsTyping(true),
  });

  const handleStartSession = async () => {
    try {
      await startRealtimeSession();
      controls.startSession();
      setMessages([{
        type: 'ai',
        text: 'Hello! I\'m your cultural competency facilitator. I\'ll guide you through the session. Hold the space bar when you want to speak.',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleEndSession = () => {
    stopRealtimeSession();
    controls.endSession();
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Cultural Competency AI Facilitator</h1>
            <p className="text-gray-400">Interactive AI-powered facilitator for cultural competency sessions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
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
      <div className="flex flex-col items-center justify-center min-h-screen py-20">
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

        {/* Audio Indicator */}
        <AudioIndicator
          isListening={state.isListening}
          isSpeaking={state.isSpeaking}
          frequency={state.frequency}
        />

        {/* Session Control */}
        <button
          onClick={state.isActive ? handleEndSession : handleStartSession}
          className={`
            fixed bottom-8 left-1/2 transform -translate-x-1/2
            px-6 py-3 rounded-full font-medium transition-colors
            ${state.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
          `}
        >
          {state.isActive ? 'End Session' : 'Start Session'}
        </button>

        {/* Transcript Display */}
        <TranscriptDisplay messages={messages} isTyping={isTyping} />

        {/* Error Display */}
        {state.error && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}
