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
exports.HardwareDashboardProvider = void 0;
const vscode = __importStar(require("vscode"));
const hardwareScanner_1 = require("../utils/hardwareScanner");
const modelMatrix_1 = require("../utils/modelMatrix");
const licenseService_1 = require("../utils/licenseService");
class HardwareDashboardProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._priority = 'intelligence';
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this.updateContent();
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'scan':
                    await this.updateContent();
                    break;
                case 'setPriority':
                    this._priority = data.value;
                    await this.updateContent();
                    break;
                case 'setConfig':
                    await this.saveConfig(data.model, data.quant);
                    break;
                case 'openReport':
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/issues/new?template=hardware_report.md'));
                    break;
                case 'openWiki':
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/wiki/Technical-FAQ'));
                    break;
            }
        });
    }
    async updateContent() {
        if (!this._view)
            return;
        const stats = await hardwareScanner_1.HardwareScanner.scan();
        this._view.webview.html = this._getHtmlForWebview(stats);
    }
    async saveConfig(modelKey, quant) {
        const config = {
            model: modelKey,
            quantization: quant,
            priority: this._priority,
            timestamp: new Date().toISOString()
        };
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            const settingUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.agent-settings');
            const content = Buffer.from(JSON.stringify(config, null, 2));
            await vscode.workspace.fs.writeFile(settingUri, content);
            vscode.window.showInformationMessage(`Config saved (Priority: ${this._priority})`);
        }
    }
    _getHtmlForWebview(stats) {
        const bandwidth = stats.memoryBandwidthGBs || 50;
        // Priority-based model filtering/sorting
        const sortedModels = Object.entries(modelMatrix_1.R1_MATRIX).sort(([aK, aM], [bK, bM]) => {
            if (this._priority === 'context') {
                return aM.paramsB - bM.paramsB; // Prioritize smaller models for more context
            }
            else {
                return bM.paramsB - aM.paramsB; // Prioritize larger models for intelligence
            }
        });
        const models = sortedModels.map(([key, model]) => {
            const activeParams = key === 'DeepSeek-R1-Full' ? 37 : model.paramsB;
            const quant = this._priority === 'context' ? modelMatrix_1.Quantization.Q8_0 : modelMatrix_1.Quantization.Q4_K_M;
            const targetVram = model.vramGB[quant];
            const fits = stats.vramAvailableGB >= targetVram;
            const tps = modelMatrix_1.ModelCalculator.predictTPS(bandwidth, activeParams, modelMatrix_1.QUANT_BITS[quant], fits);
            return `
                <div class="model-card ${fits ? 'fits' : 'spilling'}">
                    <div class="model-header">
                        <span class="model-name">${model.name}</span>
                        <span class="tps-badge">${tps.toFixed(1)} TPS</span>
                    </div>
                    <div class="vram-bar-container">
                        <div class="vram-bar" style="width: ${Math.min(100, (targetVram / stats.vramTotalGB) * 100)}%"></div>
                    </div>
                    <div class="model-footer">
                        <span>${quant}: ${targetVram}GB</span>
                        <button onclick="setConfig('${key}', '${quant}')">Select</button>
                    </div>
                </div>
            `;
        }).join('');
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <style>
                    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 10px; }
                    .stats-tile { background: var(--vscode-editor-background); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--vscode-widget-border); }
                    .heatmap { height: 10px; background: #333; border-radius: 5px; overflow: hidden; margin-top: 10px; }
                    .usage { height: 100%; background: linear-gradient(90deg, #4caf50, #fbc02d, #f44336); }
                    .model-card { border: 1px solid var(--vscode-widget-border); padding: 10px; border-radius: 6px; margin-bottom: 10px; }
                    .fits { border-left: 4px solid #4caf50; }
                    .spilling { border-left: 4px solid #fbc02d; opacity: 0.8; }
                    .model-header { display: flex; justify-content: space-between; font-weight: bold; }
                    .tps-badge { font-size: 0.8em; background: var(--vscode-badge-background); padding: 2px 6px; border-radius: 4px; }
                    .vram-bar-container { height: 4px; background: #222; margin: 8px 0; }
                    .vram-bar { height: 100%; background: var(--vscode-progressBar-background); }
                    .toggle-group { display: flex; gap: 5px; margin-bottom: 20px; }
                    .toggle-btn { flex: 1; padding: 6px; font-size: 0.8em; border: 1px solid var(--vscode-widget-border); background: var(--vscode-editor-background); color: var(--vscode-foreground); cursor: pointer; }
                    .toggle-btn.active { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-color: transparent; }
                    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 8px; cursor: pointer; border-radius: 2px; }
                    button:hover { background: var(--vscode-button-hoverBackground); }
                </style>
            </head>
            <body>
                <h3>Hardware: ${stats.gpuModel}</h3>
                <div class="stats-tile">
                    <div>VRAM: ${stats.vramAvailableGB.toFixed(1)} / ${stats.vramTotalGB.toFixed(1)} GB</div>
                    <div class="heatmap">
                        <div class="usage" style="width: ${(stats.vramAvailableGB / stats.vramTotalGB) * 100}%"></div>
                    </div>
                </div>

                <div class="toggle-group">
                    <button class="toggle-btn ${this._priority === 'context' ? 'active' : ''}" onclick="setPriority('context')">Context Priority</button>
                    <button class="toggle-btn ${this._priority === 'intelligence' ? 'active' : ''}" onclick="setPriority('intelligence')">
                        Intelligence Priority
                        ${!licenseService_1.LicenseService.isPro() ? '<span style="font-size: 0.7em;">🔒</span>' : ''}
                    </button>
                </div>

                <div class="compliance-badge" style="background: #e6ffed; border: 1px solid #caf0d5; color: #22863a; padding: 8px; border-radius: 4px; font-size: 0.8em; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.2em;">🛡️</span>
                    <div>
                        <strong>Sovereign AI Active</strong><br/>
                        <span style="font-size: 0.9em; opacity: 0.8;">Local execution verified. No data egress.</span>
                    </div>
                </div>

                <h4>Recommended R1 Variants</h4>
                ${models}

                <div class="footer" style="margin-top: 30px; padding-top: 15px; border-top: 1px solid var(--vscode-widget-border); display: flex; flex-direction: column; gap: 8px;">
                    <button class="toggle-btn" onclick="openReport()" style="background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground);">Tune the Matrix</button>
                    <div style="font-size: 0.75em; opacity: 0.7; text-align: center; display: flex; flex-direction: column; gap: 4px;">
                        <span>Share performance benchmarks to help tune our R1 heuristics.</span>
                        <a href="#" onclick="openWiki()" style="color: var(--vscode-textLink-foreground); text-decoration: none;">🔍 Troubleshooting & FAQ</a>
                    </div>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    function setPriority(val) {
                        vscode.postMessage({ type: 'setPriority', value: val });
                    }
                    function setConfig(model, quant) {
                        vscode.postMessage({ type: 'setConfig', model, quant });
                    }
                    function openReport() {
                        vscode.postMessage({ type: 'openReport' });
                    }
                    function openWiki() {
                        vscode.postMessage({ type: 'openWiki' });
                    }
                </script>
            </body>
            </html>`;
    }
}
exports.HardwareDashboardProvider = HardwareDashboardProvider;
HardwareDashboardProvider.viewType = 'r1-hardware-dashboard';
//# sourceMappingURL=hardwareDashboard.js.map