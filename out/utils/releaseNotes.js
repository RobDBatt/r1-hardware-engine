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
exports.ReleaseNotes = void 0;
const vscode = __importStar(require("vscode"));
class ReleaseNotes {
    static async showIfNew(context) {
        const currentVersion = vscode.extensions.getExtension('antigravity-labs.r1-hardware-engine')?.packageJSON.version;
        const lastNotifiedVersion = context.globalState.get(this.LAST_NOTIFIED_VERSION_KEY);
        if (currentVersion && currentVersion !== lastNotifiedVersion) {
            const selection = await vscode.window.showInformationMessage(`R1 Engine v${currentVersion} is Live! 🛡️ Sovereign Feedback Loop activated. Help us tune the Matrix by sharing your stats.`, 'View FAQ', 'Report Stats');
            if (selection === 'View FAQ') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/wiki/Technical-FAQ'));
            }
            else if (selection === 'Report Stats') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/antigravity-labs/r1-hardware-engine/issues/new?template=hardware_report.md'));
            }
            await context.globalState.update(this.LAST_NOTIFIED_VERSION_KEY, currentVersion);
        }
    }
}
exports.ReleaseNotes = ReleaseNotes;
ReleaseNotes.LAST_NOTIFIED_VERSION_KEY = 'r1-engine.lastNotifiedVersion';
//# sourceMappingURL=releaseNotes.js.map