import type { CalculationResult } from '../types';

interface ResultsProps {
  results: CalculationResult;
  product: string;
  modelType: string;
}

function formatCost(cost: number | undefined): string {
  if (cost === undefined || cost === null) return '-';
  return `₹${cost.toFixed(4)}`;
}

function formatTokens(tokens: number | undefined): string {
  if (tokens === undefined || tokens === null) return '-';
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(2)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(2)}K`;
  }
  return tokens.toFixed(0);
}

interface CostRowProps {
  label: string;
  value: number | undefined;
  isTotal?: boolean;
  indent?: boolean;
}

function CostRow({ label, value, isTotal = false, indent = false }: CostRowProps) {
  if (value === undefined || value === 0) return null;

  return (
    <div className={`flex justify-between py-2 ${isTotal ? 'border-t border-gray-300 font-bold text-lg' : ''} ${indent ? 'pl-4 text-gray-600' : ''}`}>
      <span className={indent ? 'text-sm' : ''}>{indent ? '↳ ' : ''}{label}</span>
      <span className={isTotal ? 'text-indigo-600' : ''}>{formatCost(value)}</span>
    </div>
  );
}

interface TokenRowProps {
  label: string;
  value: number | undefined;
}

function TokenRow({ label, value }: TokenRowProps) {
  if (value === undefined || value === 0) return null;

  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-mono">{formatTokens(value)}</span>
    </div>
  );
}

export function Results({ results }: ResultsProps) {
  const { costs, tokens } = results;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Cost Breakdown</h2>
        <p className="text-indigo-100 text-sm">Per session</p>
      </div>

      <div className="p-6">
        {/* Total Cost - Prominent Display */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="text-sm text-indigo-600 font-medium">Total Cost per Session</div>
          <div className="text-3xl font-bold text-indigo-700">{formatCost(costs.totalCost)}</div>
        </div>

        {/* Cost Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cost Details</h3>
          <div className="divide-y divide-gray-100">
            {/* STT Cost */}
            <CostRow label="STT Cost" value={costs.sttCost} indent />

            {/* Audio Input Cost */}
            <CostRow label="Audio Input Cost" value={costs.audioInputCost} indent />

            {/* Cached Input Cost */}
            <CostRow label="Cached Input Cost" value={costs.cachedInputCost} indent />

            {/* Non-cached Input Cost */}
            <CostRow label="Non-cached Input Cost" value={costs.nonCachedInputCost} indent />

            {/* Text Input Cost */}
            <CostRow label="Text Input Cost" value={costs.textInputCost} indent />

            {/* Output Cost */}
            <CostRow label="Output Cost" value={costs.outputCost} indent />

            {/* Text Output Cost */}
            <CostRow label="Text Output Cost" value={costs.textOutputCost} indent />

            {/* Audio Output Cost */}
            <CostRow label="Audio Output Cost" value={costs.audioOutputCost} indent />

            {/* TTS Cost */}
            <CostRow label="TTS Cost" value={costs.ttsCost} indent />

            {/* Total */}
            <CostRow label="Total" value={costs.totalCost} isTotal />
          </div>
        </div>

        {/* Token Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Token Usage</h3>
          <div className="bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
            <TokenRow label="Input Tokens" value={tokens.inputTokens} />
            <TokenRow label="Cached Input Tokens" value={tokens.cachedInputTokens} />
            <TokenRow label="Output Tokens" value={tokens.outputTokens} />
            <TokenRow label="Audio Input Tokens" value={tokens.audioInputTokens} />
            <TokenRow label="Audio Output Tokens" value={tokens.audioOutputTokens} />
          </div>
        </div>

        {/* Note about currency */}
        <p className="mt-4 text-xs text-gray-400 text-center">
          All costs displayed in INR (₹). Rounded to 4 decimal places.
        </p>
      </div>
    </div>
  );
}
