interface VADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVADMissingError?: () => void;
  threshold?: number;
  silenceDuration?: number;
}

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening = false;
  private silenceStart: number | null = null;
  private options: Required<VADOptions>;
  private animationFrameId: number | null = null;

  constructor(options: VADOptions = {}) {
    this.options = {
      onSpeechStart: options.onSpeechStart || (() => {}),
      onSpeechEnd: options.onSpeechEnd || (() => {}),
      onVADMissingError: options.onVADMissingError || (() => {}),
      threshold: options.threshold || 0.2,
      silenceDuration: options.silenceDuration || 500,
    };
  }

  public async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Initialize audio context and analyzer
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      // Connect audio nodes
      source.connect(this.analyser);

      // Initialize data array for frequency analysis
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // Start voice detection loop
      this.isListening = true;
      this.detectVoice();

      // Initialize MediaRecorder for audio capture
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: 'audio/webm',
      });

      // Handle recorded audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Convert blob to array buffer for processing
          event.data.arrayBuffer().then((buffer) => {
            // Process the audio data (send to OpenAI Realtime API)
            this.processAudioData(buffer);
          });
        }
      };

      this.mediaRecorder.start(100); // Capture audio in 100ms chunks

    } catch (error) {
      console.error('Error initializing VAD:', error);
      this.options.onVADMissingError();
    }
  }

  public stop(): void {
    this.isListening = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
  }

  private detectVoice = (): void => {
    if (!this.isListening || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average frequency intensity
    const average = this.dataArray.reduce((acc, value) => acc + value, 0) / this.dataArray.length;
    const normalizedAverage = average / 255; // Normalize to 0-1 range

    // Check if voice is detected based on threshold
    if (normalizedAverage > this.options.threshold) {
      if (this.silenceStart !== null) {
        this.silenceStart = null;
        this.options.onSpeechStart();
      }
    } else if (this.silenceStart === null) {
      this.silenceStart = Date.now();
    } else if (Date.now() - this.silenceStart > this.options.silenceDuration) {
      this.options.onSpeechEnd();
      this.silenceStart = null;
    }

    // Continue detection loop
    this.animationFrameId = requestAnimationFrame(this.detectVoice);
  };

  private async processAudioData(buffer: ArrayBuffer): Promise<void> {
    // Convert audio to correct format for OpenAI Realtime API (PCM 16-bit)
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    
    // Convert to PCM 16-bit
    const pcmBuffer = this.convertToPCM16(audioBuffer);
    
    // Emit the processed audio data for sending to OpenAI
    this.emitProcessedAudio(pcmBuffer);
  }

  private convertToPCM16(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const pcmData = new Int16Array(length * numChannels);
    
    // Get audio data from all channels
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      
      // Convert float32 to int16
      for (let i = 0; i < length; i++) {
        const index = i * numChannels + channel;
        // Scale to int16 range and clip
        pcmData[index] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
      }
    }
    
    return pcmData.buffer;
  }

  private emitProcessedAudio(buffer: ArrayBuffer): void {
    // Dispatch custom event with processed audio
    const event = new CustomEvent('processedAudio', {
      detail: { buffer }
    });
    window.dispatchEvent(event);
  }
}
