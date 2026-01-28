// Product types
export type Product = 'chatbot' | 'voicebot' | 'voice-analytics';

// Model type identifiers
export type ModelType =
  | 'ttt'                    // Text-to-Text (Chatbot)
  | 'stt-ttt-tts'            // STT + TTT + TTS (Voicebot traditional)
  | 'omni-text-tts'          // Omni (text out) + TTS (Voicebot)
  | 'sts'                    // Speech-to-Speech (Voicebot)
  | 'stt-ttt'                // STT + TTT (Voice Analytics)
  | 'stt-omni';              // STT (Omni) (Voice Analytics)

// Session unit options
export type SessionUnit = 'minute' | '1hr' | '24hr';

// Conversation history mode
export type HistoryMode = 'summary' | 'full';

// Model categories
export type TTTModel = 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'gpt-4o' | 'gpt-4o-mini';
export type STTModel = 'whisper' | 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';
export type TTSModel = 'tts' | 'tts-hd';
export type STSModel = 'gpt-realtime' | 'gpt-realtime-mini';
export type AudioOmniModel = 'gpt-audio' | 'gpt-audio-mini' | 'gpt-realtime' | 'gpt-realtime-mini';

// Input field types for different products
export interface ChatbotInputs {
  sessionUnit: SessionUnit;
  wordsPerSession: number;
  outputInputRatio: number;
  numberOfExchanges: number;
  basePromptLength: number;
  historyMode: HistoryMode;
  summaryLength?: number;
  summaryRefreshFrequency?: number;
}

export interface VoicebotInputs {
  sessionDuration: number; // in minutes
  sessionUnit: SessionUnit;
  outputInputRatio: number;
  numberOfExchanges: number;
  basePromptLength: number;
  historyMode: HistoryMode;
  summaryLength?: number;
  summaryRefreshFrequency?: number;
}

export interface VoiceAnalyticsInputs {
  totalAudioMinutes: number;
  numberOfFiles: number;
  basePromptLength: number;
  outputLength: number;
}

export type InputFields = ChatbotInputs | VoicebotInputs | VoiceAnalyticsInputs;

// Selected models based on model type
export interface SelectedModels {
  ttt?: TTTModel;
  stt?: STTModel;
  tts?: TTSModel;
  sts?: STSModel;
  audioOmni?: AudioOmniModel;
}

// Cost breakdown for outputs
export interface CostBreakdown {
  totalCost: number;
  cachedInputCost?: number;
  nonCachedInputCost?: number;
  outputCost?: number;
  sttCost?: number;
  ttsCost?: number;
  audioInputCost?: number;
  audioOutputCost?: number;
  textInputCost?: number;
  textOutputCost?: number;
}

// Token breakdown for outputs
export interface TokenBreakdown {
  inputTokens?: number;
  cachedInputTokens?: number;
  outputTokens?: number;
  audioInputTokens?: number;
  audioOutputTokens?: number;
}

// Full calculation result
export interface CalculationResult {
  costs: CostBreakdown;
  tokens: TokenBreakdown;
}

// App state
export interface AppState {
  product: Product | null;
  modelType: ModelType | null;
  selectedModels: SelectedModels;
  inputs: Partial<InputFields>;
  results: CalculationResult | null;
}
