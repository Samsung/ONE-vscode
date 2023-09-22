import * as vscode from "vscode";

export interface ICfgEditorPanel extends vscode.CustomTextEditorProvider {

    resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void>

    initWebview(
        document: vscode.TextDocument,
        webview: vscode.Webview
    ): Promise<void>

    initWebviewPanel(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel
    ): void
    
    updateWebview(
        document: vscode.TextDocument,
        webview: vscode.Webview
    ): void
}