import { useState, useCallback } from 'react';
import { ProductSelector } from './components/ProductSelector';
import { InputFields } from './components/InputFields';
import { Results } from './components/Results';
import type {
  Product,
  ModelType,
  SelectedModels,
  CalculationResult,
  ChatbotInputs,
  VoicebotInputs,
  VoiceAnalyticsInputs,
} from './types';
import { calculate } from './utils/calculations';

// Default input values
const DEFAULT_CHATBOT_INPUTS: ChatbotInputs = {
  sessionUnit: 'minute',
  wordsPerSession: 300,
  outputInputRatio: 0.5,
  numberOfExchanges: 10,
  basePromptLength: 200,
  historyMode: 'summary',
  summaryLength: 100,
  summaryRefreshFrequency: 5,
};

const DEFAULT_VOICEBOT_INPUTS: VoicebotInputs = {
  sessionDuration: 5,
  sessionUnit: 'minute',
  outputInputRatio: 1,
  numberOfExchanges: 10,
  basePromptLength: 200,
  historyMode: 'summary',
  summaryLength: 100,
  summaryRefreshFrequency: 5,
};

const DEFAULT_VOICE_ANALYTICS_INPUTS: VoiceAnalyticsInputs = {
  totalAudioMinutes: 30,
  numberOfFiles: 5,
  basePromptLength: 200,
  outputLength: 500,
};

function getDefaultInputs(product: Product): Record<string, any> {
  switch (product) {
    case 'chatbot':
      return { ...DEFAULT_CHATBOT_INPUTS };
    case 'voicebot':
      return { ...DEFAULT_VOICEBOT_INPUTS };
    case 'voice-analytics':
      return { ...DEFAULT_VOICE_ANALYTICS_INPUTS };
    default:
      return {};
  }
}

function App() {
  const [product, setProduct] = useState<Product | null>(null);
  const [modelType, setModelType] = useState<ModelType | null>(null);
  const [selectedModels, setSelectedModels] = useState<SelectedModels>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProductChange = useCallback((newProduct: Product) => {
    setProduct(newProduct);
    setInputs(getDefaultInputs(newProduct));
    setResults(null);
    setError(null);
  }, []);

  const handleModelTypeChange = useCallback((newModelType: ModelType) => {
    setModelType(newModelType);
    setResults(null);
    setError(null);
  }, []);

  const handleModelsChange = useCallback((newModels: SelectedModels) => {
    setSelectedModels(newModels);
    setResults(null);
    setError(null);
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResults(null);
    setError(null);
  }, []);

  const handleCalculate = useCallback(() => {
    if (!product || !modelType) {
      setError('Please select a product and model type');
      return;
    }

    // Validate required inputs based on product
    if (product === 'chatbot') {
      const required = ['wordsPerSession', 'outputInputRatio', 'numberOfExchanges', 'basePromptLength'];
      const missing = required.filter((f) => inputs[f] === undefined || inputs[f] === 0);
      if (missing.length > 0 && !missing.every((f) => f === 'outputInputRatio')) {
        setError(`Please fill in all required fields`);
        return;
      }
    }

    if (product === 'voicebot') {
      const required = ['sessionDuration', 'outputInputRatio', 'numberOfExchanges', 'basePromptLength'];
      const missing = required.filter((f) => inputs[f] === undefined || inputs[f] === 0);
      if (missing.length > 0 && !missing.every((f) => f === 'outputInputRatio')) {
        setError(`Please fill in all required fields`);
        return;
      }
    }

    if (product === 'voice-analytics') {
      const required = ['totalAudioMinutes', 'numberOfFiles', 'basePromptLength', 'outputLength'];
      const missing = required.filter((f) => inputs[f] === undefined || inputs[f] === 0);
      if (missing.length > 0) {
        setError(`Please fill in all required fields`);
        return;
      }
    }

    try {
      const result = calculate(modelType, inputs as any, selectedModels);
      setResults(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
      setResults(null);
    }
  }, [product, modelType, inputs, selectedModels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tokenomics Calculator</h1>
          <p className="mt-1 text-gray-500">Calculate AI costs for conversational AI products</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Selector */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <ProductSelector
            product={product}
            modelType={modelType}
            selectedModels={selectedModels}
            onProductChange={handleProductChange}
            onModelTypeChange={handleModelTypeChange}
            onModelsChange={handleModelsChange}
          />
        </section>

        {/* Input Fields */}
        {product && modelType && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration</h2>
            <InputFields
              product={product}
              modelType={modelType}
              inputs={inputs}
              onInputChange={handleInputChange}
            />

            {/* Calculate Button */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={handleCalculate}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md
                  hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  transition-colors"
              >
                Calculate Cost
              </button>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
            </div>
          </section>
        )}

        {/* Results */}
        {results && product && modelType && (
          <section className="mb-8">
            <Results results={results} product={product} modelType={modelType} />
          </section>
        )}

        {/* Empty State */}
        {!product && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a product type above to begin calculating AI costs for your conversational AI application.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-400">
            Tokenomics Calculator v1.0 | Prices based on OpenAI API pricing | 1 USD = 91.59 INR
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
