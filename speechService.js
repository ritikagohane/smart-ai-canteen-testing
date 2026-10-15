import { WebSpeechProvider } from "./webSpeechProvider.js";

/**
 * SpeechService
 * Unified service manager that delegates speech recognition to the active provider.
 * Default provider is WebSpeechProvider (Browser Web Speech API).
 * Easily swapped with ParakitProvider or other engines via setProvider().
 */
export class SpeechService {
  constructor(initialProvider = null) {
    this.provider = initialProvider || new WebSpeechProvider();
    this.subscribers = {
      start: [],
      interim: [],
      result: [],
      error: [],
      end: []
    };

    this.bindProvider();
  }

  bindProvider() {
    this.provider.setCallbacks({
      onStart: () => this.notify("start"),
      onInterimResult: (text) => this.notify("interim", text),
      onFinalResult: (text) => this.notify("result", text),
      onError: (err) => this.notify("error", err),
      onEnd: () => this.notify("end")
    });
  }

  /**
   * Set or swap the active speech provider (e.g. ParakitProvider)
   * @param {SpeechProviderInterface} newProvider 
   */
  setProvider(newProvider) {
    if (this.provider) {
      this.provider.abort();
    }
    this.provider = newProvider;
    this.bindProvider();
    console.info(`[SpeechService] Switched speech provider to: ${newProvider.name}`);
  }

  getProviderName() {
    return this.provider ? this.provider.name : "None";
  }

  isSupported() {
    return this.provider && this.provider.isSupported();
  }

  start(options) {
    this.provider.start(options);
  }

  stop() {
    this.provider.stop();
  }

  abort() {
    this.provider.abort();
  }

  /**
   * Event subscription system
   */
  on(event, handler) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(handler);
    }
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(h => h !== handler);
    };
  }

  notify(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`[SpeechService] Error in ${event} handler:`, e);
        }
      });
    }
  }
}
