# R1 Hardware Engine
> **Verification Note:** This repository is linked to the Open VSX namespace claim issue: 
> https://github.com/EclipseFdn/open-vsx.org/issues/7489

This extension provides local-first hardware orchestration for DeepSeek-R1 models.

## Features

### 1. Hardware Autodetect
- Automatically detects GPU VRAM and system memory bandwidth.
- Supports NVIDIA GPUs (via `nvidia-smi`) and Apple Silicon (Unified Memory).

### 2. The R1-Matrix
- Comprehensive lookup for DeepSeek-R1 variants: 14B, 32B, 70B, and 671B (Full MoE).
- Precise VRAM requirements for `Q4_K_M`, `Q8_0`, and `IQ4_XS` quantizations.

### 3. MLA KV-Cache Logic
- Implements the "Reasoning Buffer" calculation using the MLA (Multi-Head Latent Attention) formula.
- Predicts VRAM pressure based on context length.

### 4. Hardware Dashboard
- "VRAM Heatmap" sidebar view.
- Real-time compatibility status (Fits in VRAM vs. Spilling to RAM).
- **Auto-Config Button**: Writes optimized settings to `.agent-settings`.

### 5. Reasoning Artifacts
- Streams `<think>` blocks into a dedicated, terminal-style window.
- Decouples reasoning traces from the main chat for cleaner UI.

### 6. MCP Integration
- Exposes `get_hardware_limit` tool to other agents via Model Context Protocol.
- **Enterprise Ready**: Includes local-only compliance signals and data-egress verification.
- **Pro Features**: Support for advanced quantization (IQ4_XS, Q8_0) and multi-GPU orchestration.

## Business & Enterprise Logic

### 🚀 Monetization Hooks
The engine identifies "Moments of Pain" where local hardware is insufficient and provides explicit **Upgrade Paths**:
- **Local Upgrade**: Recommendations for RTX 4090 / RTX 6000 Ada with affiliate-ready deep links.
- **Cloud Transition**: Latency-aware suggestions for A100/H100 clusters via verified partners.

### 🛡️ Enterprise Compliance
Provides a first-class `compliance` artifact in every agent response:
- `dataEgress: false` - Verified no data leaves the machine.
- `modelExecution: local-only` - Weights remained on-device.
- `auditHash` - A unique SHA-256 footprint for security logging.

### 💎 Pro vs Free Tiers
- **Free**: Provides standard Q4_K_M metrics and VRAM heatmap.
- **Pro**: Unlocks KV-Cache Quantization, detailed Multi-GPU load balancing, and Enterprise Audit Reports.

## Hardware Calculations

### Reasoning Buffer (MLA)
Formula used: `(Layers * LatentDim * 2 bytes) / 1024^3` GB per 1k tokens.

### Performance Tiering
- **Optimal (≥15 TPS)**: Recommended for real-time vibe coding.
- **Degraded (≥5 TPS)**: Suitable for deep architecture reasoning.
- **Non-Viable**: Triggers upgrade path logic.

## 🤝 Community Intelligence
Our performance heuristics are powered by the community. To maintain a **Privacy First** approach, we do not use telemetry. Instead, users can voluntarily "Tune the Matrix" by sharing performance benchmarks via GitHub issues.

If you encounter unusual performance (low TPS or high latency) on hardware that should be capable, please use the **"Tune the Matrix"** button in the dashboard to help us recalibrate the engine for everyone.

## Configuration
Model settings are saved to `.agent-settings` in the project root:
```json
{
  "model": "DeepSeek-R1-Distill-Qwen-32B",
  "quantization": "Q4_K_M",
  "timestamp": "2026-01-18T..."
}
```

## 🛣️ Roadmap (v1.1+)
- **Multi-GPU Orchestration**: Distributed KV-cache and model weight splitting across multiple local GPUs.
- **Automated Quantization Selection**: Real-time calibration based on current VRAM pressure vs. required logic depth.
- **Enterprise "Air-Gapped" Mode**: Hardened compliance receipts and local-only model download management.
- **Virtualized High-Context Artifacts**: Enhanced virtual scrolling for context windows up to 128k.
