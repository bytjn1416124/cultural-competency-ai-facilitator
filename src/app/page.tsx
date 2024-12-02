"use client";

import { useState, useEffect } from 'react';
import GradientAnimation from '@/components/animations/GradientAnimation';
import StrawberryAnimation from '@/components/animations/StrawberryAnimation';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState<'gradient' | 'strawberry'>('gradient');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Function to handle starting/stopping voice input
  const toggleListening = async () => {
    if (!isListening) {
      try {
        setIsListening(true);
        // Initialize WebSocket connection here
      } catch (error) {
        console.error('Error starting voice input:', error);
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      // Close WebSocket connection here
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
          Cultural Competency AI Facilitator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Interactive AI-powered facilitator for cultural competency sessions
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          {selectedAnimation === 'gradient' ? (
            <GradientAnimation frequency={frequency} isLoading={isLoading} />
          ) : (
            <StrawberryAnimation 
              frequency={frequency} 
              isLoading={isLoading} 
              isPlayingAudio={isSpeaking} 
            />
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedAnimation('gradient')}
            className={`px-4 py-2 rounded-lg ${
              selectedAnimation === 'gradient'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Gradient
          </button>
          <button
            onClick={() => setSelectedAnimation('strawberry')}
            className={`px-4 py-2 rounded-lg ${
              selectedAnimation === 'strawberry'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Strawberry
          </button>
        </div>

        <button
          onClick={toggleListening}
          className={`px-6 py-3 rounded-full text-white font-semibold ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          {isListening ? 'Stop' : 'Start'} Session
        </button>
      </div>
    </div>
  );
}
