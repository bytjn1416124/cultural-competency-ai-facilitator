import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';
import GradientAnimation from '@/components/animations/GradientAnimation';
import StrawberryAnimation from '@/components/animations/StrawberryAnimation';

interface SessionLayoutProps {
  children: React.ReactNode;
}

const SessionLayout: React.FC<SessionLayoutProps> = ({ children }) => {
  const { state, controls, progress } = useSession();
  const [selectedAnimation, setSelectedAnimation] = React.useState<'gradient' | 'strawberry'>('gradient');

  // Current section information
  const currentSection = SESSION_CONFIG.SECTIONS[progress.currentSectionIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cultural Competency Facilitator
            </h1>
            
            {/* Session Controls */}
            <div className="flex items-center space-x-4">
              {!state.isActive ? (
                <button
                  onClick={controls.startSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Session
                </button>
              ) : (
                <>
                  {state.isPaused ? (
                    <button
                      onClick={controls.resumeSession}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={controls.pauseSession}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    onClick={controls.endSession}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    End Session
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Animation and Controls */}
          <div className="flex flex-col items-center justify-start space-y-8">
            {/* Animation Container */}
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
              {selectedAnimation === 'gradient' ? (
                <GradientAnimation 
                  frequency={state.frequency} 
                  isLoading={false} 
                />
              ) : (
                <StrawberryAnimation 
                  frequency={state.frequency} 
                  isLoading={false}
                  isPlayingAudio={state.isSpeaking} 
                />
              )}
            </div>

            {/* Animation Selection */}
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedAnimation('gradient')}
                className={`px-4 py-2 rounded-lg ${
                  selectedAnimation === 'gradient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } transition-colors`}
              >
                Gradient
              </button>
              <button
                onClick={() => setSelectedAnimation('strawberry')}
                className={`px-4 py-2 rounded-lg ${
                  selectedAnimation === 'strawberry'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } transition-colors`}
              >
                Strawberry
              </button>
            </div>
          </div>

          {/* Right Column - Session Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {/* Section Header */}
            {currentSection && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {currentSection.title}
                </h2>
                <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progress.currentSectionIndex / SESSION_CONFIG.SECTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Session Content */}
            <div className="space-y-4">
              {children}
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
                {state.error}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              {state.isActive && (
                <span>
                  Section {progress.currentSectionIndex + 1} of {SESSION_CONFIG.SECTIONS.length}
                </span>
              )}
            </div>
            <div>
              {state.isSpeaking && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Speaking
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionLayout;
