"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareMcpServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const hardwareScanner_1 = require("../utils/hardwareScanner");
const modelMatrix_1 = require("../utils/modelMatrix");
const affiliateMapper_1 = require("../utils/affiliateMapper");
const licenseService_1 = require("../utils/licenseService");
const complianceAudit_1 = require("../utils/complianceAudit");
const TPS_THRESHOLD_OPTIMAL = 15;
const TPS_THRESHOLD_DEGRADED = 5;
class HardwareMcpServer {
    constructor() {
        this.server = new index_js_1.Server({ name: "antigravity-gpu-optimizer", version: "1.2.0" }, { capabilities: { tools: {} } });
        this.setupHandlers();
    }
    getPerformanceTier(predictedTPS) {
        if (predictedTPS >= TPS_THRESHOLD_OPTIMAL)
            return "Optimal";
        if (predictedTPS >= TPS_THRESHOLD_DEGRADED)
            return "Degraded (Slow Reasoning)";
        return "Non-Viable (Decoupled)";
    }
    setupHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "get_hardware_limit",
                    description: "Checks local GPU VRAM and returns models + sovereign audit.",
                    inputSchema: {
                        type: "object",
                        properties: {
                            targetContext: { type: "number" }
                        },
                        required: ["targetContext"]
                    }
                }
            ]
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            if (request.params.name !== "get_hardware_limit") {
                throw new Error("Tool not found");
            }
            const { targetContext } = request.params.arguments;
            const hardware = await hardwareScanner_1.HardwareScanner.getVRAM();
            const isPro = licenseService_1.LicenseService.isPro();
            const kvBytes = licenseService_1.LicenseService.getKVBytesPerParam();
            const recommendations = [];
            for (const model of modelMatrix_1.ModelMatrix.getModels()) {
                const quants = isPro ? Object.values(modelMatrix_1.Quantization) : [modelMatrix_1.Quantization.Q4_K_M];
                for (const quant of quants) {
                    const weightSize = modelMatrix_1.ModelMatrix.getWeightVRAM(model.id, quant);
                    const cacheSize = modelMatrix_1.ModelMatrix.calculateMLACache(model.id, targetContext, kvBytes);
                    const totalNeeded = weightSize + cacheSize + 0.8;
                    const fits = totalNeeded <= hardware.free;
                    const bitsPerWeight = modelMatrix_1.QUANT_BITS[quant];
                    const tps = modelMatrix_1.ModelCalculator.predictTPS(hardware.bandwidth, model.activeParams, bitsPerWeight, fits);
                    const tier = this.getPerformanceTier(tps);
                    recommendations.push({
                        model: model.name,
                        quant: quant,
                        estimatedTPS: Math.round(tps),
                        performanceTier: tier,
                        vramUsage: `${totalNeeded.toFixed(2)}GB / ${hardware.free.toFixed(2)}GB`,
                        spillingToRAM: !fits,
                        remediation: (tier === "Non-Viable (Decoupled)") ?
                            affiliateMapper_1.AffiliateMapper.getRecommendation(hardware.free, totalNeeded) : undefined
                    });
                }
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            recommendations,
                            capabilities: licenseService_1.LicenseService.getCapabilities(),
                            compliance: complianceAudit_1.ComplianceAudit.generateReceipt(hardware.gpuModel)
                        }, null, 2)
                    }]
            };
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
    }
}
exports.HardwareMcpServer = HardwareMcpServer;
//# sourceMappingURL=hardwareMcpServer.js.map