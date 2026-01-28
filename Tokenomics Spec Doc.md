
# Tokenomics Calculator — Product Specification

## 1. Overview

Tokenomics is a calculator that predicts AI costs for conversational AI products based on usage parameters. It supports three product types: Chatbot, Voicebot, and Voice Analytics.

---

## 2. UI Flow

### 2.1 Entry Point

User sees a single sentence with dropdowns:

> "I want to calculate the cost of **[Product]** using **[Model Type(s)]** and **[Model(s)]**"

Each bracketed term is a dropdown. Selections cascade — Model Type options depend on Product, Model options depend on Model Type.

### 2.2 After Selection

Relevant input fields appear below the sentence. User fills inputs and sees calculated outputs via a "Calculate" button.

---

## 3. Product → Model Type → Model Mapping

### 3.1 Products

|Product|Description|
|---|---|
|Chatbot|Text-based conversational AI|
|Voicebot|Voice-based conversational AI (real-time)|
|Voice Analytics|Async analysis of recorded audio|

### 3.2 Model Types by Product

| Product         | Model Type            | Components                                 | Description                               |
| --------------- | --------------------- | ------------------------------------------ | ----------------------------------------- |
| Chatbot         | TTT                   | Text LLM                                   | Standard text-to-text                     |
| Voicebot        | STT + TTT + TTS       | Whisper + Text LLM + TTS                   | Traditional pipeline                      |
| Voicebot        | Omni (text out) + TTS | gpt-audio/gpt-realtime (audio→text) + TTS  | Omni model with text output, separate TTS |
| Voicebot        | STS                   | gpt-realtime/gpt-audio (audio→audio)       | Full speech-to-speech                     |
| Voice Analytics | STT + TTT             | Whisper + Text LLM                         | Transcribe then analyze                   |
| Voice Analytics | STT (Omni)            | gpt-audio or similar (audio→text)          | Direct audio analysis                     |

### 3.3 Models by Model Type

### Text-to-Text (TTT) Models

|Model|Input ($/1M)|Cached Input ($/1M)|Output ($/1M)|Notes|
|---|---|---|---|---|
|gpt-4o|$2.50|$1.25|$10.00|Balanced performance|
|gpt-4o-mini|$0.15|$0.075|$0.60|Budget option|
|gpt-4.1|$2.00|$0.50|$8.00|Latest standard|
|gpt-4.1-mini|$0.40|$0.10|$1.60|Latest mini|
|gpt-4.1-nano|$0.10|$0.025|$0.40|Ultra budget|
|gpt-5|$1.25|$0.125|$10.00|Flagship|
|gpt-5-mini|$0.25|$0.025|$2.00|Flagship mini|
|gpt-5-nano|$0.05|$0.005|$0.40|Flagship nano|

### Realtime / STS Models (Speech-to-Speech)

|Model|Text Input ($/1M)|Text Cached ($/1M)|Text Output ($/1M)|Audio Input ($/1M)|Audio Cached ($/1M)|Audio Output ($/1M)|
|---|---|---|---|---|---|---|
|gpt-realtime|$4.00|$0.40|$16.00|$32.00|$0.40|$64.00|
|gpt-realtime-mini|$0.60|$0.06|$2.40|$10.00|$0.30|$20.00|

### Audio Models (Audio Input/Output)

|Model|Text Input ($/1M)|Text Cached ($/1M)|Text Output ($/1M)|Audio Input ($/1M)|Audio Output ($/1M)|Notes|
|---|---|---|---|---|---|---|
|gpt-audio|$2.50|-|$10.00|$32.00|$64.00|Full size (no caching)|
|gpt-audio-mini|$0.60|-|$2.40|$10.00|$20.00|Mini (no caching)|
|gpt-realtime|$4.00|$0.40|$16.00|$32.00|$64.00|Realtime full size|
|gpt-realtime-mini|$0.60|$0.06|$2.40|$10.00|$20.00|Realtime mini|

### Speech-to-Text (STT)

|Model|Cost|Notes|
|---|---|---|
|Whisper|$0.006 / minute|Standard transcription|
|gpt-4o-transcribe|$0.006 / minute|With diarization option|
|gpt-4o-mini-transcribe|$0.003 / minute|Budget option|

### Text-to-Speech (TTS)

|Model|Cost|Notes|
|---|---|---|
|TTS|$15.00 / 1M characters|Standard|
|TTS HD|$30.00 / 1M characters|High quality|
|gpt-4o-mini-tts|$0.015 / minute|Token-based alternative|

---

## Recommended Default Selections

For each product type, suggest a sensible default:

