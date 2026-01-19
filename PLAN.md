# Plan: Local LLM Hardware Compatibility & Orchestration Engine

This plan outlines the architecture and implementation phases for the Antigravity extension designed to solve VRAM confusion for DeepSeek-R1 local deployments.

## 1. Architecture Overview

The extension follows a 4-layer "Nervous System" architecture:

| Layer | Component | Purpose |
| :--- | :--- | :--- |
| **Sensor** | `hardwareScanner.ts` | Detects GPU VRAM, Models, and Memory Bandwidth. |
| **Knowledge** | `modelMatrix.ts` | R1 architecture constants (MoE vs Dense) and MLA cache formulas. |
| **Interface** | `hardwareMcpServer.ts` | Exposes `get_hardware_limit` tool to Antigravity Agents via MCP. |
| **Display** | `views/*` | Dashboard for VRAM heatmap and optimized reasoning artifact window. |

## 2. Implementation Phases

### Phase 1: Hardware Intelligence
- [x] **Windows/Linux**: `nvidia-smi` integration for precise VRAM metrics.
- [x] **macOS**: `system_profiler` for Apple Silicon Unified Memory detection.
- [x] **Heuristics**: Bandwidth detection (DDR5 vs LPDDR5x vs HBM).

### Phase 2: The R1 Matrix & Reasoning Logic
- [x] **Coverage**: Full support for 1.5B, 7B, 14B, 32B, 70B, and 671B.
- [x] **MLA Buffer**: Implement KV-cache formula: `(Layers * LatentDim * 2) / 1024^3` per 1k tokens.
- [x] **TPS Predictor**: Refined throughput logic based on active parameters and quantization bits.

### Phase 3: Agentic Interface (MCP)
- [x] **Tool Registration**: `get_hardware_limit` tool definition.
- [x] **Performance Tiering**: Optimal (≥15 TPS), Degraded (≥5 TPS), Non-Viable logic.
- [x] **Agent Advice**: Inline guidance for agents to prioritize fluid "vibe coding" vs. deep reasoning.

### Phase 4: UI/UX & High-Speed Tracing
- [x] **VRAM Heatmap**: Sidebar view with real-time compatibility status.
- [x] **Priority Toggle**: "Context Priority" vs. "Intelligence Priority" switching.
- [x] **Buffered Rendering**: `requestAnimationFrame` (or `setImmediate`) batched updates for reasoning traces.
- [x] **Virtualization**: Truncation and memory management for traces >5,000 tokens.

### Phase 5: Local Handshake
- [x] **Auto-Config**: Persistence of optimized settings to `.agent-settings`.
- [x] **Packaging**: VSIX generation for easy distribution.

## 3. Technical Constraints & Standards
- **Language**: TypeScript (Node.js 16+).
- **Protocol**: MCP (Model Context Protocol) over StdIO.
- **UI Toolkit**: VS Code Webview UI Toolkit for native look & feel.
- **Optimization**: Zero-lag UI via buffered DOM updates for heavy streaming.

## 4. Next Steps for Final Scaffolding
- Ensure directory structure matches `src/utils`, `src/mcp`, and `src/views`.
- Implement final "Context-to-Quant" toggle logic in the dashboard.
