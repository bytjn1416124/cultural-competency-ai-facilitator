import { SESSION_CONFIG } from '@/constants/config';

interface AudioProcessorConfig {
  onAudioData?: (buffer: Float32Array) => void;
  onEnergyChange?: (energy: number) => void;
  onSpeechProbability?: (probability: number) => void;
  onError?: (error: Error) => void;
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private config: AudioProcessorConfig;

  private energyHistory: number[] = [];
  private readonly ENERGY_HISTORY_SIZE = 30;
  private isProcessing = false;

  constructor(config: AudioProcessorConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: SESSION_CONFIG.AUDIO.CHANNELS,
          sampleRate: SESSION_CONFIG.AUDIO.SAMPLE_RATE
        }
      });

      // Initialize audio context
      this.audioContext = new AudioContext({
        sampleRate: SESSION_CONFIG.AUDIO.SAMPLE_RATE
      });

      // Create audio nodes
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      this.processorNode = this.audioContext.createScriptProcessor(
        SESSION_CONFIG.AUDIO.CHUNK_SIZE,
        SESSION_CONFIG.AUDIO.CHANNELS,
        SESSION_CONFIG.AUDIO.CHANNELS
      );

      // Configure analyser
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Connect nodes
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      // Set up audio processing
      this.processorNode.onaudioprocess = this.handleAudioProcess.bind(this);

    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public start(): void {
    this.isProcessing = true;
  }

  public stop(): void {
    this.isProcessing = false;
  }

  public cleanup(): void {
    // Stop processing
    this.isProcessing = false;

    // Clean up audio nodes
    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Clear history
    this.energyHistory = [];
  }

  private handleAudioProcess(event: AudioProcessingEvent): void {
    if (!this.isProcessing || !this.analyserNode) return;

    // Get input data
    const inputData = event.inputBuffer.getChannelData(0);
    
    // Calculate energy
    const energy = this.calculateEnergy(inputData);
    this.updateEnergyHistory(energy);

    // Calculate speech probability
    const probability = this.calculateSpeechProbability();

    // Emit events
    this.config.onAudioData?.(inputData);
    this.config.onEnergyChange?.(energy);
    this.config.onSpeechProbability?.(probability);
  }

  private calculateEnergy(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  private updateEnergyHistory(energy: number): void {
    this.energyHistory.push(energy);
    if (this.energyHistory.length > this.ENERGY_HISTORY_SIZE) {
      this.energyHistory.shift();
    }
  }

  private calculateSpeechProbability(): number {
    if (this.energyHistory.length < 2) return 0;

    const currentEnergy = this.energyHistory[this.energyHistory.length - 1];
    const average = this.energyHistory.reduce((a, b) => a + b) / this.energyHistory.length;
    const threshold = SESSION_CONFIG.VAD.ENERGY_THRESHOLD;

    // Calculate probability based on current energy compared to average and threshold
    if (currentEnergy < threshold) return 0;
    
    const normalizedEnergy = (currentEnergy - threshold) / (average * 2 - threshold);
    return Math.min(Math.max(normalizedEnergy, 0), 1);
  }

  private handleError(error: Error): void {
    console.error('AudioProcessor error:', error);
    this.config.onError?.(error);
  }

  public isActive(): boolean {
    return this.isProcessing;
  }

  public getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  public getSampleRate(): number {
    return this.audioContext?.sampleRate || SESSION_CONFIG.AUDIO.SAMPLE_RATE;
  }
}