|Product|Model Type|Default Model(s)|
|---|---|---|
|Chatbot|TTT|gpt-4.1-mini|
|Voicebot|STT + TTT + TTS|Whisper + gpt-4.1-mini + TTS|
|Voicebot|Omni (text out) + TTS|gpt-audio-mini + TTS|
|Voicebot|STS|gpt-realtime-mini|
|Voice Analytics|STT + TTT|Whisper + gpt-4.1-mini|
|Voice Analytics|STT (Omni)|gpt-audio-mini|

---

## Model Selection Dropdowns (UI)

**For TTT component:**

- gpt-5
- gpt-5-mini
- gpt-5-nano
- gpt-4.1
- gpt-4.1-mini
- gpt-4.1-nano
- gpt-4o
- gpt-4o-mini

**For STT component:**

- Whisper ($0.006/min)
- gpt-4o-transcribe ($0.006/min)
- gpt-4o-mini-transcribe ($0.003/min)

**For TTS component:**

- TTS ($15/1M chars)
- TTS HD ($30/1M chars)

**For STS (Realtime) component:**

- gpt-realtime
- gpt-realtime-mini

**For Audio Omni component:**

- gpt-audio
- gpt-audio-mini
- gpt-realtime
- gpt-realtime-mini

---
## 4. Conversion Constants

| Conversion                    | Formula                                           |
| ----------------------------- | ------------------------------------------------- |
| Text: words → tokens          | 3 words = 4 tokens → `tokens = words × (4/3)`     |
| Speech: seconds → words       | 5 sec = 9 words → `words = seconds × (9/5)`       |
| Speech: minutes → words       | `words = minutes × 60 × (9/5) = minutes × 108`    |
| Audio: seconds → audio tokens | 1 sec = 20 tokens → `audio_tokens = seconds × 20` |
| Audio: minutes → audio tokens | `audio_tokens = minutes × 1200`                   |
| TTS: words → characters       | 1 word = 4 characters → `characters = words × 4`  |

---

## 5. Input Fields by Product

### 5.1 Chatbot (TTT)

|Field|Type|Description|
|---|---|---|
|Session unit|Dropdown: Minute, 1 Hr, 24 Hr|Display unit only (for user context)|
|Words per session|Number|Total user input words in a session|
|Output:Input ratio|Number (decimal)|e.g., 0.5 means output is half of input|
|Number of exchanges|Number|One exchange = 1 user message + 1 assistant response|
|Base prompt length|Number (words)|System prompt, always cached|
|Conversation history mode|Dropdown|Option A: Running summary (cached) / Option B: Full history (not cached)|

**If Running Summary selected:**

|Field|Type|Description|
|---|---|---|
|Summary length|Number (words)|Fixed summary size sent each exchange|
|Summary refresh frequency|Number|Summarize every N exchanges (adds summarization cost)|

### 5.2 Voicebot (STT + TTT + TTS / Omni + TTS / STS)

|Field|Type|Description|
|---|---|---|
|Session duration|Number (minutes)|Total voice session length|
|Session unit|Dropdown: Minute, 1 Hr, 24 Hr|Display unit (auto-calculates words)|
|Output:Input ratio|Number (decimal)|Ratio of assistant words to user words|
|Number of exchanges|Number|Turns in conversation|
|Base prompt length|Number (words)|System prompt (cached for TTT/Omni text component)|
|Conversation history mode|Dropdown|Option A: Running summary / Option B: Full history|

**If Running Summary selected:** Same additional fields as Chatbot.

**Auto-calculated from session duration:**

- User words per session = `(duration_minutes × 108) / (1 + output_input_ratio)`
- Assistant words per session = `user_words × output_input_ratio`

### 5.3 Voice Analytics (STT + TTT / STT Omni)

|Field|Type|Description|
|---|---|---|
|Total audio minutes|Number|Total audio to analyze|
|Number of files|Number|Number of separate audio files (each <30 min)|
|Base prompt length|Number (words)|Analysis instructions, parameters (cached)|
|Output length|Number (words)|Expected analysis report length per file|

---

## 6. Calculation Logic

### 6.1 Chatbot (TTT)

### User Input

- `words_per_session` = total words in session (input + output combined)
- `output_input_ratio` = output words / input words

### Deriving Input and Output Words

If ratio = output / input, then:

- total = input + output
- total = input + (input × ratio)
- total = input × (1 + ratio)

Therefore:

```
input_words = words_per_session / (1 + ratio)
output_words = words_per_session - input_words
           OR = input_words × ratio
```

**Example:**

