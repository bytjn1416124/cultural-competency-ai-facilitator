import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';
import GradientAnimation from './GradientAnimation';
import StrawberryAnimation from './StrawberryAnimation';

interface AnimationControllerProps {
  defaultAnimation?: 'gradient' | 'strawberry';
  className?: string;
}

const AnimationController: React.FC<AnimationControllerProps> = ({
  defaultAnimation = 'gradient',
  className = '',
}) => {
  const { state } = useSession();
  const [currentAnimation, setCurrentAnimation] = useState(defaultAnimation);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Smooth frequency transitions
  const [smoothFrequency, setSmoothFrequency] = useState(0);
  
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setSmoothFrequency(prev => {
        const diff = state.frequency - prev;
        const delta = diff * 0.1; // Smoothing factor
        const newValue = prev + delta;
        
        if (Math.abs(diff) < 0.1) return state.frequency;
        
        animationFrame = requestAnimationFrame(animate);
        return newValue;
      });
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [state.frequency]);

  // Handle animation transitions
  const handleAnimationChange = useCallback((animation: 'gradient' | 'strawberry') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentAnimation(animation);
      setIsTransitioning(false);
    }, 300); // Match the CSS transition duration
  }, []);

  // Calculate animation properties
  const size = SESSION_CONFIG.ANIMATION.DEFAULT_SIZE + (smoothFrequency / 2);
  const pulseSpeed = Math.max(
    SESSION_CONFIG.ANIMATION.MIN_PULSE_SPEED,
    SESSION_CONFIG.ANIMATION.MAX_PULSE_SPEED - (smoothFrequency / 100)
  );

  return (
    <div className={`relative ${className}`}>
      {/* Animation Container */}
      <div
        className={`transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentAnimation === 'gradient' ? (
          <GradientAnimation
            frequency={smoothFrequency}
            isLoading={state.isLoading}
          />
        ) : (
          <StrawberryAnimation
            frequency={smoothFrequency}
            isLoading={state.isLoading}
            isPlayingAudio={state.isSpeaking}
          />
        )}
      </div>

      {/* Animation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          onClick={() => handleAnimationChange('gradient')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentAnimation === 'gradient'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          disabled={isTransitioning}
        >
          Gradient
        </button>
        <button
          onClick={() => handleAnimationChange('strawberry')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentAnimation === 'strawberry'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          disabled={isTransitioning}
        >
          Strawberry
        </button>
      </div>

      {/* Voice Activity Indicator */}
      {state.isSpeaking && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 text-white px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm">Speaking</span>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs p-2 rounded">
          <div>Frequency: {Math.round(smoothFrequency)}</div>
          <div>Size: {Math.round(size)}px</div>
          <div>Pulse: {pulseSpeed.toFixed(2)}s</div>
        </div>
      )}
    </div>
  );
};

export default AnimationController;
