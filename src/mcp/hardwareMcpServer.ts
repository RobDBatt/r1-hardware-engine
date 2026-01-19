import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { HardwareScanner } from "../utils/hardwareScanner";
import { ModelMatrix, Quantization, QUANT_BITS, ModelCalculator } from "../utils/modelMatrix";
import { AffiliateMapper } from "../utils/affiliateMapper";
import { LicenseService } from "../utils/licenseService";
import { ComplianceAudit } from "../utils/complianceAudit";

const TPS_THRESHOLD_OPTIMAL = 15;
const TPS_THRESHOLD_DEGRADED = 5;

export class HardwareMcpServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "antigravity-gpu-optimizer", version: "1.2.0" },
            { capabilities: { tools: {} } }
        );

        this.setupHandlers();
    }

    private getPerformanceTier(predictedTPS: number): string {
        if (predictedTPS >= TPS_THRESHOLD_OPTIMAL) return "Optimal";
        if (predictedTPS >= TPS_THRESHOLD_DEGRADED) return "Degraded (Slow Reasoning)";
        return "Non-Viable (Decoupled)";
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== "get_hardware_limit") {
                throw new Error("Tool not found");
            }

            const { targetContext } = request.params.arguments as { targetContext: number };
            const hardware = await HardwareScanner.getVRAM();
            const isPro = LicenseService.isPro();
            const kvBytes = LicenseService.getKVBytesPerParam();
            const recommendations = [];

            for (const model of ModelMatrix.getModels()) {
                const quants = isPro ? Object.values(Quantization) : [Quantization.Q4_K_M];

                for (const quant of quants) {
                    const weightSize = ModelMatrix.getWeightVRAM(model.id, quant);
                    const cacheSize = ModelMatrix.calculateMLACache(model.id, targetContext, kvBytes);
                    const totalNeeded = weightSize + cacheSize + 0.8;
                    const fits = totalNeeded <= hardware.free;
                    const bitsPerWeight = QUANT_BITS[quant];

                    const tps = ModelCalculator.predictTPS(hardware.bandwidth, model.activeParams, bitsPerWeight, fits);
                    const tier = this.getPerformanceTier(tps);

                    recommendations.push({
                        model: model.name,
                        quant: quant,
                        estimatedTPS: Math.round(tps),
                        performanceTier: tier,
                        vramUsage: `${totalNeeded.toFixed(2)}GB / ${hardware.free.toFixed(2)}GB`,
                        spillingToRAM: !fits,
                        remediation: (tier === "Non-Viable (Decoupled)") ?
                            AffiliateMapper.getRecommendation(hardware.free, totalNeeded) : undefined
                    });
                }
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        recommendations,
                        capabilities: LicenseService.getCapabilities(),
                        compliance: ComplianceAudit.generateReceipt(hardware.gpuModel)
                    }, null, 2)
                }]
            };
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
