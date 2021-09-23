import * as vscode from 'vscode';

export class JsonTracer {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: JsonTracer | undefined;

  private static readonly viewType = 'JsonTracer';

  private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

    // If we already have a panel, show it.
		if (JsonTracer.currentPanel) {
			JsonTracer.currentPanel._panel.reveal(column);
			return;
		}

    // Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			JsonTracer.viewType,
			'JsonTracer',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

    JsonTracer.currentPanel = new JsonTracer(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		JsonTracer.currentPanel = new JsonTracer(panel, extensionUri);
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
		JsonTracer.currentPanel = undefined;

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
		this._panel.title = 'barchart-TheONE';
		this._panel.webview.html = this._getHtmlForWebview(webview);
		return;
	}

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri,'src/JsonTracer','index.js');
    const scriptUri = scriptPathOnDisk.with({scheme: 'vscode-resource'});
    const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri,'src/JsonTracer','style.css');
    const styleUri = stylePathOnDisk.with({scheme: 'vscode-resource'});

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>json-tracer</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<meta http-equiv="Content-Security-Policy" content="default-src ${webview.cspSource}; style-src ${webview.cspSource}; img-src ${webview.cspSource} https: http: data: blob:; script-src 'unsafe-inline' http: https:;">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root">
          <main>
            <nav>
              <div class="left-btns">
                <button class="capture-btn">capture</button>
                <button class="load-btn">Load</button>
                <div class="file-name"></div>
                <div class="set-data"></div>
              </div>
              <div class="right-btns">
                <button class="zoom-in-btn" value="50">ZoomIn</button>
                <button class="zoom-out-btn" value="-50">ZoomOut</button>
                <input type="range" min="100" max="200" value="100">
              </div>
            </nav>
            <article class="dash-board">
              <div class="graph"></div>
            </article>
            <article class="detail-container">
              <header>
                <span>Detail</span>
              </header>
              <section>
                <div class="selected"></div>
              </section>
            </article>
          </main>
        </div>
				<script nonce="${nonce}" type="module" src="${scriptUri}"></script>
			</body>
			</html>`;
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

		// And restrict the webview to only loading content from our extension's `'src/JsonTracer` directories.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'src/JsonTracer')]
	};
}
