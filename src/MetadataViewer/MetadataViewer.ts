import * as vscode from 'vscode';
import { getNonce } from '../Utils/external/Nonce';

/* istanbul ignore next */
export class MetadataViewer{
  private readonly _panel: vscode.WebviewPanel;
  private _disposable:vscode.Disposable[];
  protected readonly _webview: vscode.Webview;
  protected readonly _extensionUri: vscode.Uri;

  public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._disposable = [];
    this._webview = panel.webview;
    this._panel = panel;
    this._extensionUri = extensionUri;
  }

  public initMetadataInfo() {
    this._webview.options = this.getWebviewOptions();

    //웹뷰로부터 메세지 받을때 이벤트 등록
    this.registerEventHandlers();

  }

  private getWebviewOptions(): vscode.WebviewOptions
      &vscode.WebviewPanelOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // to prevent view to reload after loosing focus
      retainContextWhenHidden: true
    };
  }


  public loadContent() {
    this._getHtmlForWebview(this._extensionUri,this._panel);
  }

  private async _getHtmlForWebview(extensionUri:vscode.Uri, panel:vscode.WebviewPanel){
    panel.webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const jsIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.js"));
    const cssIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.css"));

    const htmlUri = vscode.Uri.joinPath(extensionUri, "media", "MetadataViewer", "index.html");

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${index.css}/g, `${cssIndex}`);
    html = html.replace(/\${index.js}/g, `${jsIndex}`);
    panel.webview.html = html;
    
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers() {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      // this.handleReceiveMessage(message);
    }, null, this._disposable);
  }

  public disposeMetadataView(){
    while (this._disposable.length) {
      const x = this._disposable.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

