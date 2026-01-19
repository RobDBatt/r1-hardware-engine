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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const hardwareScanner_1 = require("./utils/hardwareScanner");
const hardwareDashboard_1 = require("./views/hardwareDashboard");
const reasoningArtifact_1 = require("./views/reasoningArtifact");
const hardwareMcpServer_1 = require("./mcp/hardwareMcpServer");
const releaseNotes_1 = require("./utils/releaseNotes");
function activate(context) {
    console.log('Antigravity R1 Hardware Engine Active');
    // 0. Show Release Notes if updated
    releaseNotes_1.ReleaseNotes.showIfNew(context);
    // 1. Register Hardware Dashboard
    const dashboardProvider = new hardwareDashboard_1.HardwareDashboardProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(hardwareDashboard_1.HardwareDashboardProvider.viewType, dashboardProvider));
    // 2. Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('r1-engine.scanHardware', async () => {
        const stats = await hardwareScanner_1.HardwareScanner.scan();
        vscode.window.showInformationMessage(`Hardware: ${stats.gpuModel} | VRAM: ${stats.vramTotalGB.toFixed(1)}GB`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('r1-engine.openReasoning', () => {
        reasoningArtifact_1.ReasoningArtifactProvider.show();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('r1-engine.toggleProMode', async () => {
        const current = vscode.workspace.getConfiguration('r1-engine').get('isProAccount');
        await vscode.workspace.getConfiguration('r1-engine').update('isProAccount', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`R1 Engine: Pro Mode ${!current ? 'Enabled' : 'Disabled'}`);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('r1-engine.reportPerformance', async (tps, ttft) => {
        await hardwareScanner_1.HardwareScanner.reportPerformance(tps, ttft);
    }));
    // 3. Mock Agent Bridge (Interception demo)
    let mockToggle = false;
    context.subscriptions.push(vscode.commands.registerCommand('r1-engine.simulateThinking', () => {
        mockToggle = !mockToggle;
        if (mockToggle) {
            reasoningArtifact_1.ReasoningArtifactProvider.show();
            let count = 0;
            const interval = setInterval(() => {
                reasoningArtifact_1.ReasoningArtifactProvider.pushContent(`Analyzing node ${count++}...\n`);
                if (count > 20)
                    clearInterval(interval);
            }, 200);
        }
    }));
    // 4. Initialize & Start MCP Server
    const mcpServer = new hardwareMcpServer_1.HardwareMcpServer();
    mcpServer.run().catch(err => {
        console.error('Failed to start R1 Hardware MCP Server:', err);
    });
    // 5. Welcome & Initial Scan
    vscode.window.showInformationMessage('🚀 R1 Hardware Engine Installed. Scanning local hardware...', 'Open Dashboard').then(selection => {
        if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('workbench.view.extension.r1-engine-sidebar');
        }
    });
    hardwareScanner_1.HardwareScanner.scan().then(stats => {
        console.log(`Initial scan complete: ${stats.gpuModel} with ${stats.vramAvailableGB.toFixed(1)}GB available.`);
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map