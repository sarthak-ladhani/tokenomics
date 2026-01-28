# Tokenomics - AI Cost Calculator

## Project Overview

Tokenomics is a web-based calculator that predicts and estimates costs for conversational AI products based on usage parameters. It helps teams forecast AI infrastructure costs before deployment.

### Supported Products

| Product | Description |
|---------|-------------|
| **Chatbot** | Text-based conversational AI |
| **Voicebot** | Voice-based real-time conversational AI |
| **Voice Analytics** | Asynchronous analysis of recorded audio |

### Key Features

- Cascading dropdown selection (Product → Model Type → Specific Models)
- Support for multiple AI model pipelines (TTT, STT+TTT+TTS, Omni, STS)
- Prompt caching optimization calculations
- Conversation history modes (running summary vs full history)
- Cost breakdown by component
- Token usage metrics
- USD to INR conversion (₹)

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Frontend | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 7.2.4 |
| Styling | Tailwind CSS | 4.1.18 |
| Linting | ESLint | 9.39.1 |

---

## Project Structure

```
Tokenomics/
├── src/
│   ├── App.tsx                    # Main app component & state management
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global styles
│   ├── types.ts                   # TypeScript type definitions
│   ├── components/
│   │   ├── ProductSelector.tsx    # Cascading dropdown selector
│   │   ├── InputFields.tsx        # Dynamic input form
│   │   ├── Results.tsx            # Cost & token breakdown display
│   │   └── Dropdown.tsx           # Reusable dropdown component
│   ├── config/
│   │   └── pricing.ts             # All pricing data & model configurations
│   └── utils/
│       └── calculations.ts        # Core calculation logic
├── public/                        # Static assets
├── dist/                          # Production build output
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

---

## Key Components

### `src/App.tsx`
Main application container managing:
- Global state (product, modelType, selectedModels, inputs, results)
- Cascading dropdown logic
- Default input values per product type
- Input validation before calculation
- Layout with header, configuration section, and results

### `src/components/ProductSelector.tsx`
Implements the cascading dropdown UI:
- Product selection (Chatbot, Voicebot, Voice Analytics)
- Model type selection based on product
- Model selection based on model type
- Auto-populates default models on selection change

### `src/components/InputFields.tsx`
Dynamic form rendering based on selected product:
- **Chatbot**: words per session, output/input ratio, exchanges, base prompt, history mode
- **Voicebot**: session duration, output/input ratio, exchanges, base prompt, history mode
- **Voice Analytics**: total audio minutes, number of files, base prompt, output length

### `src/components/Results.tsx`
Displays calculation results:
- Total cost per session (prominent display)
- Itemized cost breakdown with hierarchy
- Token usage metrics (input, cached, output, audio)
- Formats costs to 4 decimal places in INR

### `src/config/pricing.ts`
Central configuration for all pricing data:
- TTT_PRICING: 8 text-to-text models
- STS_PRICING: 2 realtime speech-to-speech models
- AUDIO_OMNI_PRICING: 4 audio models
- STT_PRICING: 3 speech-to-text models
- TTS_PRICING: 2 text-to-speech models
- USD_TO_INR conversion rate (91.59)

### `src/utils/calculations.ts`
Core business logic with 6 calculation functions:

| Function | Model Type | Description |
|----------|------------|-------------|
| `calculateChatbot()` | TTT | Text-to-text with history modes |
| `calculateVoicebotTraditional()` | STT + TTT + TTS | Whisper → LLM → TTS pipeline |
| `calculateVoicebotOmni()` | Omni + TTS | Audio-in → text-out + separate TTS |
| `calculateVoicebotSTS()` | STS | Full speech-to-speech |
| `calculateVoiceAnalyticsTraditional()` | STT + TTT | Transcribe then analyze |
| `calculateVoiceAnalyticsOmni()` | Omni | Direct audio analysis |

### `src/types.ts`
TypeScript definitions for:
- Product types: `'chatbot' | 'voicebot' | 'voice-analytics'`
- Model types: `'ttt' | 'stt-ttt-tts' | 'omni-text-tts' | 'sts' | 'stt-ttt' | 'stt-omni'`
- Input interfaces: `ChatbotInputs`, `VoicebotInputs`, `VoiceAnalyticsInputs`
- Result types: `CostBreakdown`, `TokenBreakdown`, `CalculationResult`

---

## Calculation Logic

### Conversion Constants

| Conversion | Formula |
|------------|---------|
| Words → Tokens | `tokens = words × (4/3)` |
| Speech Minutes → Words | `words = minutes × 108` |
| Speech Minutes → Audio Tokens | `audio_tokens = minutes × 1200` |
| Words → Characters (TTS) | `characters = words × 4` |

### Conversation History Modes

1. **Running Summary (cached)**: Fixed-size summary sent each exchange, periodically refreshed
2. **Full History (not cached)**: Cumulative conversation grows each turn

### Caching Support

- Models like `gpt-realtime` support prompt caching
- Models like `gpt-audio` do NOT support caching
- Base prompts are always cached when supported

---

## Data Flow

```
User Selection (Product → Model Type → Models)
        ↓
   Input Form (dynamic fields based on product)
        ↓
   Calculate Button
        ↓
   calculations.ts (dispatches to appropriate function)
        ↓
   pricing.ts (reads model prices)
        ↓
   Results Component (displays costs in INR)
```

---

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## Pricing Model

All costs are calculated using OpenAI's pricing structure:
- **Per 1M tokens** for text models
- **Per minute** for STT models
- **Per 1M characters** for TTS models
- Final costs displayed in **INR** (1 USD = 91.59 INR)

Cost display format: 4 decimal places (e.g., ₹0.1234)

---

## Future Enhancements (Out of Scope for v1)

- Tool calling cost estimation
- Multi-model comparison (side by side)
- Monthly/annual projections
- Support for Anthropic, Google, other providers
- Export/share calculations
- Saved presets
