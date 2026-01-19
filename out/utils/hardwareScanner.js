"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardwareScanner = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const os = __importStar(require("os"));
const vscode = __importStar(require("vscode"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class HardwareScanner {
    /**
     * Legacy method for structured stats.
     */
    static async scan() {
        const platform = os.platform();
        if (platform === 'win32' || platform === 'linux') {
            return await this.scanNvidia();
        }
        else if (platform === 'darwin') {
            return await this.scanMac();
        }
        else {
            return this.getFallbackStats();
        }
    }
    /**
     * Primary API matching the MCP server requirements.
     */
    static async getVRAM() {
        const platform = os.platform();
        let stats;
        if (platform === 'win32' || platform === 'linux') {
            stats = await this.scanNvidia();
        }
        else if (platform === 'darwin') {
            stats = await this.scanMac();
        }
        else {
            stats = this.getFallbackStats();
        }
        return {
            total: stats.vramTotalGB,
            free: stats.vramAvailableGB,
            bandwidth: stats.memoryBandwidthGBs || 50, // Default heuristic
            gpuModel: stats.gpuModel
        };
    }
    static async scanNvidia() {
        try {
            const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader,nounits');
            const [name, total, free] = stdout.trim().split(',').map(s => s.trim());
            return {
                vramTotalGB: parseFloat(total) / 1024,
                vramAvailableGB: parseFloat(free) / 1024,
                gpuModel: name,
                isAppleSilicon: false
            };
        }
        catch (error) {
            console.error('NVIDIA-SMI failed:', error);
            // Fallback to CPU RAM if no NVIDIA GPU found
            return this.getFallbackStats();
        }
    }
    static async scanMac() {
        try {
            // Check if Apple Silicon
            const { stdout: cpuInfo } = await execAsync('sysctl -n machdep.cpu.brand_string');
            const isAppleSilicon = cpuInfo.includes('Apple');
            // Get total memory (Unified Memory for Apple Silicon)
            const { stdout: memInfo } = await execAsync('sysctl -n hw.memsize');
            const totalMemoryGB = parseInt(memInfo) / (1024 ** 3);
            // Get GPU info
            const { stdout: gpuInfo } = await execAsync('system_profiler SPDisplaysDataType');
            const gpuLines = gpuInfo.split('\n');
            const gpuModel = gpuLines.find(line => line.includes('Chipset Model'))?.split(':')[1].trim() || 'Apple GPU';
            return {
                vramTotalGB: totalMemoryGB, // Apple Silicon uses Unified Memory
                vramAvailableGB: totalMemoryGB * 0.7, // Heuristic: ~70% available for LLM
                gpuModel: gpuModel,
                isAppleSilicon: isAppleSilicon
            };
        }
        catch (error) {
            console.error('Mac hardware scan failed:', error);
            return this.getFallbackStats();
        }
    }
    /**
     * Detects unusual performance drops and encourages community reporting.
     */
    static async reportPerformance(tps, ttft) {
        if (this._anomalyReported)
            return;
        const stats = await this.scan();
        const isHighEnd = stats.gpuModel.includes('3090') ||
            stats.gpuModel.includes('4090') ||
            stats.gpuModel.includes('A100') ||
            stats.gpuModel.includes('M2 Max') ||
            stats.gpuModel.includes('M3 Max');
        if (isHighEnd && (tps < 2 || ttft > 10)) {
            this._anomalyReported = true;
            const selection = await vscode.window.showInformationMessage("Unusual performance detected. Help us tune the heuristics for your hardware by sharing a report.", "Share Report");
            if (selection === "Share Report") {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/issues/new?template=hardware_report.md'));
            }
        }
    }
    static getFallbackStats() {
        const totalMem = os.totalmem() / (1024 ** 3);
        return {
            vramTotalGB: 0,
            vramAvailableGB: 0,
            gpuModel: 'N/A (CPU Only)',
            isAppleSilicon: false
        };
    }
}
exports.HardwareScanner = HardwareScanner;
HardwareScanner._anomalyReported = false;
//# sourceMappingURL=hardwareScanner.js.map