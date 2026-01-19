import * as vscode from 'vscode';

export class ReleaseNotes {
    private static readonly LAST_NOTIFIED_VERSION_KEY = 'r1-engine.lastNotifiedVersion';

    static async showIfNew(context: vscode.ExtensionContext) {
        const currentVersion = vscode.extensions.getExtension('antigravity-labs.r1-hardware-engine')?.packageJSON.version;
        const lastNotifiedVersion = context.globalState.get<string>(this.LAST_NOTIFIED_VERSION_KEY);

        if (currentVersion && currentVersion !== lastNotifiedVersion) {
            const selection = await vscode.window.showInformationMessage(
                `R1 Engine v${currentVersion} is Live! 🛡️ Sovereign Feedback Loop activated. Help us tune the Matrix by sharing your stats.`,
                'View FAQ',
                'Report Stats'
            );

            if (selection === 'View FAQ') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/wiki/Technical-FAQ'));
            } else if (selection === 'Report Stats') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/issues/new?template=hardware_report.md'));
            }

            await context.globalState.update(this.LAST_NOTIFIED_VERSION_KEY, currentVersion);
        }
    }
}
