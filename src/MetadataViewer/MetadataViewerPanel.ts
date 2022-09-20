import * as vscode from 'vscode';
import { Node } from '../OneExplorer/OneExplorer';
import { Balloon } from '../Utils/Balloon';
import { getNonce } from '../Utils/external/Nonce';

//현재 실행되고있는 패널정보('uri':panel 객체)
let currentPanelsInfo = {} as any;

export class MetadataViewerPanel {
  public static readonly viewType = 'one.viewer.metadata';
  private readonly _panel: vscode.WebviewPanel;
	//private readonly _extensionUri: vscode.Uri;
  public static currentPanel: MetadataViewerPanel | undefined;

  private _disposables: vscode.Disposable[] = [];

  public static register(context: vscode.ExtensionContext): void {
    
    const registrations = [
      // add command
      vscode.commands.registerCommand('one.metadata.showMetadataViewer', async (uri) => {
        await MetadataViewerPanel.createPanel(context, uri);
      }),
      vscode.commands.registerCommand('one.metadata.updateViewerState', (type, oldUri, newUri) => {
        console.log("updateViewerState");
        const oldPath = oldUri.fsPath;
        const panel = currentPanelsInfo[oldPath];
        if (panel) {
          if (type === 'rename') {
            const newPath = newUri.fsPath;
            delete currentPanelsInfo[oldPath];
            const newPanel = currentPanelsInfo[newPath];
            if (newPanel) {
              newPanel.reveal();
              panel.dispose();
            } else {
              currentPanelsInfo[newPath] = panel;
              this._getHtmlForWebview(context, newPath, panel, vscode.workspace.asRelativePath(newPath));
            }
            panel.title = `Metadata: ${this._getNameFromPath(newPath)}`;
          } else if (type === 'update') {
            // panel.title = `Metadata: ${this._getNameFromPath(newPath)} (updated)`;
            this._getHtmlForWebview(context, oldPath, panel, './'+vscode.workspace.asRelativePath(oldPath));
          } else if (type === 'delete') {
            // panel.dispose();
            panel.title = `Metadata: ${this._getNameFromPath(oldPath)} (deleted)`;
          }
        }
      })
    ];

    // show metadata 보여줄 파일 확장자
    vscode.commands.executeCommand('setContext', 'metadata.supportedFiles', [
      '.tflite',
      '.pb',
      '.onnx',
      '.circle',
      '.log'
    ]);

    if (vscode.window.registerWebviewPanelSerializer) {
      vscode.window.registerWebviewPanelSerializer(MetadataViewerPanel.viewType, {
        
        async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
          webviewPanel.webview.options = MetadataViewerPanel.getWebviewOptions(context.extensionUri);
          
          MetadataViewerPanel.revive(context, state.fileUri, webviewPanel, state.relativePath);
          
        }
      });
    }

    registrations.forEach(disposable => {
      context.subscriptions.push(disposable);
    });
  }

  public static async revive(context: vscode.ExtensionContext, fileUri: string, panel:vscode.WebviewPanel, relativePath:string) {
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

    new MetadataViewerPanel(panel,fileUri);
    await this._getHtmlForWebview(context,fileUri,panel,relativePath);
	}

  private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions&vscode.WebviewPanelOptions {
    return {
      enableScripts: true,
      retainContextWhenHidden: true
    };
  }

  private static async createPanel(context: vscode.ExtensionContext, uri: vscode.Uri | Node): Promise<void> {

    let relativePath = "";
    let originPath = "";
    if (uri instanceof vscode.Uri) {
      relativePath = uri.fsPath;
      originPath = uri.fsPath;
    } else if (uri instanceof Node) {
      relativePath = uri.path;
      originPath = uri.path;
    }
    relativePath = './' + vscode.workspace.asRelativePath(relativePath);
    
    if(currentPanelsInfo[originPath]){
      currentPanelsInfo[originPath].reveal();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      MetadataViewerPanel.viewType,
      'Metadata',
      vscode.ViewColumn.One,
      MetadataViewerPanel.getWebviewOptions(context.extensionUri)
    );
    currentPanelsInfo[originPath] = panel;
    console.log(currentPanelsInfo);
    //Html을 웹에 그린다.
    this._getHtmlForWebview(context,originPath,panel,relativePath);
    
    //Panel 객체를 생성하여 해당 패널의 dispose 메서드를 등록
    new MetadataViewerPanel(panel,originPath);
  }

  constructor(panel: vscode.WebviewPanel, fileUri: String) {
    this._panel = panel;
    //this._extensionUri = extensionUri;

		panel.onDidDispose(() => this.dispose(fileUri), null, this._disposables);
  }

  private static async _getHtmlForWebview(context: vscode.ExtensionContext, path: string, panel:vscode.WebviewPanel, relativePath:string){
    
    if(!currentPanelsInfo[path]){
      currentPanelsInfo[path] = panel;
    }

    //메타데이터 정보를 가져오는 로직(Uri 인자를 이용하면 됨)
    const seletedMetadata = getMetadata();
    
    //가져온 메타데이터를 웹뷰로 메세지를 보낸다.
    panel.webview.postMessage({command:'showMetadata',metadata: seletedMetadata, fileUri: path, relativePath:relativePath});

    const nonce = getNonce();
    const jsIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "media", "MetadataViewer", "index.js"));
    const cssIndex = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "media", "MetadataViewer", "index.css"));

    const htmlUri = vscode.Uri.joinPath(context.extensionUri, "media", "MetadataViewer", "index.html");

    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${index.css}/g, `${cssIndex}`);
    html = html.replace(/\${index.js}/g, `${jsIndex}`);
    panel.webview.html = html;

    panel.title = `Metadata: ${this._getNameFromPath(path)}`;
    
  }

  private static _getNameFromPath(path: string) {
    let idx = path.lastIndexOf("/");
    if (idx === undefined) {
      idx = -1;
    }
    return path.substring(idx + 1);
  }

  public dispose(fileUri:String) {

    //현재 uri를 가진 패널의 정보를 지운다.
    if(currentPanelsInfo[String(fileUri)]){
      delete currentPanelsInfo[String(fileUri)];
    }

    console.log(currentPanelsInfo);

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}

function getMetadata() {
  return {
    "./test.log": {
      "file_extension": "log",
      "created_time": new Date().toLocaleString(),
      "modified_time": new Date().toLocaleString(),
      "deleted_time": null,

      "toolchain_version": "toolchain v1.3.0",
      "onecc_version": "1.20.0",
      "operations": {
        "op_total": 50,
        "ops": {
          "conv2d": 1,
          "relu": 1,
          'conv':3,
          'spp':1,
        }
      },
      "cfg_settings": {
        "onecc": {
          "one-import-tf": true,
          "one-import-tflite": false,
          "one-import-onnx": false,
          "one-quantize":true
        },
        "one-import-tf": {
          "converter_version": "v2",
          "input_array": "a",
          "output_array": "a",
          "input_shapes": "1,299,299"
        },
        "one-quantize":{
          "quantized_dtype":'int16',
          "input_data_format":'list',
          "min_percentile":'11',
          "max_percentile":'100',
          "mode":'movingAvg',
        }
      }
    }
  };
}