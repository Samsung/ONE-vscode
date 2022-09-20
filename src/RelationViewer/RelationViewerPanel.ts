import * as vscode from 'vscode';
import path from 'path';
import {Node} from '../OneExplorer/OneExplorer';
import {Balloon} from '../Utils/Balloon';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';

//현재 실행되고있는 패널정보('uri':panel 객체)
let currentPanelsInfo = {} as any;

export class RelationViewerPanel {
  public static readonly viewType = 'one.viewer.relation';
  private readonly _panel: vscode.WebviewPanel;

  private _disposables: vscode.Disposable[] = [];

  public static register(context: vscode.ExtensionContext): void {
    const registrations = [
      // add command
      vscode.commands.registerCommand('one.relation.showRelationViewer', async (uri) => {
        await RelationViewerPanel.createPanel(context, uri);
      })
    ];

    // show relation 보여줄 파일 확장자
    vscode.commands.executeCommand('setContext', 'relation.supportedFiles', [
      '.tflite',
      '.pb',
      '.onnx',
      '.circle',
      '.log'  // log 파일 제외할지 결정
    ]);

    if (vscode.window.registerWebviewPanelSerializer) {
      // Make sure we register a serializer in activation event
      vscode.window.registerWebviewPanelSerializer(RelationViewerPanel.viewType, {
        
        async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
          // Reset the webview options so we use latest uri for `localResourceRoots`.
          webviewPanel.webview.options = RelationViewerPanel.getWebviewOptions(context.extensionUri);
          
          RelationViewerPanel.revive(context, state.fileUri, webviewPanel);
        }
      });
    }

