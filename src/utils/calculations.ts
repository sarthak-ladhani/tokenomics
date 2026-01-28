import type {
  ChatbotInputs,
  VoicebotInputs,
  VoiceAnalyticsInputs,
  SelectedModels,
  CalculationResult,
  ModelType,
  TTTModel,
  STTModel,
  TTSModel,
  STSModel,
  AudioOmniModel,
} from '../types';

import {
  TTT_PRICING,
  STS_PRICING,
  AUDIO_OMNI_PRICING,
  STT_PRICING,
  TTS_PRICING,
  USD_TO_INR,
} from '../config/pricing';

// Conversion constants
const WORDS_TO_TOKENS = 4 / 3;          // 3 words = 4 tokens
const MINUTES_TO_WORDS = 108;           // minutes × 60 × (9/5)
const MINUTES_TO_AUDIO_TOKENS = 1200;   // minutes × 1200
const WORDS_TO_CHARACTERS = 4;          // 1 word = 4 characters

// Convert USD to INR
const toINR = (usd: number): number => usd * USD_TO_INR;

// Get cost per token from per 1M tokens price
const perToken = (perMillion: number): number => perMillion / 1_000_000;

// Get cost per character from per 1M characters price
const perChar = (perMillion: number): number => perMillion / 1_000_000;

// 6.1 Chatbot (TTT) calculation
export function calculateChatbot(
  inputs: ChatbotInputs,
  models: SelectedModels
): CalculationResult {
  const tttModel = models.ttt as TTTModel;
  const pricing = TTT_PRICING[tttModel];

  const { wordsPerSession, outputInputRatio, numberOfExchanges, basePromptLength, historyMode } = inputs;

  // Derive input and output words
  const inputWords = wordsPerSession / (1 + outputInputRatio);
  const outputWords = inputWords * outputInputRatio;

  // Per exchange
  const inputWordsPerExchange = inputWords / numberOfExchanges;
  const outputWordsPerExchange = outputWords / numberOfExchanges;

  const inputTokensPerExchange = inputWordsPerExchange * WORDS_TO_TOKENS;
  const outputTokensPerExchange = outputWordsPerExchange * WORDS_TO_TOKENS;
  const basePromptTokens = basePromptLength * WORDS_TO_TOKENS;

  // Cached tokens (base prompt is always cached for each exchange)
  let cachedTokens = basePromptTokens * numberOfExchanges;

  // Non-cached input tokens
  let nonCachedInputTokens = 0;

  // Summarization cost
  let summarizationInputTokens = 0;
  let summarizationOutputTokens = 0;

  if (historyMode === 'summary' && inputs.summaryLength && inputs.summaryRefreshFrequency) {
    const summaryTokens = inputs.summaryLength * WORDS_TO_TOKENS;
    // Summary is cached for each exchange
    cachedTokens += summaryTokens * numberOfExchanges;

    // Add summarization cost every N exchanges
    const summarizationCalls = Math.floor(numberOfExchanges / inputs.summaryRefreshFrequency);
    // Estimate average history at summary point (half of accumulated history)
    const avgHistoryAtSummary = (inputTokensPerExchange + outputTokensPerExchange) * (inputs.summaryRefreshFrequency / 2);
    summarizationInputTokens = avgHistoryAtSummary * summarizationCalls;
    summarizationOutputTokens = summaryTokens * summarizationCalls;

    // Current exchange input is non-cached
    nonCachedInputTokens = inputTokensPerExchange * numberOfExchanges + summarizationInputTokens;
  } else if (historyMode === 'full') {
    // Full history mode - history grows each turn and is not cached
    let cumulativeHistoryTokens = 0;
    let totalInputTokens = 0;

    for (let i = 0; i < numberOfExchanges; i++) {
      const turnInput = inputTokensPerExchange + cumulativeHistoryTokens;
      totalInputTokens += turnInput;
      cumulativeHistoryTokens += inputTokensPerExchange + outputTokensPerExchange;
    }

    nonCachedInputTokens = totalInputTokens;
  } else {
    // Simple case - just current input for each exchange
    nonCachedInputTokens = inputTokensPerExchange * numberOfExchanges;
  }

  // Output tokens (same for both modes)
  const totalOutputTokens = outputTokensPerExchange * numberOfExchanges + summarizationOutputTokens;

  // Costs
  const cachedInputCost = cachedTokens * perToken(pricing.cachedInput);
  const nonCachedInputCost = nonCachedInputTokens * perToken(pricing.input);
  const outputCost = totalOutputTokens * perToken(pricing.output);

  const totalCost = cachedInputCost + nonCachedInputCost + outputCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      cachedInputCost: toINR(cachedInputCost),
      nonCachedInputCost: toINR(nonCachedInputCost),
      outputCost: toINR(outputCost),
    },
    tokens: {
      inputTokens: nonCachedInputTokens,
      cachedInputTokens: cachedTokens,
      outputTokens: totalOutputTokens,
    },
  };
}

