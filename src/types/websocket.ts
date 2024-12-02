// OpenAI Realtime API Event Types

export interface BaseEvent {
  event_id: string;
  type: string;
}

// Client Events
export interface SessionUpdateEvent extends BaseEvent {
  type: 'session.update';
  session: {
    modalities: ('text' | 'audio')[];
    instructions?: string;
    voice: string;
    input_audio_format: 'pcm16';
    output_audio_format: 'pcm16';
    input_audio_transcription?: {
      model: string;
    };
    turn_detection?: {
      type: 'server_vad';
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    };
    tools?: Tool[];
    tool_choice?: 'auto' | 'none';
    temperature?: number;
    max_response_output_tokens?: number | 'inf';
  };
}

export interface AudioBufferAppendEvent extends BaseEvent {
  type: 'input_audio_buffer.append';
  audio: string; // base64 encoded audio
}

export interface AudioBufferCommitEvent extends BaseEvent {
  type: 'input_audio_buffer.commit';
}

export interface AudioBufferClearEvent extends BaseEvent {
  type: 'input_audio_buffer.clear';
}

export interface ConversationItemCreateEvent extends BaseEvent {
  type: 'conversation.item.create';
  previous_item_id: string | null;
  item: {
    id: string;
    type: 'message';
    role: 'user' | 'assistant';
    content: Array<{
      type: 'input_text' | 'text';
      text: string;
    }>;
  };
}

// Server Events
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: {
    type: string;
    code: string;
    message: string;
    param: string | null;
    event_id?: string;
  };
}

export interface SessionCreatedEvent extends BaseEvent {
  type: 'session.created';
  session: {
    id: string;
    object: 'realtime.session';
    model: string;
    modalities: string[];
    instructions: string;
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    input_audio_transcription: null | {
      model: string;
    };
    turn_detection: null | {
      type: 'server_vad';
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    };
    tools: Tool[];
    tool_choice: string;
    temperature: number;
    max_response_output_tokens: number | null;
  };
}

export interface AudioTranscriptionCompletedEvent extends BaseEvent {
  type: 'conversation.item.input_audio_transcription.completed';
  item_id: string;
  content_index: number;
  transcript: string;
}

export interface SpeechStartedEvent extends BaseEvent {
  type: 'input_audio_buffer.speech_started';
  audio_start_ms: number;
  item_id: string;
}

export interface SpeechStoppedEvent extends BaseEvent {
  type: 'input_audio_buffer.speech_stopped';
  audio_end_ms: number;
  item_id: string;
}

export interface ResponseTextDeltaEvent extends BaseEvent {
  type: 'response.text.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

export interface ResponseAudioDeltaEvent extends BaseEvent {
  type: 'response.audio.delta';
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string; // base64 encoded audio
}

export interface Tool {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Utility type for all possible events
export type WebSocketEvent =
  | SessionUpdateEvent
  | AudioBufferAppendEvent
  | AudioBufferCommitEvent
  | AudioBufferClearEvent
  | ConversationItemCreateEvent
  | ErrorEvent
  | SessionCreatedEvent
  | AudioTranscriptionCompletedEvent
  | SpeechStartedEvent
  | SpeechStoppedEvent
  | ResponseTextDeltaEvent
  | ResponseAudioDeltaEvent;

// Event handler types
export type WebSocketEventHandler = (event: WebSocketEvent) => void;
export type WebSocketErrorHandler = (error: ErrorEvent) => void;
