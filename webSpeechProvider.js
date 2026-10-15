import { SpeechProviderInterface } from "./speechProvider.interface.js";

/**
 * WebSpeechProvider
 * Concrete implementation using standard Browser Web Speech API (webkitSpeechRecognition / SpeechRecognition).
 */
export class WebSpeechProvider extends SpeechProviderInterface {
  constructor() {
    super("WebSpeechAPI");
    this.recognition = null;
    this.isListening = false;
    this.lang = "en-IN"; // English (India) with fallback to en-US
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // We process discrete voice orders
    this.recognition.interimResults = true; // Real-time feedback as the student speaks
    this.recognition.maxAlternatives = 1;
    this.recognition.lang = this.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        this.callbacks.onInterimResult(interimTranscript);
      }
      if (finalTranscript) {
        this.callbacks.onFinalResult(finalTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      const errorDetail = this.normalizeError(event.error);
      this.callbacks.onError(errorDetail);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd();
    };
  }

  isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(options = {}) {
    if (!this.isSupported()) {
      const error = {
        code: "UNSUPPORTED_BROWSER",
        message: "Your browser does not support the Web Speech API. Please try Google Chrome or Microsoft Edge."
      };
      this.callbacks.onError(error);
      return;
    }

    if (this.isListening) {
      this.abort();
    }

    if (options.lang) {
      this.recognition.lang = options.lang;
    }

    try {
      this.recognition.start();
    } catch (err) {
      // In case start is called while already starting
      this.callbacks.onError({
        code: "START_FAILED",
        message: "Could not initialize voice listener: " + (err.message || "Microphone busy.")
      });
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isListening = false;
  }

  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Safe ignore
      }
    }
    this.isListening = false;
  }

  /**
   * Human-friendly error translation for canteen users
   * @param {string} errCode 
   * @returns {Object}
   */
  normalizeError(errCode) {
    switch (errCode) {
      case "not-allowed":
      case "service-not-allowed":
        return {
          code: "PERMISSION_DENIED",
          title: "Microphone Access Denied",
          message: "Please click the camera/mic icon in your browser address bar and choose 'Allow' to order with your voice."
        };
      case "no-speech":
        return {
          code: "NO_SPEECH",
          title: "No Speech Detected",
          message: "We didn't catch that. Please tap the microphone and try speaking closer to your device."
        };
      case "audio-capture":
        return {
          code: "AUDIO_CAPTURE",
          title: "No Microphone Detected",
          message: "Ensure your microphone is plugged in, working, and not used by another application."
        };
      case "network":
        return {
          code: "NETWORK_ERROR",
          title: "Speech Recognition Network Issue",
          message: "The Web Speech service requires an active internet connection. Please verify your connection."
        };
      case "aborted":
        return {
          code: "ABORTED",
          title: "Listening Cancelled",
          message: "Voice ordering was cancelled."
        };
      default:
        return {
          code: "UNKNOWN",
          title: "Voice Recognition Error",
          message: `Recognition issue: ${errCode || "Unknown error"}. Try again.`
        };
    }
  }
}
