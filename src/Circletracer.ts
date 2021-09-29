import * as vscode from 'vscode';
import * as fs from 'fs';

export class Circletracer {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: Circletracer | undefined;

    public static readonly viewType = 'Circletracer';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private static _circleToJsonData: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, circleToJson: string) {
        this._circleToJsonData = circleToJson;

        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (Circletracer.currentPanel) {
            Circletracer.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            Circletracer.viewType,
            'Circletracer',
            column || vscode.ViewColumn.One,
            getWebviewOptions(extensionUri),
        );

        Circletracer.currentPanel = new Circletracer(panel, extensionUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        Circletracer.currentPanel = new Circletracer(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        Circletracer.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = 'circle tracer';
        this._panel.webview.html = this._getHtmlForWebview(webview);
        return;
    }

    private getMediaPath(file: string) {
        return vscode.Uri.joinPath(this._extensionUri, 'media/Circletracer', file);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        // Local path to main js script run in the webview
        // And the uri we use to load this script in the webview
        const loadFileOnDisk = this.getMediaPath('loadfile.js');
        const loadFileUri = loadFileOnDisk.with({ 'scheme': 'vscode-resource' });

        const treeMapOnDisk = this.getMediaPath('treemap.js');
        const treeMapUri = treeMapOnDisk.with({ 'scheme': 'vscode-resource' });

        const makeDataOnDisk = this.getMediaPath('makeData.js');
        const makeDataUri = makeDataOnDisk.with({ 'scheme': 'vscode-resource' });

        const dagreOnDisk = this.getMediaPath('dagre-d3.min.js');
        const dagreUri = dagreOnDisk.with({ 'scheme': 'vscode-resource' });

        // Local path to css styles
        // Uri to load styles into webview
        const stylePath = this.getMediaPath('style.css');
        const styleUri = webview.asWebviewUri(stylePath);

        // import html
        const htmlPath = this.getMediaPath('index.html');
        let html = fs.readFileSync(htmlPath.fsPath, { encoding: 'utf-8' });

        // Apply js and css to html
        html = html.replace(/_nonce/g, `${nonce}`);
        html = html.replace(/_styleUri/g, `${styleUri}`);
        html = html.replace(/_webview.cspSource/g, `${webview.cspSource}`);
        html = html.replace(/_loadFileUri/g, `${loadFileUri}`);
        html = html.replace(/_treeMapUri/g, `${treeMapUri}`);
        html = html.replace(/_dagreUri/g, `${dagreUri}`);
        html = html.replace(/_makeDataUri/g, `${makeDataUri}`);
        html = html.replace(/_Circletracer._circleToJsonData/g, `${`${Circletracer._circleToJsonData}`}`);

        return html;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media`, `src/Circletracer` directories.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media/Circletracer')]
    };
}