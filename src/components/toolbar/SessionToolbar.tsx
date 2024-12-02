import React from 'react';
import { useSession } from '@/contexts/SessionContext';

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const SessionToolbar: React.FC = () => {
  const { state, controls } = useSession();

  const buttons: ToolbarButton[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {state.isActive ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M10 9v6m4-6v6m-7-3h10" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          )}
        </svg>
      ),
      label: state.isActive ? 'End Session' : 'Start Session',
      onClick: state.isActive ? controls.endSession : controls.startSession,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {state.isPaused ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          )}
        </svg>
      ),
      label: state.isPaused ? 'Resume' : 'Pause',
      onClick: state.isPaused ? controls.resumeSession : controls.pauseSession,
      disabled: !state.isActive,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      ),
      label: 'Next Step',
      onClick: controls.moveToNextStep,
      disabled: !state.isActive,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'Next Exercise',
      onClick: controls.moveToNextExercise,
      disabled: !state.isActive,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-2 flex items-center justify-center space-x-2">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={button.disabled}
          className={`
            flex items-center px-3 py-2 rounded-md transition-colors
            ${button.disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
              : button.isActive
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          {button.icon}
          <span className="ml-2 text-sm font-medium">{button.label}</span>
        </button>
      ))}

      {/* Voice Activity Indicator */}
      {state.isSpeaking && (
        <div className="flex items-center px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          <span className="text-sm">Speaking</span>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="flex items-center px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{state.error}</span>
        </div>
      )}
    </div>
  );
};

export default SessionToolbar;
