import React, { useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { SESSION_CONFIG } from '@/constants/config';

interface Message {
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

const ContentDisplay: React.FC = () => {
  const { state, progress } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);

  // Get current section and exercise information
  const currentSection = SESSION_CONFIG.SECTIONS[Object.keys(SESSION_CONFIG.SECTIONS)[progress.currentSectionIndex]];
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add new messages when responses or transcriptions change
  useEffect(() => {
    if (state.lastResponse) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: state.lastResponse,
        timestamp: Date.now()
      }]);
    }
  }, [state.lastResponse]);

  useEffect(() => {
    if (state.transcription) {
      setMessages(prev => [...prev, {
        type: 'user',
        content: state.transcription,
        timestamp: Date.now()
      }]);
    }
  }, [state.transcription]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentSection.title}
        </h2>
        {currentSection.duration && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Duration: {Math.round(currentSection.duration / 60000)} minutes
          </p>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.timestamp}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3/4 rounded-lg p-4 ${message.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-2 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-b-lg">
        <div className="flex justify-between items-center text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            {state.isSpeaking ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Listening...
              </span>
            ) : (
              'Ready'
            )}
          </div>
          {state.error && (
            <div className="text-red-500">
              {state.error}
            </div>
          )}
        </div>
      </div>

      {/* Exercise Instructions */}
      {currentSection.exercises && currentSection.exercises[progress.currentExerciseIndex] && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Current Exercise
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            {currentSection.exercises[progress.currentExerciseIndex].description}
          </p>
          <div className="mt-2 space-y-1">
            {currentSection.exercises[progress.currentExerciseIndex].steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${index === progress.currentStepIndex ? 'text-blue-600 dark:text-blue-400' : 'text-blue-800/70 dark:text-blue-200/70'}`}
              >
                <span className="font-medium">{index + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
