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
exports.LicenseService = void 0;
const vscode = __importStar(require("vscode"));
class LicenseService {
    /**
     * In a production app, this would check a token or license API.
     * Here we check a local setting for demo purposes.
     */
    static isPro() {
        const config = vscode.workspace.getConfiguration('r1-engine');
        return config.get('isProAccount') || false;
    }
    /**
     * Pro users get 4-bit Quantized MLA Cache (doubling context window)
     */
    static getKVBytesPerParam() {
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
exports.LicenseService = LicenseService;
//# sourceMappingURL=licenseService.js.map