    registrations.forEach(disposable => {
      context.subscriptions.push(disposable);
    });
  }

  public static async revive(context: vscode.ExtensionContext, fileUri: string, panel:vscode.WebviewPanel) {
    console.log('vscode_재시작_복구용_파일path:',fileUri);

    //만약 복구할려고 했으나 이미 해당 패널이 열려있을 경우.
    for (const key in currentPanelsInfo) {
      if(key === fileUri){
        console.log('이미 열려있는 패널');
        panel.dispose();
        currentPanelsInfo[key].reveal();
        return;
      }
    }
    //복구하고 난뒤 해당 패널에 dispose 등록
    new RelationViewerPanel(panel,fileUri);
    // 그 후 해당 패널에 webview를 그린다.
    await this._getHtmlForWebview(context,panel,fileUri);
	}

  private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
      enableScripts: true,
      retainContextWhenHidden : true
    };
  }

  private static async createPanel(context: vscode.ExtensionContext, uri: vscode.Uri | Node): Promise<void> {
    let relativePath = "";
    let originPath = "";
    console.log(uri);
    if (uri instanceof vscode.Uri) {
      relativePath = uri.fsPath;
      originPath = uri.fsPath;
    } else if (uri instanceof Node) {
      relativePath = uri.path;
      originPath = uri.path;
    }

    //이미 켜져있는 패널이 있다면 해당 패널을 보여준다.
    if(currentPanelsInfo[originPath]){
      currentPanelsInfo[originPath].reveal();
      return;
    }

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
      
      if (relativePath.length <= workspacePath.length) {
        // TODO 로그쓰기
        Balloon.error("Invalid Path", false);
        return;
      }
      
      
      // TODO: 뭔가 예외상황 있을 듯
      // relativePath = '.' + relativePath.substring(workspacePath.length);
      relativePath = relativePath.replace(workspacePath, '.');
      
      if (relativePath[0] !== '.') {
        // 예외처리
      }
    }

    // Create and show a new webview
    const panel = vscode.window.createWebviewPanel(
      RelationViewerPanel.viewType, // Identifies the type of the webview. Used internally
      'Relation', // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    //현재 패널에 webview를 그린다.
    RelationViewerPanel._getHtmlForWebview(context,panel,originPath);

    //Panel 객체를 생성하여 해당 패널의 dispose 메서드를 등록
    new RelationViewerPanel(panel,originPath);
  }

  constructor(panel: vscode.WebviewPanel, fileUri: String) {
    this._panel = panel;
    //this._extensionUri = extensionUri;

    // Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		panel.onDidDispose(() => this.dispose(fileUri), null, this._disposables);
  }

  private static async _getHtmlForWebview(context: vscode.ExtensionContext, panel:vscode.WebviewPanel, originPath:string){
    
    //현재 패널의 정보를 기록해놓는다.
    currentPanelsInfo[originPath] = panel;
    console.log('현재 패널 정보:',currentPanelsInfo);

    //relationData를 가져오는 함수
    let payload:any;
    
    const nonce = getNonce();
    const scriptUri =
        getUri(panel.webview, context.extensionUri, ['media', 'RelationViewer', 'index.js']);
    const styleUri =
        getUri(panel.webview, context.extensionUri, ['media', 'RelationViewer', 'style.css']);
    
    //401 에러 발생(권한 거부)
    const toolkitUri = getUri(panel.webview, context.extensionUri, [
      'node_modules',
      '@vscode',
      'webview-ui-toolkit',
      'dist',
      'toolkit.js',
    ]);

    const codiconUri = getUri(panel.webview, context.extensionUri, [
      'node_modules',
      '@vscode',
      'codicons',
      'dist',
      'codicon.css',
    ]);

    const htmlUri = vscode.Uri.joinPath(context.extensionUri, "media", "RelationViewer", "index.html");
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${panel.webview.cspSource}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    panel.webview.html = html;
    
    // TODO title에 어떻게 스타일주는지, 같은 이름의 파일이 열렸는지 어떻게 확인할 것인지
    // TODO relativePath 말고 이름으로
    const fileName = originPath.split('/').slice(-1);
    panel.title = `Relation: ${fileName}`;

    // relation 데이터를 웹뷰로 메세지를 보낸다.
    payload = getRelationData(originPath);
    panel.webview.postMessage(
      {type:'create',payload: payload,fileUri: originPath }
    );

    // 업데이트 요청시 새로운 relation 데이터 전송
    panel.webview.onDidReceiveMessage((message) => {
      console.log(message.path);
      payload = getRelationData(message.path);
      panel.webview.postMessage(
        { type:'update', payload: payload, fileUri: message.path }
      );
    });
  }

  public dispose(fileUri:String) {

    //현재 uri를 가진 패널의 정보를 지운다.
    if(currentPanelsInfo[String(fileUri)]){
      delete currentPanelsInfo[String(fileUri)];
    }

    console.log('현재 패널 정보:',currentPanelsInfo);

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}

function getRelationData(path:any) {
  return {
    "selected": "1",
    "relationData": [
      {"id": "1", "parent": "", "idx": 0, "dataList": [{"name": "a.tflite", "path": "./a.tflite"}]},  // TODO: id, parentid: hashId
      {"id": "2", "parent": "1", "idx": 0, "dataList": [{"name": "b.circle", "path": "./b.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "3", "parent": "1", "idx": 0, "dataList": [{"name": "c.circle", "path": "./c.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "4", "parent": "2", "idx": 0, "dataList": [{"name": "b1.circle", "path": "./b1.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "5", "parent": "2", "idx": 0, "dataList": [{"name": "b2.circle", "path": "./b2.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "6", "parent": "2", "idx": 0, "dataList": [{"name": "b3.circle", "path": "./b3.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "7", "parent": "2", "idx": 0, "dataList": [{"name": "b4.circle", "path": "./b4.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "8", "parent": "2", "idx": 0, "dataList": [{"name": "b5.circle", "path": "./b5.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "9", "parent": "3", "idx": 0, "dataList": [{"name": "d.circle", "path": "./d.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "10", "parent": "9", "idx": 0, "dataList": [{"name": "e.circle", "path": "./e.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "11", "parent": "10", "idx": 0, "dataList": [{"name": "e1.circle", "path": "./e1.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]},
      {"id": "12", "parent": "10", "idx": 0, "dataList": [{"name": "e2.circle", "path": "./e2.circle", "oneccVersion": "1.0.0", "toolchainVersion": "1.0.0"}]}
    ]
  };
}