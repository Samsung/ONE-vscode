import * as vscode from 'vscode';
import { getNonce } from '../Utils/external/Nonce';
import { getUri } from '../Utils/external/Uri';
import { getRelationData } from './RelationViewerProvider';

/* istanbul ignore next */
export class RelationViewer{
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
  //웹뷰의 옵션과 이벤트 등록
  public initRelationViewer() {
    this._webview.options = this.getWebviewOptions();

    //웹뷰로부터 메세지 받을때 이벤트 등록
    this.registerEventHandlers(this._panel);

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

  //웹뷰에 relation 정보를 그린다.
  public loadContent() {
    this._getHtmlForWebview(this._extensionUri,this._panel);
  }

  private async _getHtmlForWebview(extensionUri:vscode.Uri, panel:vscode.WebviewPanel){
    panel.webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const scriptUri =
        getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'index.js']);
    const styleUri =
        getUri(panel.webview, extensionUri, ['media', 'RelationViewer', 'style.css']);
    
    const toolkitUri = getUri(panel.webview, extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const codiconUri = getUri(panel.webview, extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);

    const htmlUri = vscode.Uri.joinPath(extensionUri, "media", "RelationViewer", "index.html");
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${panel.webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    panel.webview.html = html;
    
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }

  private registerEventHandlers(panel:vscode.WebviewPanel) {
    // Handle messages from the webview
    this._webview.onDidReceiveMessage(message => {
      let payload;
      switch (message.type) {
        case "update":
          payload = getRelationData(message.path);
          panel.webview.postMessage(
            { type:'update', payload: payload, fileUri: message.path}
          );
          break;
        default:
          break;
      }
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