// 6.2 Voicebot (STT + TTT + TTS) calculation
export function calculateVoicebotTraditional(
  inputs: VoicebotInputs,
  models: SelectedModels
): CalculationResult {
  const sttModel = models.stt as STTModel;
  const tttModel = models.ttt as TTTModel;
  const ttsModel = models.tts as TTSModel;

  const sttPricing = STT_PRICING[sttModel];
  const ttsPricing = TTS_PRICING[ttsModel];

  const { sessionDuration, outputInputRatio, numberOfExchanges, basePromptLength, historyMode } = inputs;

  // Derived words
  const totalWords = sessionDuration * MINUTES_TO_WORDS;
  const userWords = totalWords / (1 + outputInputRatio);
  const assistantWords = userWords * outputInputRatio;

  // STT Cost - user speech duration
  const userSpeechMinutes = userWords / MINUTES_TO_WORDS;
  const sttCost = userSpeechMinutes * sttPricing.costPerMinute;

  // TTT Cost - reuse chatbot logic
  const chatbotInputs: ChatbotInputs = {
    sessionUnit: inputs.sessionUnit,
    wordsPerSession: userWords + assistantWords, // total words
    outputInputRatio,
    numberOfExchanges,
    basePromptLength,
    historyMode,
    summaryLength: inputs.summaryLength,
    summaryRefreshFrequency: inputs.summaryRefreshFrequency,
  };

  const tttResult = calculateChatbot(chatbotInputs, { ttt: tttModel });
  // TTT costs are already in INR, convert back for combined calculation
  const tttCostUSD = tttResult.costs.totalCost / USD_TO_INR;

  // TTS Cost - priced per character
  const assistantCharacters = assistantWords * WORDS_TO_CHARACTERS;
  const ttsCost = assistantCharacters * perChar(ttsPricing.costPer1MChars);

  const totalCost = sttCost + tttCostUSD + ttsCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      sttCost: toINR(sttCost),
      cachedInputCost: tttResult.costs.cachedInputCost,
      nonCachedInputCost: tttResult.costs.nonCachedInputCost,
      textOutputCost: tttResult.costs.outputCost,
      ttsCost: toINR(ttsCost),
    },
    tokens: {
      inputTokens: tttResult.tokens.inputTokens,
      cachedInputTokens: tttResult.tokens.cachedInputTokens,
      outputTokens: tttResult.tokens.outputTokens,
    },
  };
}

