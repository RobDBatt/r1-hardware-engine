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
exports.ReasoningArtifactProvider = void 0;
const vscode = __importStar(require("vscode"));
class ReasoningArtifactProvider {
    static show() {
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.Two);
        }
        else {
            this._panel = vscode.window.createWebviewPanel('r1-reasoning', 'R1 Reasoning Artifact', vscode.ViewColumn.Two, { enableScripts: true, retainContextWhenHidden: true });
            this._panel.onDidDispose(() => this._panel = undefined);
            this._panel.webview.html = this._getHtml();
        }
    }
    static pushThoughtToken(token) {
        this._renderBuffer.push(token);
        // Batch updates to the UI
        // to prevent DOM thrashing during high-speed R1 reasoning.
        if (this._renderBuffer.length === 1) {
            setImmediate(() => {
                if (this._renderBuffer.length > 0) {
                    const content = this._renderBuffer.join('');
                    if (this._panel) {
                        this._panel.webview.postMessage({
                            type: 'append',
                            content
                        });
                    }
                    this._renderBuffer = [];
                }
            });
        }
    }
    static pushContent(content) {
        this.pushThoughtToken(content);
    }
    static clear() {
        this._panel?.webview.postMessage({ type: 'clear' });
    }
    static _getHtml() {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <style>
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        background: #0d1117; 
                        color: #c9d1d9; 
                        padding: 0; 
                        margin: 0;
                        line-height: 1.5;
                        overflow: hidden; /* Manage scrolling in a specific div */
                    }
                    .header { 
                        background: #161b22;
                        color: #58a6ff; 
                        border-bottom: 1px solid #30363d; 
                        padding: 10px 20px; 
                        font-family: sans-serif;
                        display: flex;
                        justify-content: space-between;
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }
                    /* Smooth container */
                    #scroll-container {
                        height: calc(100vh - 45px);
                        overflow-y: auto;
                        padding: 20px;
                        scroll-behavior: smooth;
                    }
                    #content { 
                        white-space: pre-wrap; 
                        contain: content; /* CSS optimization for specialized rendering */
                    }
                    .cursor { display: inline-block; width: 8px; height: 1.2em; background: #58a6ff; vertical-align: middle; animation: blink 1s infinite; }
                    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <span>DeepSeek-R1 Logic Trace</span>
                        <div style="font-size: 0.8em; color: #22863a; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                            <span style="font-size: 1.1em;">🛡️</span> Compliance: Sovereign AI (Local)
                        </div>
                    </div>
                    <span id="status">Streaming...</span>
                </div>
                <div id="scroll-container">
                    <div id="content"></div>
                    <span class="cursor"></span>
                </div>
                <script>
                    const contentDiv = document.getElementById('content');
                    const scrollContainer = document.getElementById('scroll-container');
                    let buffer = '';
                    let frameRequested = false;

                    // Efficient DOM Updates via RequestAnimationFrame
                    function flushBuffer() {
                        contentDiv.textContent += buffer;
                        buffer = '';
                        frameRequested = false;
                        
                        // Intelligent Auto-scroll
                        const isAtBottom = (scrollContainer.scrollHeight - scrollContainer.scrollTop) <= (scrollContainer.clientHeight + 100);
                        if (isAtBottom) {
                            scrollContainer.scrollTop = scrollContainer.scrollHeight;
                        }
                    }

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'append':
                                buffer += message.content;
                                if (!frameRequested) {
                                    frameRequested = true;
                                    requestAnimationFrame(flushBuffer);
                                }
                                break;
                            case 'clear':
                                contentDiv.textContent = '';
                                break;
                        }
                    });

                    // Optimization: Prune older tokens if memory usage gets extreme
                    // R1 can output thousands of lines. 
                    setInterval(() => {
                        if (contentDiv.textContent.length > 500000) {
                            contentDiv.textContent = "... (truncated for performance) ..." + contentDiv.textContent.slice(100000);
                        }
                    }, 5000);
                </script>
            </body>
            </html>`;
    }
}
exports.ReasoningArtifactProvider = ReasoningArtifactProvider;
ReasoningArtifactProvider._renderBuffer = [];
//# sourceMappingURL=reasoningArtifact.js.map