- words_per_session = 300
- ratio = 0.5 (output is half of input)
- input_words = 300 / (1 + 0.5) = 300 / 1.5 = 200
- output_words = 200 × 0.5 = 100
- Check: 200 + 100 = 300 ✓


```
# Inputs
words_per_session = user input (total words, input + output combined)
ratio = output_input_ratio
exchanges = number_of_exchanges
base_prompt_words = base_prompt_length
history_mode = "summary" | "full"

# Derived words
input_words = words_per_session / (1 + ratio)
output_words = input_words × ratio

# Per exchange
input_words_per_exchange = input_words / exchanges
output_words_per_exchange = output_words / exchanges

input_tokens_per_exchange = input_words_per_exchange × (4/3)
output_tokens_per_exchange = output_words_per_exchange × (4/3)
base_prompt_tokens = base_prompt_words × (4/3)

# Cached tokens (per session)
cached_tokens = base_prompt_tokens × exchanges

# If Running Summary
if history_mode == "summary":
    summary_tokens = summary_length_words × (4/3)
    cached_tokens += summary_tokens × exchanges
    # Add summarization cost every N exchanges
    summarization_calls = exchanges / summary_refresh_frequency
    summarization_input = average_history_at_summary_point (estimate)
    summarization_output = summary_tokens
    
# If Full History (not cached, grows each turn)
if history_mode == "full":
    # Exchange 1: input_tokens
    # Exchange 2: input_tokens + previous_input + previous_output
    # Exchange N: input_tokens + sum of all previous (input + output)
    
    cumulative_history_tokens = 0
    total_input_tokens = 0
    
    for i in 1 to exchanges:
        turn_input = input_tokens_per_exchange + cumulative_history_tokens
        total_input_tokens += turn_input
        cumulative_history_tokens += input_tokens_per_exchange + output_tokens_per_exchange
    
    non_cached_input_tokens = total_input_tokens

# Output tokens (same for both modes)
total_output_tokens = output_tokens_per_exchange × exchanges

# Costs
cached_input_cost = cached_tokens × cached_input_price_per_token
non_cached_input_cost = non_cached_input_tokens × input_price_per_token
output_cost = total_output_tokens × output_price_per_token

total_cost = cached_input_cost + non_cached_input_cost + output_cost
```

### 6.2 Voicebot (STT + TTT + TTS)

```
# Inputs
duration_minutes = session_duration
ratio = output_input_ratio
exchanges = number_of_exchanges
base_prompt_words = base_prompt_length

# Derived words
total_words = duration_minutes × 108
user_words = total_words / (1 + ratio)
assistant_words = user_words × ratio

# STT Cost (Whisper) - priced per minute
# User speech duration = user_words / 108 minutes
user_speech_minutes = user_words / 108
stt_cost = user_speech_minutes × whisper_price_per_minute

# TTT Cost (same logic as Chatbot)
# ... use chatbot TTT calculation with user_words as input

# TTS Cost - priced per character
assistant_characters = assistant_words × 4
tts_cost = assistant_characters × tts_price_per_character

total_cost = stt_cost + ttt_cost + tts_cost
```

### 6.3 Voicebot (Omni text out + TTS)

```
# Inputs same as above

# Omni model (audio in, text out)
user_speech_minutes = user_words / 108
audio_input_tokens = user_speech_minutes × 1200

# Text output from Omni
text_output_tokens = assistant_words × (4/3)

# Base prompt is text input (cached)
base_prompt_tokens = base_prompt_words × (4/3)
cached_text_input_tokens = base_prompt_tokens × exchanges

# Costs
audio_input_cost = audio_input_tokens × audio_input_price_per_token
cached_text_cost = cached_text_input_tokens × cached_text_input_price_per_token
text_output_cost = text_output_tokens × text_output_price_per_token

# TTS Cost (separate)
assistant_characters = assistant_words × 4
tts_cost = assistant_characters × tts_price_per_character

# Conversation history handling same as TTT (for text portion)

total_cost = audio_input_cost + cached_text_cost + text_output_cost + tts_cost
```

### 6.4 Voicebot (STS — Speech to Speech)

```
# Inputs same as above

# Audio tokens
user_speech_minutes = user_words / 108
assistant_speech_minutes = assistant_words / 108

audio_input_tokens = user_speech_minutes × 1200
audio_output_tokens = assistant_speech_minutes × 1200

# System prompt is text (cached)
base_prompt_tokens = base_prompt_words × (4/3)
cached_text_input_tokens = base_prompt_tokens × exchanges

# Costs
audio_input_cost = audio_input_tokens × audio_input_price_per_token
audio_output_cost = audio_output_tokens × audio_output_price_per_token
cached_text_cost = cached_text_input_tokens × cached_text_input_price_per_token

total_cost = audio_input_cost + audio_output_cost + cached_text_cost

# Note: No TTS cost — audio output is native
```