// 6.3 Voicebot (Omni text out + TTS) calculation
export function calculateVoicebotOmni(
  inputs: VoicebotInputs,
  models: SelectedModels
): CalculationResult {
  const audioOmniModel = models.audioOmni as AudioOmniModel;
  const ttsModel = models.tts as TTSModel;

  const omniPricing = AUDIO_OMNI_PRICING[audioOmniModel];
  const ttsPricing = TTS_PRICING[ttsModel];

  const { sessionDuration, outputInputRatio, numberOfExchanges, basePromptLength, historyMode } = inputs;

  // Derived words
  const totalWords = sessionDuration * MINUTES_TO_WORDS;
  const userWords = totalWords / (1 + outputInputRatio);
  const assistantWords = userWords * outputInputRatio;

  // Audio input tokens (user speech as audio)
  const userSpeechMinutes = userWords / MINUTES_TO_WORDS;
  const audioInputTokens = userSpeechMinutes * MINUTES_TO_AUDIO_TOKENS;

  // Text output from Omni (assistant response)
  const textOutputTokens = assistantWords * WORDS_TO_TOKENS;

  // Base prompt tokens (text, can be cached if model supports it)
  const basePromptTokens = basePromptLength * WORDS_TO_TOKENS;

  // Check if model supports caching (gpt-realtime models have textCached, gpt-audio models don't)
  const supportsCaching = 'textCached' in omniPricing;

  // Per exchange tokens for conversation history
  // User input as text (transcript of audio) + assistant output as text
  const userTextPerExchange = (userWords / numberOfExchanges) * WORDS_TO_TOKENS;
  const assistantTextPerExchange = (assistantWords / numberOfExchanges) * WORDS_TO_TOKENS;

  // Calculate cached and non-cached text input tokens based on history mode
  let cachedTextTokens = 0;
  let nonCachedTextTokens = 0;
  let summarizationOutputTokens = 0;

  if (historyMode === 'summary' && inputs.summaryLength && inputs.summaryRefreshFrequency) {
    // Summary mode: base prompt + summary are cached (if supported)
    const summaryTokens = inputs.summaryLength * WORDS_TO_TOKENS;
    if (supportsCaching) {
      cachedTextTokens = (basePromptTokens + summaryTokens) * numberOfExchanges;
    } else {
      // No caching support - all text input at full rate
      nonCachedTextTokens = (basePromptTokens + summaryTokens) * numberOfExchanges;
    }

    // Summarization cost every N exchanges
    const summarizationCalls = Math.floor(numberOfExchanges / inputs.summaryRefreshFrequency);
    const avgHistoryAtSummary = (userTextPerExchange + assistantTextPerExchange) * (inputs.summaryRefreshFrequency / 2);
    const summarizationInputTokens = avgHistoryAtSummary * summarizationCalls;
    summarizationOutputTokens = summaryTokens * summarizationCalls;

    // Add summarization input to non-cached tokens
    nonCachedTextTokens += summarizationInputTokens;
  } else if (historyMode === 'full') {
    // Full history mode: base prompt can be cached, but conversation history is NOT cached
    // Conversation history grows each turn
    let cumulativeHistoryTokens = 0;
    let totalHistoryTokens = 0;

    for (let i = 0; i < numberOfExchanges; i++) {
      totalHistoryTokens += cumulativeHistoryTokens;
      cumulativeHistoryTokens += userTextPerExchange + assistantTextPerExchange;
    }

    if (supportsCaching) {
      // Base prompt is cached for each exchange
      cachedTextTokens = basePromptTokens * numberOfExchanges;
      // Conversation history is NOT cached
      nonCachedTextTokens = totalHistoryTokens;
    } else {
      // No caching support - all text input at full rate
      nonCachedTextTokens = (basePromptTokens * numberOfExchanges) + totalHistoryTokens;
    }
  } else {
    // Default/simple case - just base prompt for each exchange
    if (supportsCaching) {
      cachedTextTokens = basePromptTokens * numberOfExchanges;
    } else {
      nonCachedTextTokens = basePromptTokens * numberOfExchanges;
    }
  }

  // Total output tokens (including summarization output)
  const totalTextOutputTokens = textOutputTokens + summarizationOutputTokens;

  // Costs
  const audioInputCost = audioInputTokens * perToken(omniPricing.audioInput);
  const textOutputCost = totalTextOutputTokens * perToken(omniPricing.textOutput);

  // Text input costs
  let cachedTextCost = 0;
  let nonCachedTextCost = 0;
  if (supportsCaching && cachedTextTokens > 0) {
    cachedTextCost = cachedTextTokens * perToken((omniPricing as typeof AUDIO_OMNI_PRICING['gpt-realtime']).textCached);
  }
  if (nonCachedTextTokens > 0) {
    nonCachedTextCost = nonCachedTextTokens * perToken(omniPricing.textInput);
  }

  // TTS Cost
  const assistantCharacters = assistantWords * WORDS_TO_CHARACTERS;
  const ttsCost = assistantCharacters * perChar(ttsPricing.costPer1MChars);

  const totalCost = audioInputCost + cachedTextCost + nonCachedTextCost + textOutputCost + ttsCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      audioInputCost: toINR(audioInputCost),
      cachedInputCost: cachedTextTokens > 0 ? toINR(cachedTextCost) : undefined,
      nonCachedInputCost: nonCachedTextTokens > 0 ? toINR(nonCachedTextCost) : undefined,
      textOutputCost: toINR(textOutputCost),
      ttsCost: toINR(ttsCost),
    },
    tokens: {
      audioInputTokens,
      cachedInputTokens: cachedTextTokens > 0 ? cachedTextTokens : undefined,
      inputTokens: nonCachedTextTokens > 0 ? nonCachedTextTokens : undefined,
      outputTokens: totalTextOutputTokens,
    },
  };
}

