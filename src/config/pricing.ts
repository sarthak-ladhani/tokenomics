// USD to INR conversion rate
export const USD_TO_INR = 91.59;

// TTT Models pricing (per 1M tokens)
export const TTT_PRICING = {
  'gpt-5': { input: 1.25, cachedInput: 0.125, output: 10.00, notes: 'Flagship' },
  'gpt-5-mini': { input: 0.25, cachedInput: 0.025, output: 2.00, notes: 'Flagship mini' },
  'gpt-5-nano': { input: 0.05, cachedInput: 0.005, output: 0.40, notes: 'Flagship nano' },
  'gpt-4.1': { input: 2.00, cachedInput: 0.50, output: 8.00, notes: 'Latest standard' },
  'gpt-4.1-mini': { input: 0.40, cachedInput: 0.10, output: 1.60, notes: 'Latest mini' },
  'gpt-4.1-nano': { input: 0.10, cachedInput: 0.025, output: 0.40, notes: 'Ultra budget' },
  'gpt-4o': { input: 2.50, cachedInput: 1.25, output: 10.00, notes: 'Balanced performance' },
  'gpt-4o-mini': { input: 0.15, cachedInput: 0.075, output: 0.60, notes: 'Budget option' },
} as const;

// STS / Realtime Models pricing (per 1M tokens)
export const STS_PRICING = {
  'gpt-realtime': {
    textInput: 4.00,
    textCached: 0.40,
    textOutput: 16.00,
    audioInput: 32.00,
    audioCached: 0.40,
    audioOutput: 64.00,
  },
  'gpt-realtime-mini': {
    textInput: 0.60,
    textCached: 0.06,
    textOutput: 2.40,
    audioInput: 10.00,
    audioCached: 0.30,
    audioOutput: 20.00,
  },
} as const;

// Audio Omni Models pricing (per 1M tokens)
// Note: gpt-audio models do NOT support caching (no textCached field)
// gpt-realtime models DO support caching (have textCached field)
export const AUDIO_OMNI_PRICING = {
  'gpt-audio': {
    textInput: 2.50,
    textOutput: 10.00,
    audioInput: 32.00,
    audioOutput: 64.00,
    notes: 'Full size (no caching)',
  },
  'gpt-audio-mini': {
    textInput: 0.60,
    textOutput: 2.40,
    audioInput: 10.00,
    audioOutput: 20.00,
    notes: 'Mini (no caching)',
  },
  'gpt-realtime': {
    textInput: 4.00,
    textCached: 0.40,
    textOutput: 16.00,
    audioInput: 32.00,
    audioOutput: 64.00,
    notes: 'Realtime full size',
  },
  'gpt-realtime-mini': {
    textInput: 0.60,
    textCached: 0.06,
    textOutput: 2.40,
    audioInput: 10.00,
    audioOutput: 20.00,
    notes: 'Realtime mini',
  },
} as const;

// STT Models pricing (per minute)
export const STT_PRICING = {
  'whisper': { costPerMinute: 0.006, notes: 'Standard transcription' },
  'gpt-4o-transcribe': { costPerMinute: 0.006, notes: 'With diarization option' },
  'gpt-4o-mini-transcribe': { costPerMinute: 0.003, notes: 'Budget option' },
} as const;

// TTS Models pricing (per 1M characters)
export const TTS_PRICING = {
  'tts': { costPer1MChars: 15.00, notes: 'Standard' },
  'tts-hd': { costPer1MChars: 30.00, notes: 'High quality' },
} as const;

// Model display names
export const MODEL_DISPLAY_NAMES = {
  // TTT
  'gpt-5': 'GPT-5',
  'gpt-5-mini': 'GPT-5 Mini',
  'gpt-5-nano': 'GPT-5 Nano',
  'gpt-4.1': 'GPT-4.1',
  'gpt-4.1-mini': 'GPT-4.1 Mini',
  'gpt-4.1-nano': 'GPT-4.1 Nano',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  // STT
  'whisper': 'Whisper ($0.006/min)',
  'gpt-4o-transcribe': 'GPT-4o Transcribe ($0.006/min)',
  'gpt-4o-mini-transcribe': 'GPT-4o Mini Transcribe ($0.003/min)',
  // TTS
  'tts': 'TTS ($15/1M chars)',
  'tts-hd': 'TTS HD ($30/1M chars)',
  // STS
  'gpt-realtime': 'GPT Realtime',
  'gpt-realtime-mini': 'GPT Realtime Mini',
  // Audio Omni
  'gpt-audio': 'GPT Audio',
  'gpt-audio-mini': 'GPT Audio Mini',
} as const;

// Product display names
export const PRODUCT_DISPLAY_NAMES = {
  'chatbot': 'Chatbot',
  'voicebot': 'Voicebot',
  'voice-analytics': 'Voice Analytics',
} as const;

// Model type display names
export const MODEL_TYPE_DISPLAY_NAMES = {
  'ttt': 'TTT (Text-to-Text)',
  'stt-ttt-tts': 'STT + TTT + TTS',
  'omni-text-tts': 'Omni (text out) + TTS',
  'sts': 'STS (Speech-to-Speech)',
  'stt-ttt': 'STT + TTT',
  'stt-omni': 'STT (Omni)',
} as const;

// Product to Model Type mapping
export const PRODUCT_MODEL_TYPES = {
  'chatbot': ['ttt'] as const,
  'voicebot': ['stt-ttt-tts', 'omni-text-tts', 'sts'] as const,
  'voice-analytics': ['stt-ttt', 'stt-omni'] as const,
} as const;

// Model type to required model components
export const MODEL_TYPE_COMPONENTS = {
  'ttt': { ttt: true },
  'stt-ttt-tts': { stt: true, ttt: true, tts: true },
  'omni-text-tts': { audioOmni: true, tts: true },
  'sts': { sts: true },
  'stt-ttt': { stt: true, ttt: true },
  'stt-omni': { audioOmni: true },
} as const;

// Default model selections
export const DEFAULT_MODELS = {
  'chatbot': {
    'ttt': { ttt: 'gpt-4.1-mini' as const },
  },
  'voicebot': {
    'stt-ttt-tts': { stt: 'whisper' as const, ttt: 'gpt-4.1-mini' as const, tts: 'tts' as const },
    'omni-text-tts': { audioOmni: 'gpt-audio-mini' as const, tts: 'tts' as const },
    'sts': { sts: 'gpt-realtime-mini' as const },
  },
  'voice-analytics': {
    'stt-ttt': { stt: 'whisper' as const, ttt: 'gpt-4.1-mini' as const },
    'stt-omni': { audioOmni: 'gpt-audio-mini' as const },
  },
} as const;