### 6.5 Voice Analytics (STT + TTT)

```
# Inputs
total_audio_minutes = user input
num_files = number_of_files
base_prompt_words = base_prompt_length
output_words = output_length

# STT Cost (Whisper)
stt_cost = total_audio_minutes × whisper_price_per_minute

# Transcription output (becomes TTT input)
transcript_words = total_audio_minutes × 108
transcript_tokens_per_file = (transcript_words / num_files) × (4/3)

# TTT Cost (per file)
base_prompt_tokens = base_prompt_words × (4/3)
output_tokens_per_file = output_words × (4/3)

# Each file = 1 LLM call
cached_input_tokens = base_prompt_tokens × num_files
non_cached_input_tokens = transcript_tokens_per_file × num_files
total_output_tokens = output_tokens_per_file × num_files

ttt_cost = (cached_input_tokens × cached_price) + (non_cached_input_tokens × input_price) + (total_output_tokens × output_price)

total_cost = stt_cost + ttt_cost
```

### 6.6 Voice Analytics (STT Omni)

```
# Inputs same as above

# Audio input tokens (direct, no transcription)
audio_input_tokens_per_file = (total_audio_minutes / num_files) × 1200
total_audio_input_tokens = audio_input_tokens_per_file × num_files

# Base prompt (text, cached)
base_prompt_tokens = base_prompt_words × (4/3)
cached_text_tokens = base_prompt_tokens × num_files

# Text output
output_tokens_per_file = output_words × (4/3)
total_output_tokens = output_tokens_per_file × num_files

# Costs
audio_input_cost = total_audio_input_tokens × audio_input_price_per_token
cached_text_cost = cached_text_tokens × cached_text_input_price_per_token
text_output_cost = total_output_tokens × text_output_price_per_token

total_cost = audio_input_cost + cached_text_cost + text_output_cost
```

---

## 7. Output Fields

### 7.1 Chatbot (TTT)

|Output|Description|
|---|---|
|**Total cost per session**|Sum of all costs|
|↳ Cached input cost|Base prompt (+ summary if applicable)|
|↳ Non-cached input cost|User messages + history|
|↳ Output cost|Assistant responses|
|Input tokens per session|Total non-cached input|
|Cached input tokens per session|Total cached|
|Output tokens per session|Total output|

### 7.2 Voicebot (all types)

|Output|Description|
|---|---|
|**Total cost per session**|Sum of all costs|
|↳ STT cost|Whisper cost (if applicable)|
|↳ Cached text input cost|Base prompt|
|↳ Non-cached text input cost|History (if full history mode)|
|↳ Audio input cost|Audio tokens (if Omni/STS)|
|↳ Text output cost|LLM text response|
|↳ Audio output cost|Audio tokens (if STS)|
|↳ TTS cost|Character-based (if separate TTS)|
|Input text tokens per session|—|
|Cached input text tokens per session|—|
|Output text tokens per session|—|
|Input audio tokens per session|—|
|Output audio tokens per session|—|

### 7.3 Voice Analytics

|Output|Description|
|---|---|
|**Total cost per session**|Sum of all costs|
|↳ STT cost|Whisper cost (if STT + TTT)|
|↳ Audio input cost|Audio tokens (if Omni)|
|↳ Cached text input cost|Base prompt × num_files|
|↳ Non-cached text input cost|Transcript tokens (if STT + TTT)|
|↳ Text output cost|Analysis reports|
|Input text tokens per session|—|
|Cached input text tokens per session|—|
|Input audio tokens per session|—|
|Output text tokens per session|—|

---

## 8. Pricing Table (OpenAI)

##### Text-to-Text (TTT) Models

|Model|Input ($/1M)|Cached Input ($/1M)|Output ($/1M)|Notes|
|---|---|---|---|---|
|gpt-4o|$2.50|$1.25|$10.00|Balanced performance|
|gpt-4o-mini|$0.15|$0.075|$0.60|Budget option|
|gpt-4.1|$2.00|$0.50|$8.00|Latest standard|
|gpt-4.1-mini|$0.40|$0.10|$1.60|Latest mini|
|gpt-4.1-nano|$0.10|$0.025|$0.40|Ultra budget|
|gpt-5|$1.25|$0.125|$10.00|Flagship|
|gpt-5-mini|$0.25|$0.025|$2.00|Flagship mini|
|gpt-5-nano|$0.05|$0.005|$0.40|Flagship nano|

