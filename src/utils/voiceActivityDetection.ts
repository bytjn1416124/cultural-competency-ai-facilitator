interface VADConfig {
  threshold: number;
  silenceDuration: number;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: Error) => void;
}

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  private config: VADConfig;
  private isActive: boolean = false;
  private silenceStart: number | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(config: VADConfig) {
    this.config = config;
  }

  public async start(): Promise<void> {
    if (this.isActive) return;

    try {
      // For development, we'll simulate voice activity
      if (process.env.NODE_ENV === 'development') {
        this.startSimulation();
        return;
      }

      await this.initializeAudio();
      this.startDetection();
    } catch (error) {
      console.error('Error starting VAD:', error);
      this.config.onError?.(error as Error);
    }
  }

  public stop(): void {
    this.isActive = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
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
    this.silenceStart = null;
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      throw new Error('Failed to initialize audio: ' + error);
    }
  }

  private startDetection(): void {
    this.isActive = true;
    this.detectVoice();
  }

  private detectVoice = (): void => {
    if (!this.isActive || !this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    const average = this.dataArray.reduce((acc, value) => acc + value, 0) / this.dataArray.length;
    const normalizedAverage = average / 255;

    if (normalizedAverage > this.config.threshold) {
      if (this.silenceStart !== null) {
        this.silenceStart = null;
        this.config.onSpeechStart?.();
      }
    } else if (this.silenceStart === null) {
      this.silenceStart = Date.now();
    } else if (Date.now() - this.silenceStart > this.config.silenceDuration) {
      this.config.onSpeechEnd?.();
      this.silenceStart = null;
    }

    this.animationFrame = requestAnimationFrame(this.detectVoice);
  };

  // Development mode simulation
  private startSimulation(): void {
    this.isActive = true;
    let isSpeaking = false;
    let holdStartTime: number | null = null;

    // Listen for spacebar events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpeaking) {
        e.preventDefault();
        isSpeaking = true;
        holdStartTime = Date.now();
        this.config.onSpeechStart?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSpeaking) {
        e.preventDefault();
        isSpeaking = false;
        holdStartTime = null;
        this.config.onSpeechEnd?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

    // Store cleanup function for later
    (this as any).cleanup = cleanup;
  }

  public isListening(): boolean {
    return this.isActive;
  }
}
