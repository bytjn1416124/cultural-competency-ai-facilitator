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

  // Connect to WebSocket
  public async connect(): Promise<void> {
    try {
      // For development, we'll just simulate the connection
      if (process.env.NODE_ENV === 'development' && !this.config.apiKey.includes('sk-')) {
        console.log('Development mode: Simulating WebSocket connection');
        return;
      }

      this.ws = new WebSocket('wss://api.openai.com/v1/audio/realtime');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.initializeSession();
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.config.onError?.(error as Error);
      };

      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.config.onError?.(error as Error);
    }
  }

  // Initialize session
  private initializeSession(): void {
    if (!this.ws) return;

    const message = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        voice: this.config.voice,
      }
    };

    this.sendMessage(message);
  }

  // Handle incoming messages
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      switch (data.type) {
        case 'error':
          this.config.onError?.(new Error(data.error.message));
          break;

        case 'response.completed':
          this.config.onMessageComplete?.();
          break;

        case 'speech.start':
          this.isSpeaking = true;
          break;

        case 'speech.end':
          this.isSpeaking = false;
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.config.onError?.(error as Error);
    }
  }

  // Send message to WebSocket
  private sendMessage(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
      this.config.onError?.(error as Error);
    }
  }

  // Process audio data
  public async processAudio(audioData: ArrayBuffer): Promise<void> {
    if (process.env.NODE_ENV === 'development' && !this.config.apiKey.includes('sk-')) {
      // Simulate processing in development
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

      const message = {
        type: 'audio',
        data: Buffer.from(chunk).toString('base64')
      };

      this.sendMessage(message);
      await new Promise(resolve => setTimeout(resolve, 50)); // Rate limiting
    }

    this.isProcessing = false;
  }

  // Stop speaking
  public stopSpeaking(): void {
    if (this.isSpeaking) {
      this.sendMessage({ type: 'stop' });
      this.config.onInterruption?.();
    }
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.audioBuffer = [];
    this.isProcessing = false;
    this.isSpeaking = false;
    this.lastMessageId = null;
  }
}