##### Realtime / STS Models (Speech-to-Speech)

|Model|Text Input ($/1M)|Text Cached ($/1M)|Text Output ($/1M)|Audio Input ($/1M)|Audio Cached ($/1M)|Audio Output ($/1M)|
|---|---|---|---|---|---|---|
|gpt-realtime|$4.00|$0.40|$16.00|$32.00|$0.40|$64.00|
|gpt-realtime-mini|$0.60|$0.06|$2.40|$10.00|$0.30|$20.00|

### Audio Models (Audio Input/Output)

|Model|Text Input ($/1M)|Text Cached ($/1M)|Text Output ($/1M)|Audio Input ($/1M)|Audio Output ($/1M)|Notes|
|---|---|---|---|---|---|---|
|gpt-audio|$2.50|-|$10.00|$32.00|$64.00|Full size (no caching)|
|gpt-audio-mini|$0.60|-|$2.40|$10.00|$20.00|Mini (no caching)|
|gpt-realtime|$4.00|$0.40|$16.00|$32.00|$64.00|Realtime full size|
|gpt-realtime-mini|$0.60|$0.06|$2.40|$10.00|$20.00|Realtime mini|

### Speech-to-Text (STT)

|Model|Cost|Notes|
|---|---|---|
|Whisper|$0.006 / minute|Standard transcription|
|gpt-4o-transcribe|$0.006 / minute|With diarization option|
|gpt-4o-mini-transcribe|$0.003 / minute|Budget option|

### Text-to-Speech (TTS)

|Model|Cost|Notes|
|---|---|---|
|TTS|$15.00 / 1M characters|Standard|
|TTS HD|$30.00 / 1M characters|High quality|
|gpt-4o-mini-tts|$0.015 / minute|Token-based alternative|

---

## Recommended Default Selections

For each product type, suggest a sensible default:

|Product|Model Type|Default Model(s)|
|---|---|---|
|Chatbot|TTT|gpt-4.1-mini|
|Voicebot|STT + TTT + TTS|Whisper + gpt-4.1-mini + TTS|
|Voicebot|Omni (text out) + TTS|gpt-audio-mini + TTS|
|Voicebot|STS|gpt-realtime-mini|
|Voice Analytics|STT + TTT|Whisper + gpt-4.1-mini|
|Voice Analytics|STT (Omni)|gpt-audio-mini|

---

## Model Selection Dropdowns (UI)

**For TTT component:**

- gpt-5
- gpt-5-mini
- gpt-5-nano
- gpt-4.1
- gpt-4.1-mini
- gpt-4.1-nano
- gpt-4o
- gpt-4o-mini

**For STT component:**

- Whisper ($0.006/min)
- gpt-4o-transcribe ($0.006/min)
- gpt-4o-mini-transcribe ($0.003/min)

**For TTS component:**

- TTS ($15/1M chars)
- TTS HD ($30/1M chars)

**For STS (Realtime) component:**

- gpt-realtime
- gpt-realtime-mini

**For Audio Omni component:**

- gpt-audio
- gpt-audio-mini
- gpt-realtime
- gpt-realtime-mini

---

## 9. Edge Cases and Notes

1. **Caching support**: Display "(caching not supported)" next to models that don't support prompt caching.
    
2. **Minimum charges**: Some APIs have minimum per-request charges. For v1, we ignore this; can add later.
    
3. **Context limits**: If calculated tokens exceed model context window, show a warning. Don't block calculation.
    
4. **Running summary cost**: When user selects running summary mode, include the summarization LLM calls in the cost (every N exchanges).
    
5. **Audio file limit**: Voice Analytics assumes each file is <30 minutes. No validation needed, just documented.
    
6. **Rounding**: Display costs to 4 decimal places for per-session costs (since they may be fractions of a cent).
    
7. **Currency**: Display in INR. Can add currency conversion later.
    1 USD = 91.59 INR
    
8. **Zero handling**: If any input is 0, that component cost should be 0 (not NaN or error).

---

## 10. Future Enhancements (Out of Scope for v1)

- Tool calling cost estimation
- Multi-model comparison (side by side)
- Monthly/annual projections (sessions × frequency)
- Support for Anthropic, Google, other providers
- Export/share calculations
- Saved presets

---

## 11. Technical Notes for Implementation

1. **Framework**: React (single page app)
2. **State management**: Local state sufficient for v1
3. **Styling**: Clean, minimal — calculator aesthetic, not spreadsheet
4. **Responsiveness**: Mobile-friendly
5. **Pricing data**: Store in JSON config for easy updates
6. **Calculations**: Run via Calculate button