// 6.4 Voicebot (STS - Speech to Speech) calculation
export function calculateVoicebotSTS(
  inputs: VoicebotInputs,
  models: SelectedModels
): CalculationResult {
  const stsModel = models.sts as STSModel;
  const stsPricing = STS_PRICING[stsModel];

  const { sessionDuration, outputInputRatio, numberOfExchanges, basePromptLength, historyMode } = inputs;

  // Derived words
  const totalWords = sessionDuration * MINUTES_TO_WORDS;
  const userWords = totalWords / (1 + outputInputRatio);
  const assistantWords = userWords * outputInputRatio;

  // Audio tokens
  const userSpeechMinutes = userWords / MINUTES_TO_WORDS;
  const assistantSpeechMinutes = assistantWords / MINUTES_TO_WORDS;

  const audioInputTokens = userSpeechMinutes * MINUTES_TO_AUDIO_TOKENS;
  const audioOutputTokens = assistantSpeechMinutes * MINUTES_TO_AUDIO_TOKENS;

  // Base prompt tokens (text)
  const basePromptTokens = basePromptLength * WORDS_TO_TOKENS;

  // Per exchange tokens for conversation history (as text transcripts)
  const userTextPerExchange = (userWords / numberOfExchanges) * WORDS_TO_TOKENS;
  const assistantTextPerExchange = (assistantWords / numberOfExchanges) * WORDS_TO_TOKENS;

  // Calculate cached and non-cached text input tokens based on history mode
  let cachedTextTokens = 0;
  let nonCachedTextTokens = 0;
  let summarizationOutputTokens = 0;

  if (historyMode === 'summary' && inputs.summaryLength && inputs.summaryRefreshFrequency) {
    // Summary mode: base prompt + summary are cached
    const summaryTokens = inputs.summaryLength * WORDS_TO_TOKENS;
    cachedTextTokens = (basePromptTokens + summaryTokens) * numberOfExchanges;

    // Summarization cost every N exchanges
    const summarizationCalls = Math.floor(numberOfExchanges / inputs.summaryRefreshFrequency);
    const avgHistoryAtSummary = (userTextPerExchange + assistantTextPerExchange) * (inputs.summaryRefreshFrequency / 2);
    const summarizationInputTokens = avgHistoryAtSummary * summarizationCalls;
    summarizationOutputTokens = summaryTokens * summarizationCalls;

    // Add summarization input to non-cached tokens
    nonCachedTextTokens += summarizationInputTokens;
  } else if (historyMode === 'full') {
    // Full history mode: base prompt is cached, but conversation history is NOT cached
    // Conversation history grows each turn (stored as text transcripts)
    let cumulativeHistoryTokens = 0;
    let totalHistoryTokens = 0;

    for (let i = 0; i < numberOfExchanges; i++) {
      totalHistoryTokens += cumulativeHistoryTokens;
      cumulativeHistoryTokens += userTextPerExchange + assistantTextPerExchange;
    }

    // Base prompt is cached for each exchange
    cachedTextTokens = basePromptTokens * numberOfExchanges;
    // Conversation history is NOT cached
    nonCachedTextTokens = totalHistoryTokens;
  } else {
    // Default/simple case - just base prompt for each exchange (cached)
    cachedTextTokens = basePromptTokens * numberOfExchanges;
  }

  // Costs
  const audioInputCost = audioInputTokens * perToken(stsPricing.audioInput);
  const audioOutputCost = audioOutputTokens * perToken(stsPricing.audioOutput);
  const cachedTextCost = cachedTextTokens > 0 ? cachedTextTokens * perToken(stsPricing.textCached) : 0;
  const nonCachedTextCost = nonCachedTextTokens > 0 ? nonCachedTextTokens * perToken(stsPricing.textInput) : 0;
  const textOutputCost = summarizationOutputTokens > 0 ? summarizationOutputTokens * perToken(stsPricing.textOutput) : 0;

  const totalCost = audioInputCost + audioOutputCost + cachedTextCost + nonCachedTextCost + textOutputCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      audioInputCost: toINR(audioInputCost),
      audioOutputCost: toINR(audioOutputCost),
      cachedInputCost: cachedTextTokens > 0 ? toINR(cachedTextCost) : undefined,
      nonCachedInputCost: nonCachedTextTokens > 0 ? toINR(nonCachedTextCost) : undefined,
      textOutputCost: summarizationOutputTokens > 0 ? toINR(textOutputCost) : undefined,
    },
    tokens: {
      audioInputTokens,
      audioOutputTokens,
      cachedInputTokens: cachedTextTokens > 0 ? cachedTextTokens : undefined,
      inputTokens: nonCachedTextTokens > 0 ? nonCachedTextTokens : undefined,
      outputTokens: summarizationOutputTokens > 0 ? summarizationOutputTokens : undefined,
    },
  };
}

