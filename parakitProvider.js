import { SpeechProviderInterface } from "./speechProvider.interface.js";

/**
 * ParakitProvider (Future Integration Skeleton)
 * 
 * Modular adapter stub designed to integrate with the Parakit speech/audio engine
 * (e.g., via WebSocket audio streaming, on-device WASM, or dedicated Parakit SDK).
 * 
 * To switch the active provider to Parakit, invoke:
 * `speechService.setProvider(new ParakitProvider(config))`
 */
export class ParakitProvider extends SpeechProviderInterface {
  constructor(config = {}) {
    super("ParakitVoiceEngine");
    this.config = {
      endpoint: config.endpoint || "ws://localhost:8080/parakit/stream",
      apiKey: config.apiKey || null,
      sampleRate: config.sampleRate || 16000,
      model: config.model || "parakit-canteen-v1",
      ...config
    };
    this.mediaStream = null;
    this.audioContext = null;
    this.isListening = false;
  }

  isSupported() {
    // Parakit needs getUserMedia for direct raw PCM microphone streaming
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async start(options = {}) {
    if (!this.isSupported()) {
      this.callbacks.onError({
        code: "PARAKIT_UNSUPPORTED",
        title: "Audio Capture Not Supported",
        message: "Your browser does not support audio recording stream required by Parakit."
      });
      return;
    }

    try {
      this.isListening = true;
      this.callbacks.onStart();

      // Placeholder: Setup microphone stream for Parakit processor
      // In full implementation:
      // this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // this.audioContext = new AudioContext({ sampleRate: this.config.sampleRate });
      // connect to Parakit websocket or WASM worker...

      console.info("[ParakitProvider] Initialized audio pipeline ready for Parakit integration.", {
        config: this.config
      });

    } catch (err) {
      this.isListening = false;
      this.callbacks.onError({
        code: "PARAKIT_INIT_FAILED",
        title: "Parakit Initialization Failed",
        message: err.message || "Failed to start Parakit speech pipeline."
      });
    }
  }

  stop() {
    this.isListening = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.callbacks.onEnd();
  }

  abort() {
    this.stop();
  }
}
