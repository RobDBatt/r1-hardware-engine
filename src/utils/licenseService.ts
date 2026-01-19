import * as vscode from 'vscode';

export class LicenseService {
    /**
     * In a production app, this would check a token or license API.
     * Here we check a local setting for demo purposes.
     */
    static isPro(): boolean {
        const config = vscode.workspace.getConfiguration('r1-engine');
        return config.get<boolean>('isProAccount') || false;
    }

    /**
     * Pro users get 4-bit Quantized MLA Cache (doubling context window)
     */
    static getKVBytesPerParam(): number {
        return this.isPro() ? 0.5 : 2.0; // 4-bit (0.5 bytes) vs FP16 (2 bytes)
    }

    static getCapabilities() {
        return {
            kvQuantization: this.isPro() ? "active" : "pro-only",
            autoOrchestration: this.isPro() ? "active" : "pro-only",
            sovereignAudit: "active"
        };
    }
}
