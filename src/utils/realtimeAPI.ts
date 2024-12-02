import { WebSocketEvent } from '@/types/websocket';
import { SESSION_CONFIG } from '@/constants/config';

interface RealtimeAPIConfig {
  apiKey: string;
  voice: string;
  onInterruption?: () => void;
  onMessageComplete?: () => void;
  onError?: (error: Error) => void;
}

export class RealtimeAPI {
  private ws: WebSocket | null = null;
  private audioBuffer: ArrayBuffer[] = [];
  private isProcessing: boolean = false;
  private isSpeaking: boolean = false;
  private lastMessageId: string | null = null;
  private config: RealtimeAPIConfig;

  constructor(config: RealtimeAPIConfig) {
    this.config = config;
  }

  // Connect to OpenAI's Realtime API
  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(SESSION_CONFIG.WEBSOCKET.URL);
      
      this.ws.onopen = () => {
        this.initializeSession();
      };

      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Initialize session with OpenAI
  private initializeSession(): void {
    if (!this.ws) return;

    const sessionConfig = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        voice: this.config.voice,
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: {
          type: 'server_vad',
          threshold: SESSION_CONFIG.DEFAULT_VAD_THRESHOLD,
          prefix_padding_ms: SESSION_CONFIG.PREFIX_PADDING,
          silence_duration_ms: SESSION_CONFIG.DEFAULT_SILENCE_DURATION,
        },
      },
    };

    this.sendEvent(sessionConfig);
  }

  // Handle incoming messages
  private handleMessage(event: MessageEvent): void {
    const data = JSON.parse(event.data) as WebSocketEvent;

    switch (data.type) {
      case 'response.text.delta':
        this.isSpeaking = true;
        break;

      case 'response.text.done':
        this.isSpeaking = false;
        this.config.onMessageComplete?.();
        break;

      case 'error':
        this.handleError(new Error(data.error.message));
        break;
    }
  }

  // Handle errors
  private handleError(error: Error): void {
    console.error('RealtimeAPI error:', error);
    this.config.onError?.(error);
  }

  // Handle WebSocket close
  private handleClose(): void {
    this.ws = null;
    this.isProcessing = false;
    this.isSpeaking = false;
  }

  // Send event to OpenAI
  private sendEvent(event: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  // Process audio data
  async processAudioChunk(audioData: ArrayBuffer): Promise<void> {
    if (this.isSpeaking) {
      this.config.onInterruption?.();
      return;
    }

    this.audioBuffer.push(audioData);

    if (!this.isProcessing) {
      this.isProcessing = true;
      await this.processAudioBuffer();
    }
  }

  // Process audio buffer
  private async processAudioBuffer(): Promise<void> {
    while (this.audioBuffer.length > 0) {
      const chunk = this.audioBuffer.shift();
      if (!chunk) continue;

      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(chunk)));
      
      this.sendEvent({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      });

      await new Promise(resolve => setTimeout(resolve, 50)); // Throttle processing
    }

    this.isProcessing = false;
  }

  // Stop current speech
  stopSpeaking(): void {
    if (this.lastMessageId) {
      this.sendEvent({
        type: 'conversation.item.truncate',
        item_id: this.lastMessageId,
        content_index: 0,
      });
    }
    this.isSpeaking = false;
  }

  // Disconnect
  disconnect(): void {
    this.ws?.close();
    this.handleClose();
  }
}
