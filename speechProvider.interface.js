/**
 * SpeechProviderInterface
 * Abstract base class / contract that any speech recognition provider must adhere to.
 * Enables zero-friction modular swapping between Web Speech API, Parakit, or other future providers.
 */
export class SpeechProviderInterface {
  constructor(name = "UnknownProvider") {
    this.name = name;
    this.callbacks = {
      onStart: () => {},
      onInterimResult: (text) => {},
      onFinalResult: (text) => {},
      onError: (error) => {},
      onEnd: () => {},
      onAudioLevel: (level) => {}
    };
  }

  /**
   * Register event callbacks
   * @param {Object} callbacks 
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if provider is supported in current client environment
   * @returns {boolean}
   */
  isSupported() {
    throw new Error("Method 'isSupported()' must be implemented.");
  }

  /**
   * Start listening for voice input
   * @param {Object} options 
   */
  start(options = {}) {
    throw new Error("Method 'start()' must be implemented.");
  }

  /**
   * Stop listening for voice input
   */
  stop() {
    throw new Error("Method 'stop()' must be implemented.");
  }

  /**
   * Cancel and abort ongoing recognition
   */
  abort() {
    throw new Error("Method 'abort()' must be implemented.");
  }
}
