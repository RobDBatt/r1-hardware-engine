# Technical FAQ - R1 Hardware Engine

## 1. Why does my TPS not match the prediction?
The TPS prediction is a heuristic based on memory bandwidth and active parameters. Factors like system background processes, thermal throttling, and the specific runner (Ollama vs vLLM) can cause variations. If you see a major discrepancy, please use the "Tune the Matrix" button.

## 2. What is MLA Cache and why does it matter?
Multi-Head Latent Attention (MLA) is a key architectural feature of DeepSeek-R1. It compresses the KV-cache. Our engine calculates exactly how much VRAM this "Reasoning Buffer" will consume based on your target context length.

## 3. Does this extension send my data anywhere?
No. We follow a strict "Sovereign AI" policy. All hardware scanning and performance calculations happen locally on your machine. We have zero telemetry.

## 4. How can I run the 671B model on my 24GB card?
You can't run it entirely in VRAM. However, you can use "Degraded" mode where the model weights are offloaded to system RAM. Expect significantly lower TPS (2-5 TPS).

## 5. What are the Performance Tiers?
- **Optimal (≥15 TPS)**: Smooth, real-time response.
- **Degraded (≥5 TPS)**: Usable but noticeably slower, especially for long reasoning traces.
- **Non-Viable**: Not recommended for local interactive use.