// 6.5 Voice Analytics (STT + TTT) calculation
export function calculateVoiceAnalyticsTraditional(
  inputs: VoiceAnalyticsInputs,
  models: SelectedModels
): CalculationResult {
  const sttModel = models.stt as STTModel;
  const tttModel = models.ttt as TTTModel;

  const sttPricing = STT_PRICING[sttModel];
  const tttPricing = TTT_PRICING[tttModel];

  const { totalAudioMinutes, numberOfFiles, basePromptLength, outputLength } = inputs;

  // STT Cost
  const sttCost = totalAudioMinutes * sttPricing.costPerMinute;

  // Transcription output becomes TTT input
  const transcriptWords = totalAudioMinutes * MINUTES_TO_WORDS;
  const transcriptTokensPerFile = (transcriptWords / numberOfFiles) * WORDS_TO_TOKENS;

  // TTT Cost per file
  const basePromptTokens = basePromptLength * WORDS_TO_TOKENS;
  const outputTokensPerFile = outputLength * WORDS_TO_TOKENS;

  // Each file = 1 LLM call
  const cachedInputTokens = basePromptTokens * numberOfFiles;
  const nonCachedInputTokens = transcriptTokensPerFile * numberOfFiles;
  const totalOutputTokens = outputTokensPerFile * numberOfFiles;

  const cachedInputCost = cachedInputTokens * perToken(tttPricing.cachedInput);
  const nonCachedInputCost = nonCachedInputTokens * perToken(tttPricing.input);
  const outputCost = totalOutputTokens * perToken(tttPricing.output);

  const tttCost = cachedInputCost + nonCachedInputCost + outputCost;
  const totalCost = sttCost + tttCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      sttCost: toINR(sttCost),
      cachedInputCost: toINR(cachedInputCost),
      nonCachedInputCost: toINR(nonCachedInputCost),
      textOutputCost: toINR(outputCost),
    },
    tokens: {
      inputTokens: nonCachedInputTokens,
      cachedInputTokens,
      outputTokens: totalOutputTokens,
    },
  };
}

