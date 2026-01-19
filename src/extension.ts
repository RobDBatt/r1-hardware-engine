import * as vscode from 'vscode';
import { HardwareScanner } from './utils/hardwareScanner';
import { HardwareDashboardProvider } from './views/hardwareDashboard';
import { ReasoningArtifactProvider } from './views/reasoningArtifact';
import { HardwareMcpServer } from './mcp/hardwareMcpServer';
import { ReleaseNotes } from './utils/releaseNotes';

export function activate(context: vscode.ExtensionContext) {
    console.log('Antigravity R1 Hardware Engine Active');

    // 0. Show Release Notes if updated
    ReleaseNotes.showIfNew(context);

    // 1. Register Hardware Dashboard
    const dashboardProvider = new HardwareDashboardProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            HardwareDashboardProvider.viewType,
            dashboardProvider
        )
    );

    // 2. Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('r1-engine.scanHardware', async () => {
            const stats = await HardwareScanner.scan();
            vscode.window.showInformationMessage(
                `Hardware: ${stats.gpuModel} | VRAM: ${stats.vramTotalGB.toFixed(1)}GB`
            );
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('r1-engine.openReasoning', () => {
            ReasoningArtifactProvider.show();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('r1-engine.toggleProMode', async () => {
            const current = vscode.workspace.getConfiguration('r1-engine').get<boolean>('isProAccount');
            await vscode.workspace.getConfiguration('r1-engine').update('isProAccount', !current, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`R1 Engine: Pro Mode ${!current ? 'Enabled' : 'Disabled'}`);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('r1-engine.reportPerformance', async (tps: number, ttft: number) => {
            await HardwareScanner.reportPerformance(tps, ttft);
        })
    );

    // 3. Mock Agent Bridge (Interception demo)
    let mockToggle = false;
    context.subscriptions.push(
        vscode.commands.registerCommand('r1-engine.simulateThinking', () => {
            mockToggle = !mockToggle;
            if (mockToggle) {
                ReasoningArtifactProvider.show();
                let count = 0;
                const interval = setInterval(() => {
                    ReasoningArtifactProvider.pushContent(`Analyzing node ${count++}...\n`);
                    if (count > 20) clearInterval(interval);
                }, 200);
            }
        })
    );

    // 4. Initialize & Start MCP Server
    const mcpServer = new HardwareMcpServer();
    mcpServer.run().catch(err => {
        console.error('Failed to start R1 Hardware MCP Server:', err);
    });

    // 5. Welcome & Initial Scan
    vscode.window.showInformationMessage('🚀 R1 Hardware Engine Installed. Scanning local hardware...', 'Open Dashboard').then(selection => {
        if (selection === 'Open Dashboard') {
            vscode.commands.executeCommand('workbench.view.extension.r1-engine-sidebar');
        }
    });

    HardwareScanner.scan().then(stats => {
        console.log(`Initial scan complete: ${stats.gpuModel} with ${stats.vramAvailableGB.toFixed(1)}GB available.`);
    });
}

export function deactivate() { }
