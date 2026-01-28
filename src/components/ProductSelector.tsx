import type { ReactNode } from 'react';
import { Dropdown } from './Dropdown';
import type {
  Product,
  ModelType,
  SelectedModels,
  TTTModel,
  STTModel,
  TTSModel,
  STSModel,
  AudioOmniModel,
} from '../types';
import {
  PRODUCT_DISPLAY_NAMES,
  MODEL_TYPE_DISPLAY_NAMES,
  MODEL_DISPLAY_NAMES,
  PRODUCT_MODEL_TYPES,
  MODEL_TYPE_COMPONENTS,
  DEFAULT_MODELS,
  TTT_PRICING,
  STT_PRICING,
  TTS_PRICING,
  STS_PRICING,
  AUDIO_OMNI_PRICING,
} from '../config/pricing';

interface ProductSelectorProps {
  product: Product | null;
  modelType: ModelType | null;
  selectedModels: SelectedModels;
  onProductChange: (product: Product) => void;
  onModelTypeChange: (modelType: ModelType) => void;
  onModelsChange: (models: SelectedModels) => void;
}

export function ProductSelector({
  product,
  modelType,
  selectedModels,
  onProductChange,
  onModelTypeChange,
  onModelsChange,
}: ProductSelectorProps) {
  // Product options
  const productOptions = Object.entries(PRODUCT_DISPLAY_NAMES).map(([value, label]) => ({
    value,
    label,
  }));

  // Model type options (filtered by product)
  const modelTypeOptions = product
    ? PRODUCT_MODEL_TYPES[product].map((mt) => ({
        value: mt,
        label: MODEL_TYPE_DISPLAY_NAMES[mt],
      }))
    : [];

  // Get required model components for current model type
  const requiredComponents = modelType ? MODEL_TYPE_COMPONENTS[modelType] : {};

  // TTT model options
  const tttOptions = Object.keys(TTT_PRICING).map((model) => ({
    value: model,
    label: MODEL_DISPLAY_NAMES[model as TTTModel],
  }));

  // STT model options
  const sttOptions = Object.keys(STT_PRICING).map((model) => ({
    value: model,
    label: MODEL_DISPLAY_NAMES[model as STTModel],
  }));

  // TTS model options
  const ttsOptions = Object.keys(TTS_PRICING).map((model) => ({
    value: model,
    label: MODEL_DISPLAY_NAMES[model as TTSModel],
  }));

  // STS model options
  const stsOptions = Object.keys(STS_PRICING).map((model) => ({
    value: model,
    label: MODEL_DISPLAY_NAMES[model as STSModel],
  }));

  // Audio Omni model options
  const audioOmniOptions = Object.keys(AUDIO_OMNI_PRICING).map((model) => ({
    value: model,
    label: MODEL_DISPLAY_NAMES[model as AudioOmniModel],
  }));

  const handleProductChange = (value: string) => {
    const newProduct = value as Product;
    onProductChange(newProduct);

    // Auto-select first model type for this product
    const firstModelType = PRODUCT_MODEL_TYPES[newProduct][0];
    onModelTypeChange(firstModelType);

    // Set default models
    const productDefaults = DEFAULT_MODELS[newProduct] as Record<string, SelectedModels>;
    const defaults = productDefaults?.[firstModelType] || {};
    onModelsChange(defaults as SelectedModels);
  };

  const handleModelTypeChange = (value: string) => {
    const newModelType = value as ModelType;
    onModelTypeChange(newModelType);

    // Set default models for this model type
    if (product) {
      const defaults = (DEFAULT_MODELS as any)[product]?.[newModelType] || {};
      onModelsChange(defaults as SelectedModels);
    }
  };

  const handleModelChange = (component: keyof SelectedModels, value: string) => {
    onModelsChange({
      ...selectedModels,
      [component]: value,
    });
  };

  // Build model selection display
  const renderModelSelectors = () => {
    if (!modelType) return null;

    const selectors: ReactNode[] = [];

    if ('ttt' in requiredComponents) {
      selectors.push(
        <span key="ttt" className="inline-flex items-center gap-1">
          <Dropdown
            options={tttOptions}
            value={selectedModels.ttt || null}
            onChange={(v) => handleModelChange('ttt', v)}
            placeholder="Select TTT Model"
          />
        </span>
      );
    }

    if ('stt' in requiredComponents) {
      selectors.push(
        <span key="stt" className="inline-flex items-center gap-1">
          <Dropdown
            options={sttOptions}
            value={selectedModels.stt || null}
            onChange={(v) => handleModelChange('stt', v)}
            placeholder="Select STT Model"
          />
        </span>
      );
    }

    if ('tts' in requiredComponents) {
      selectors.push(
        <span key="tts" className="inline-flex items-center gap-1">
          <Dropdown
            options={ttsOptions}
            value={selectedModels.tts || null}
            onChange={(v) => handleModelChange('tts', v)}
            placeholder="Select TTS Model"
          />
        </span>
      );
    }

    if ('sts' in requiredComponents) {
      selectors.push(
        <span key="sts" className="inline-flex items-center gap-1">
          <Dropdown
            options={stsOptions}
            value={selectedModels.sts || null}
            onChange={(v) => handleModelChange('sts', v)}
            placeholder="Select STS Model"
          />
        </span>
      );
    }

    if ('audioOmni' in requiredComponents) {
      selectors.push(
        <span key="audioOmni" className="inline-flex items-center gap-1">
          <Dropdown
            options={audioOmniOptions}
            value={selectedModels.audioOmni || null}
            onChange={(v) => handleModelChange('audioOmni', v)}
            placeholder="Select Audio Model"
          />
        </span>
      );
    }

    // Join with " + " for multiple models
    return selectors.reduce((prev, curr, idx) => (
      <>
        {prev}
        {idx > 0 && <span className="text-gray-500 mx-1">+</span>}
        {curr}
      </>
    ), <></>);
  };

  return (
    <div className="text-lg md:text-xl text-gray-700 leading-relaxed">
      <p className="flex flex-wrap items-center gap-2">
        <span>I want to calculate the cost of</span>
        <Dropdown
          options={productOptions}
          value={product}
          onChange={handleProductChange}
          placeholder="Product"
        />
        {product && (
          <>
            <span>using</span>
            <Dropdown
              options={modelTypeOptions}
              value={modelType}
              onChange={handleModelTypeChange}
              placeholder="Model Type"
            />
          </>
        )}
        {modelType && (
          <>
            <span>with</span>
            {renderModelSelectors()}
          </>
        )}
      </p>
    </div>
  );
}