// 6.6 Voice Analytics (STT Omni) calculation
export function calculateVoiceAnalyticsOmni(
  inputs: VoiceAnalyticsInputs,
  models: SelectedModels
): CalculationResult {
  const audioOmniModel = models.audioOmni as AudioOmniModel;
  const omniPricing = AUDIO_OMNI_PRICING[audioOmniModel];

  const { totalAudioMinutes, numberOfFiles, basePromptLength, outputLength } = inputs;

  // Audio input tokens per file
  const audioInputTokensPerFile = (totalAudioMinutes / numberOfFiles) * MINUTES_TO_AUDIO_TOKENS;
  const totalAudioInputTokens = audioInputTokensPerFile * numberOfFiles;

  // Base prompt (text)
  const basePromptTokens = basePromptLength * WORDS_TO_TOKENS;
  const textInputTokens = basePromptTokens * numberOfFiles;

  // Text output
  const outputTokensPerFile = outputLength * WORDS_TO_TOKENS;
  const totalOutputTokens = outputTokensPerFile * numberOfFiles;

  // Check if model supports caching (gpt-realtime models have textCached, gpt-audio models don't)
  const supportsCaching = 'textCached' in omniPricing;

  // Costs
  const audioInputCost = totalAudioInputTokens * perToken(omniPricing.audioInput);
  const textOutputCost = totalOutputTokens * perToken(omniPricing.textOutput);

  // Text input cost: cached rate if supported, otherwise full input rate
  let cachedTextCost = 0;
  let nonCachedTextCost = 0;
  if (supportsCaching) {
    cachedTextCost = textInputTokens * perToken((omniPricing as typeof AUDIO_OMNI_PRICING['gpt-realtime']).textCached);
  } else {
    nonCachedTextCost = textInputTokens * perToken(omniPricing.textInput);
  }

  const totalCost = audioInputCost + cachedTextCost + nonCachedTextCost + textOutputCost;

  return {
    costs: {
      totalCost: toINR(totalCost),
      audioInputCost: toINR(audioInputCost),
      cachedInputCost: supportsCaching ? toINR(cachedTextCost) : undefined,
      nonCachedInputCost: supportsCaching ? undefined : toINR(nonCachedTextCost),
      textOutputCost: toINR(textOutputCost),
    },
    tokens: {
      audioInputTokens: totalAudioInputTokens,
      cachedInputTokens: supportsCaching ? textInputTokens : undefined,
      inputTokens: supportsCaching ? undefined : textInputTokens,
      outputTokens: totalOutputTokens,
    },
  };
}

// Main calculation dispatcher
export function calculate(
  modelType: ModelType,
  inputs: ChatbotInputs | VoicebotInputs | VoiceAnalyticsInputs,
  models: SelectedModels
): CalculationResult {
  switch (modelType) {
    case 'ttt':
      return calculateChatbot(inputs as ChatbotInputs, models);
    case 'stt-ttt-tts':
      return calculateVoicebotTraditional(inputs as VoicebotInputs, models);
    case 'omni-text-tts':
      return calculateVoicebotOmni(inputs as VoicebotInputs, models);
    case 'sts':
      return calculateVoicebotSTS(inputs as VoicebotInputs, models);
    case 'stt-ttt':
      return calculateVoiceAnalyticsTraditional(inputs as VoiceAnalyticsInputs, models);
    case 'stt-omni':
      return calculateVoiceAnalyticsOmni(inputs as VoiceAnalyticsInputs, models);
    default:
      throw new Error(`Unknown model type: ${modelType}`);
  }
}
