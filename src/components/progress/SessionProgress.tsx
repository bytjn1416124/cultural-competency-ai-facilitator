import React from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';

interface ProgressStepProps {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  duration: number;
  onClick?: () => void;
}

const ProgressStep: React.FC<ProgressStepProps> = ({
  label,
  isCompleted,
  isCurrent,
  duration,
  onClick
}) => (
  <div
    className={`relative flex flex-col items-center cursor-pointer group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    onClick={onClick}
  >
    <div
      className={`
        w-8 h-8 rounded-full flex items-center justify-center
        ${isCompleted
          ? 'bg-green-500 text-white'
          : isCurrent
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }
      `}
    >
      {isCompleted ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <span className="text-sm">{label.charAt(0)}</span>
      )}
    </div>
    <div className="mt-2 text-xs text-center">
      <div className={`font-medium ${isCurrent ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
      </div>
      <div className="text-gray-400 dark:text-gray-500">
        {Math.round(duration / 60000)}m
      </div>
    </div>
  </div>
);

const SessionProgress: React.FC = () => {
  const { progress, state, controls } = useSession();

  // Calculate total session duration and elapsed time
  const totalDuration = Object.values(SESSION_CONFIG.SECTIONS).reduce(
    (acc, section) => acc + section.duration,
    0
  );
  
  const elapsedPercentage = (progress.timeElapsed / totalDuration) * 100;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Session Progress</span>
          <span>{Math.round(elapsedPercentage)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${elapsedPercentage}%` }}
          />
        </div>
      </div>

      {/* Section Progress Steps */}
      <div className="flex justify-between items-center relative">
        {/* Connecting Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Progress Steps */}
        {Object.entries(SESSION_CONFIG.SECTIONS).map(([key, section], index) => (
          <ProgressStep
            key={key}
            label={section.title}
            duration={section.duration}
            isCompleted={index < progress.currentSectionIndex}
            isCurrent={index === progress.currentSectionIndex}
            onClick={
              state.isActive && index < progress.currentSectionIndex
                ? () => controls.moveToNextSection()
                : undefined
            }
          />
        ))}
      </div>

      {/* Current Section Details */}
      {state.isActive && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Current Section: {SESSION_CONFIG.SECTIONS[Object.keys(SESSION_CONFIG.SECTIONS)[progress.currentSectionIndex]].title}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Exercise:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {progress.currentExerciseIndex + 1} of {progress.totalExercisesInSection}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Step:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {progress.currentStepIndex + 1} of {progress.totalStepsInExercise}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionProgress;
