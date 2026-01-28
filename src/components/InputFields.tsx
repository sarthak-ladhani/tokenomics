import type { Product, SessionUnit, HistoryMode } from '../types';

interface InputFieldsProps {
  product: Product;
  modelType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputs: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInputChange: (field: string, value: any) => void;
}

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  step?: number;
}

function NumberInput({ label, value, onChange, description, min = 0, step = 1 }: NumberInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        step={step}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}

function SelectInput({ label, value, onChange, options, description }: SelectInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

export function InputFields({ product, inputs, onInputChange }: InputFieldsProps) {
  const sessionUnitOptions = [
    { value: 'minute', label: 'Minute' },
    { value: '1hr', label: '1 Hour' },
    { value: '24hr', label: '24 Hours' },
  ];

  const historyModeOptions = [
    { value: 'summary', label: 'Running Summary (cached)' },
    { value: 'full', label: 'Full History (not cached)' },
  ];

  const showSummaryFields = inputs.historyMode === 'summary';

  // Chatbot inputs
  if (product === 'chatbot') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SelectInput
          label="Session Unit"
          value={inputs.sessionUnit}
          onChange={(v) => onInputChange('sessionUnit', v as SessionUnit)}
          options={sessionUnitOptions}
          description="Display unit for user context"
        />
        <NumberInput
          label="Words per Session"
          value={inputs.wordsPerSession}
          onChange={(v) => onInputChange('wordsPerSession', v)}
          description="Total words (input + output) in a session"
        />
        <NumberInput
          label="Output:Input Ratio"
          value={inputs.outputInputRatio}
          onChange={(v) => onInputChange('outputInputRatio', v)}
          description="e.g., 0.5 means output is half of input"
          step={0.1}
        />
        <NumberInput
          label="Number of Exchanges"
          value={inputs.numberOfExchanges}
          onChange={(v) => onInputChange('numberOfExchanges', v)}
          description="1 exchange = 1 user message + 1 assistant response"
          min={1}
        />
        <NumberInput
          label="Base Prompt Length (words)"
          value={inputs.basePromptLength}
          onChange={(v) => onInputChange('basePromptLength', v)}
          description="System prompt, always cached"
        />
        <SelectInput
          label="Conversation History Mode"
          value={inputs.historyMode}
          onChange={(v) => onInputChange('historyMode', v as HistoryMode)}
          options={historyModeOptions}
        />
        {showSummaryFields && (
          <>
            <NumberInput
              label="Summary Length (words)"
              value={inputs.summaryLength}
              onChange={(v) => onInputChange('summaryLength', v)}
              description="Fixed summary size sent each exchange"
            />
            <NumberInput
              label="Summary Refresh Frequency"
              value={inputs.summaryRefreshFrequency}
              onChange={(v) => onInputChange('summaryRefreshFrequency', v)}
              description="Summarize every N exchanges"
              min={1}
            />
          </>
        )}
      </div>
    );
  }

  // Voicebot inputs
  if (product === 'voicebot') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NumberInput
          label="Session Duration (minutes)"
          value={inputs.sessionDuration}
          onChange={(v) => onInputChange('sessionDuration', v)}
          description="Total voice session length"
          step={0.5}
        />
        <SelectInput
          label="Session Unit"
          value={inputs.sessionUnit}
          onChange={(v) => onInputChange('sessionUnit', v as SessionUnit)}
          options={sessionUnitOptions}
          description="Display unit"
        />
        <NumberInput
          label="Output:Input Ratio"
          value={inputs.outputInputRatio}
          onChange={(v) => onInputChange('outputInputRatio', v)}
          description="Ratio of assistant words to user words"
          step={0.1}
        />
        <NumberInput
          label="Number of Exchanges"
          value={inputs.numberOfExchanges}
          onChange={(v) => onInputChange('numberOfExchanges', v)}
          description="Turns in conversation"
          min={1}
        />
        <NumberInput
          label="Base Prompt Length (words)"
          value={inputs.basePromptLength}
          onChange={(v) => onInputChange('basePromptLength', v)}
          description="System prompt (cached)"
        />
        <SelectInput
          label="Conversation History Mode"
          value={inputs.historyMode}
          onChange={(v) => onInputChange('historyMode', v as HistoryMode)}
          options={historyModeOptions}
        />
        {showSummaryFields && (
          <>
            <NumberInput
              label="Summary Length (words)"
              value={inputs.summaryLength}
              onChange={(v) => onInputChange('summaryLength', v)}
              description="Fixed summary size sent each exchange"
            />
            <NumberInput
              label="Summary Refresh Frequency"
              value={inputs.summaryRefreshFrequency}
              onChange={(v) => onInputChange('summaryRefreshFrequency', v)}
              description="Summarize every N exchanges"
              min={1}
            />
          </>
        )}
      </div>
    );
  }

  // Voice Analytics inputs
  if (product === 'voice-analytics') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NumberInput
          label="Total Audio Minutes"
          value={inputs.totalAudioMinutes}
          onChange={(v) => onInputChange('totalAudioMinutes', v)}
          description="Total audio to analyze"
          step={0.5}
        />
        <NumberInput
          label="Number of Files"
          value={inputs.numberOfFiles}
          onChange={(v) => onInputChange('numberOfFiles', v)}
          description="Number of separate audio files (each <30 min)"
          min={1}
        />
        <NumberInput
          label="Base Prompt Length (words)"
          value={inputs.basePromptLength}
          onChange={(v) => onInputChange('basePromptLength', v)}
          description="Analysis instructions, parameters (cached)"
        />
        <NumberInput
          label="Output Length (words)"
          value={inputs.outputLength}
          onChange={(v) => onInputChange('outputLength', v)}
          description="Expected analysis report length per file"
        />
      </div>
    );
  }

  return null;
}
