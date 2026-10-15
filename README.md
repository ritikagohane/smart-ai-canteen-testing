# AI Smart Canteen — Voice Ordering System (Frontend Demo)

A modern, responsive frontend implementation of the **Voice Ordering Feature** for the AI Smart Canteen website. Students can speak natural language food orders (e.g. *"Order one veg sandwich and a cold coffee"*), review the recognized items, and confirm or cancel their order with real-time visual feedback.

---

## 🚀 Key Features

1. **Microphone Voice Ordering Triggers**:
   - **Navbar Voice Button**: Quick access from the header navigation.
   - **Hero Voice Bar**: Prominent central trigger with sample phrases.
   - **Floating Action Button (FAB)**: Persistent mic button accessible on all viewports.

2. **Web Speech API Integration**:
   - Uses browser-native `window.SpeechRecognition` / `window.webkitSpeechRecognition`.
   - Real-time interim and final transcript streaming as the student speaks.
   - Zero external cloud AI APIs or backend servers needed.

3. **Listening Animations & Visual Feedback**:
   - Glowing microphone with animated **expanding pulse rings**.
   - Dynamic **7-bar audio equalizer** animation while listening.
   - Live speech transcript display.

4. **Natural Language Order Recognition**:
   - Rule-based modular parser (`OrderParser`) matching items, quantities (words like "one", "two", "a", digits), unit prices, and subtotal calculations.
   - Structured order preview card displaying item emoji, quantity badge, price breakdown, and total.

5. **Confirm and Cancel Actions**:
   - **Confirm Order**: Adds recognized items to the student's tray, highlights items on the menu grid, and produces an order confirmation token (e.g. `#CT-101`) with pickup wait time.
   - **Cancel**: Aborts speech recognition, resets the state, and dismisses the modal without modifying the tray.

6. **Comprehensive Error Handling**:
   - `PERMISSION_DENIED`: Clear alert explaining how to allow mic access in browser settings.
   - `NO_SPEECH`: Friendly timeout message prompting the user to try again.
   - `AUDIO_CAPTURE`: Microphone disconnection / hardware busy handling.
   - `UNSUPPORTED_BROWSER`: Notification for browsers lacking Web Speech API, with automatic fallback to click-to-simulate demo chips.

7. **Modular Architecture for Parakit Integration**:
   - Abstract `SpeechProviderInterface` defines standard lifecycle hooks (`start`, `stop`, `abort`, `callbacks`).
   - `WebSpeechProvider` implements browser Web Speech API.
   - `ParakitProvider` provides a drop-in stub ready for future Parakit speech model / WebSocket streaming integration.
   - Interactive developer switch in the footer to toggle between providers on the fly.

8. **Student Sign-Up by Name, Roll No, Year & Department**:
   - **Direct Entry**: No pre-existing fake IDs are provided. Students simply enter their **Full Name**, **Roll Number**, **Year**, and **Department** (*Computer Engg*, *Information Technology*, *Electronics and Computer Science*, *Biomedical Engg*, *Electronics and Telecom*).
   - **Switching Roll Numbers**: Any student can switch or enter their own Roll No anytime from the navbar.
   - **Per-Student Pickup Tokens**: Orders placed by voice or manual checkout are uniquely announced and printed with the student's Roll No, Name, and Department.
   - **Persistent Local History**: Past orders and tokens are remembered per Roll No in browser `localStorage`.
   - **Voice Order Header Badge**: Voice modal explicitly displays which student Roll No the order will be billed and prepared for.

9. **Natural Language Typing Feature**:
   - **Hero Dual Bar**: Students can type their order directly into the central hero bar and press Enter or click "Order".
   - **Modal Type Tab**: Switch anytime inside the modal between **🎙️ Speak Order** and **⌨️ Type Order**.
   - **Identical NLP Parsing**: Typed text is processed through the exact same `OrderParser`, extracting items, quantities, and prices automatically.

10. **Instant Demo Mode**:
   - Interactive sample chips (`"Order one veg sandwich and a cold coffee"`) allow complete end-to-end testing even when microphone permissions are disabled or testing in noisy demo environments.

---

## 📁 Project Structure

```text
ai-smart-canteen/
├── index.html                  # Main canteen HTML5 interface
├── README.md                   # Documentation & Parakit guide
├── css/
│   ├── styles.css              # Main cafeteria design system, layout, cart drawer
│   └── voice.css               # Listening animations, modal, equalizer, pulse rings
└── js/
    ├── app.js                  # Main application bootstrap
    ├── config/
    │   └── menuData.js         # Menu catalog, prices, categories & keywords
    ├── services/
    │   ├── speechProvider.interface.js # Abstract provider contract
    │   ├── webSpeechProvider.js        # Browser Web Speech API implementation
    │   ├── parakitProvider.js          # Modular stub ready for Parakit integration
    │   ├── speechService.js            # Unified speech manager with provider hot-swapping
    │   └── orderParser.js              # Natural language speech-to-cart parser
    └── components/
        ├── voiceOrderModal.js          # Voice modal controller & animations
        ├── menuView.js                 # Menu cards & category pills
        └── cartView.js                 # Cart tray, token generation & checkout
```

---

## 🏃 How to Run the Demo

Because modern web browsers enforce security policies for ES Modules (`import`/`export`) and Web Speech API microphone permissions, the site should be opened via a local HTTP server:

### Option 1: Python (Recommended)
Open a terminal in `ai-smart-canteen/` and run:
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### Option 2: Node.js / npx serve
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and select **"Open with Live Server"**.

> **Note**: For speech recognition to work with your actual microphone, use **Google Chrome**, **Microsoft Edge**, or **Safari** and grant microphone permissions when prompted.

---

## 🔌 How to Integrate Parakit Later

The codebase is structured to decouple speech recognition from UI and business logic. To plug in Parakit:

1. Open `js/services/parakitProvider.js`.
2. Implement your Parakit client library, WebSocket audio stream, or WASM engine inside the `start()` and `stop()` methods:
   ```javascript
   // Inside ParakitProvider.js
   async start(options) {
     this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
     // Connect to Parakit audio stream or initialize Parakit SDK:
     // parakitClient.on('transcript', (text) => this.callbacks.onFinalResult(text));
   }
   ```
3. Set the active provider in `js/app.js`:
   ```javascript
   speechService.setProvider(new ParakitProvider({
     endpoint: "ws://your-parakit-server/stream",
     apiKey: "YOUR_PARAKIT_KEY"
   }));
   ```
No changes to `voiceOrderModal.js`, `orderParser.js`, or the HTML/CSS will be required!
