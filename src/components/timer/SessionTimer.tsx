import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';

interface TimerDisplayProps {
  label: string;
  time: number;
  warning?: boolean;
  danger?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ label, time, warning, danger }) => {
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span 
        className={`text-lg font-mono font-bold ${
          danger
            ? 'text-red-500 dark:text-red-400'
            : warning
            ? 'text-yellow-500 dark:text-yellow-400'
            : 'text-gray-700 dark:text-gray-200'
        }`}
      >
        {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
      </span>
    </div>
  );
};

const SessionTimer: React.FC = () => {
  const { state, progress } = useSession();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sectionTime, setSectionTime] = useState(0);

  // Get current section duration
  const currentSection = SESSION_CONFIG.SECTIONS[Object.keys(SESSION_CONFIG.SECTIONS)[progress.currentSectionIndex]];
  const sectionDuration = currentSection?.duration || 0;

  // Update timers
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.isActive && !state.isPaused) {
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1000);
        setSectionTime(prev => prev + 1000);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state.isActive, state.isPaused]);

  // Reset section timer when section changes
  useEffect(() => {
    setSectionTime(0);
  }, [progress.currentSectionIndex]);

  // Calculate remaining time and warning thresholds
  const totalDuration = SESSION_CONFIG.MAX_SESSION_DURATION * 60 * 1000;
  const remainingTotal = Math.max(0, totalDuration - elapsedTime);
  const remainingSection = Math.max(0, sectionDuration - sectionTime);

  // Warning thresholds
  const isSessionWarning = remainingTotal < totalDuration * 0.2;
  const isSessionDanger = remainingTotal < totalDuration * 0.1;
  const isSectionWarning = remainingSection < sectionDuration * 0.2;
  const isSectionDanger = remainingSection < sectionDuration * 0.1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-around items-center">
        <TimerDisplay
          label="Total Time"
          time={elapsedTime}
        />
        <TimerDisplay
          label="Remaining"
          time={remainingTotal}
          warning={isSessionWarning}
          danger={isSessionDanger}
        />
        <TimerDisplay
          label="Section Time"
          time={sectionTime}
        />
        <TimerDisplay
          label="Section Remaining"
          time={remainingSection}
          warning={isSectionWarning}
          danger={isSectionDanger}
        />
      </div>

      {/* Warning Messages */}
      {(isSessionDanger || isSectionDanger) && (
        <div className="mt-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm rounded">
          {isSessionDanger && <p>Session time is almost up!</p>}
          {isSectionDanger && <p>Section time is almost up!</p>}
        </div>
      )}
    </div>
  );
};

export default SessionTimer;
