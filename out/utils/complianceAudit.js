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
exports.ComplianceAudit = void 0;
const crypto = __importStar(require("crypto"));
class ComplianceAudit {
    static generateReceipt(gpuModel) {
        const timestamp = new Date().toISOString();
        const data = {
            timestamp,
            dataEgress: false,
            localExecution: true,
            hardwareIsolation: true,
            gpuModel
        };
        const payload = JSON.stringify(data);
        const hash = crypto.createHash('sha256').update(payload).digest('hex');
        // Mock signature for local proof
        const signature = crypto.createHmac('sha256', this.PRIVATE_KEY_MOCK)
            .update(hash)
            .digest('hex');
        return {
            ...data,
            auditHash: `sha256:${hash.slice(0, 16)}`,
            signature: signature.slice(0, 32)
        };
    }
}
exports.ComplianceAudit = ComplianceAudit;
ComplianceAudit.PRIVATE_KEY_MOCK = 'sovereign-ai-private-key';
//# sourceMappingURL=complianceAudit.js.map