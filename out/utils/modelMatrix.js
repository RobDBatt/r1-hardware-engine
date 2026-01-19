"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMatrix = exports.ModelCalculator = exports.QUANT_BITS = exports.Quantization = exports.R1_MATRIX = void 0;
exports.R1_MATRIX = {
    'DeepSeek-R1-Distill-Qwen-1.5B': {
        name: 'R1-1.5B (Distilled)',
        paramsB: 1.5,
        layers: 28,
        hiddenSize: 1536,
        latentDim: 128, // Scaled for small model
        vramGB: {
            'Q4_K_M': 1.1,
            'Q8_0': 1.8,
            'IQ4_XS': 1.0
        }
    },
    'DeepSeek-R1-Distill-Qwen-7B': {
        name: 'R1-7B (Distilled)',
        paramsB: 7,
        layers: 28,
        hiddenSize: 3584,
        latentDim: 256,
        vramGB: {
            'Q4_K_M': 4.7,
            'Q8_0': 7.5,
            'IQ4_XS': 4.3
        }
    },
    'DeepSeek-R1-Distill-Qwen-14B': {
        name: 'R1-14B (Distilled)',
        paramsB: 14,
        layers: 40,
        hiddenSize: 5120,
        latentDim: 512,
        vramGB: {
            'Q4_K_M': 9.1,
            'Q8_0': 15.2,
            'IQ4_XS': 8.2
        }
    },
    'DeepSeek-R1-Distill-Qwen-32B': {
        name: 'R1-32B (Distilled)',
        paramsB: 32,
        layers: 64,
        hiddenSize: 5120,
        latentDim: 512,
        vramGB: {
            'Q4_K_M': 20.2,
            'Q8_0': 34.5,
            'IQ4_XS': 18.1
        }
    },
    'DeepSeek-R1-Distill-Llama-70B': {
        name: 'R1-70B (Distilled)',
        paramsB: 70,
        layers: 80,
        hiddenSize: 8192,
        latentDim: 512,
        vramGB: {
            'Q4_K_M': 43.1,
            'Q8_0': 74.9,
            'IQ4_XS': 39.5
        }
    },
    'DeepSeek-R1-Full': {
        name: 'R1-671B (MoE)',
        paramsB: 671,
        layers: 61,
        hiddenSize: 7168,
        latentDim: 512,
        vramGB: {
            'Q4_K_M': 404.0,
            'Q8_0': 710.0,
            'IQ4_XS': 365.0
        }
    }
};
var Quantization;
(function (Quantization) {
    Quantization["Q4_K_M"] = "Q4_K_M";
    Quantization["Q8_0"] = "Q8_0";
    Quantization["IQ4_XS"] = "IQ4_XS";
})(Quantization || (exports.Quantization = Quantization = {}));
exports.QUANT_BITS = {
    [Quantization.Q4_K_M]: 4.5, // Heuristic for M quantization
    [Quantization.Q8_0]: 8,
    [Quantization.IQ4_XS]: 4.25
};
class ModelCalculator {
    /**
     * MLA (Multi-Head Latent Attention) Reasoning Buffer Calculation
     * Formula: (Layer Count * Latent Dimension * bytesPerParam) / 1024^3
     */
    static calculateReasoningBufferGB(model, tokenCount = 1024, bytesPerParam = 2) {
        // Standard MLA cache formula: (Layers * LatentDim * BytesPerParam * TokenCount)
        return (model.layers * model.latentDim * bytesPerParam * tokenCount) / (1024 ** 3);
    }
    /**
     * Refined TPS Heuristic
     * bandwidth / (active_params * (bits_per_weight / 8))
     */
    static predictTPS(bandwidthGBs, activeParamsB, bitsPerWeight, fitsInVRAM) {
        if (!fitsInVRAM) {
            return 2 + Math.random() * 3; // 2-5 TPS for RAM spilling
        }
        const bytesPerWeight = bitsPerWeight / 8;
        return bandwidthGBs / (activeParamsB * bytesPerWeight);
    }
}
exports.ModelCalculator = ModelCalculator;
class ModelMatrix {
    static getModels() {
        return Object.entries(exports.R1_MATRIX).map(([id, model]) => {
            // For R1-671B MoE, active parameters are approx 37B
            const activeParams = id === 'DeepSeek-R1-Full' ? 37 : model.paramsB;
            return {
                id,
                activeParams,
                ...model
            };
        });
    }
    static getWeightVRAM(modelId, quant) {
        return exports.R1_MATRIX[modelId]?.vramGB[quant] || 0;
    }
    static calculateMLACache(modelId, targetContext, bytesPerParam = 2) {
        const model = exports.R1_MATRIX[modelId];
        if (!model)
            return 0;
        return ModelCalculator.calculateReasoningBufferGB(model, targetContext, bytesPerParam);
    }
}
exports.ModelMatrix = ModelMatrix;
//# sourceMappingURL=modelMatrix.js.map