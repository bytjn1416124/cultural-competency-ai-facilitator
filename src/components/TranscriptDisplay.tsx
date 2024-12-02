import React from 'react';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface TranscriptDisplayProps {
  messages: Message[];
  isTyping?: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ messages, isTyping }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed right-4 top-24 w-80 max-h-[60vh] bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-medium">Conversation</h3>
      </div>
      <div className="p-4 max-h-[calc(60vh-4rem)] overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100'}`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
