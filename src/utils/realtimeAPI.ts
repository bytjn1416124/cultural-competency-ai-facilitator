interface RealtimeAPIConfig {
  apiKey: string;
  voice: string;
  modalities: string[];
  instructions?: string;
}

type MessageHandler = (message: any) => void;
type ErrorHandler = (error: any) => void;

export class RealtimeAPI {
  private ws: WebSocket | null = null;
  private messageHandler: MessageHandler;
  private errorHandler: ErrorHandler;
  private config: RealtimeAPIConfig;

  constructor(
    config: RealtimeAPIConfig,
    messageHandler: MessageHandler,
    errorHandler: ErrorHandler
  ) {
    this.config = config;
    this.messageHandler = messageHandler;
    this.errorHandler = errorHandler;
  }

  connect = async () => {
    try {
      // Initialize WebSocket connection to OpenAI's Realtime API
      this.ws = new WebSocket('wss://api.openai.com/v1/audio/realtime');

      this.ws.onopen = () => {
        // Send initial session configuration
        this.sendEvent({
          type: 'session.update',
          session: {
            modalities: this.config.modalities,
            voice: this.config.voice,
            instructions: this.config.instructions || '',
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        });
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.messageHandler(data);
      };

      this.ws.onerror = (error) => {
        this.errorHandler(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      this.errorHandler(error);
    }
  };

  disconnect = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  };

  sendEvent = (event: any) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('WebSocket not connected');
    }
  };

  sendAudioChunk = (audioData: ArrayBuffer) => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioData)));
      
      this.sendEvent({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      });
    }
  };

  // Cultural competency session-specific methods
  startSession = () => {
    if (!this.ws) return;
    
    const instructions = `
      You are a cultural competency facilitator leading an interactive session.
      Follow these guidelines:
      1. Guide participants through the cultural competency workbook sections
      2. Ask open-ended questions to encourage discussion
      3. Listen actively and provide constructive feedback
      4. Maintain a respectful and inclusive environment
      5. Adapt your pace based on participant responses
      6. Use clear, concise language
      Your goal is to help participants develop cultural awareness and competency skills.
    `;

    this.sendEvent({
      type: 'session.update',
      session: {
        ...this.config,
        instructions,
      },
    });
  };

  handleParticipantResponse = (responseText: string) => {
    // Create a conversation item from the participant's response
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'text',
          text: responseText,
        }],
      },
    });

    // Trigger AI response
    this.sendEvent({
      type: 'response.create',
    });
  };
}
