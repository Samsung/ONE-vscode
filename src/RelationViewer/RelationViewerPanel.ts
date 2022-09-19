import {assert} from 'console';
import * as vscode from 'vscode';
import path from 'path';
import {Node} from '../OneExplorer/OneExplorer';
import {Balloon} from '../Utils/Balloon';
import {getNonce} from '../Utils/external/Nonce';
import {getUri} from '../Utils/external/Uri';

export class RelationViewerPanel {
  public static readonly viewType = 'one.viewer.relation';

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

    registrations.forEach(disposable => {
      context.subscriptions.push(disposable);
    });
  }

  private static getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
    };
  }

  private static async createPanel(context: vscode.ExtensionContext, uri: vscode.Uri | Node): Promise<void> {
    let relativePath = "";
    console.log(uri);
    if (uri instanceof vscode.Uri) {
      relativePath = uri.fsPath;
    } else if (uri instanceof Node) {
      relativePath = uri.path;
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
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media/RelationViewer'))],
        retainContextWhenHidden: true
      }
    );

    const nonce = getNonce();
    const scriptUri =
        getUri(panel.webview, context.extensionUri, ['media', 'RelationViewer', 'index.js']);
    const styleUri =
        getUri(panel.webview, context.extensionUri, ['media', 'RelationViewer', 'style.css']);
    const htmlUri = vscode.Uri.joinPath(context.extensionUri, "media", "RelationViewer", "index.html");
    let html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${styleUri}/g, `${styleUri}`);
    panel.webview.html = html;
    
    // TODO title에 어떻게 스타일주는지, 같은 이름의 파일이 열렸는지 어떻게 확인할 것인지
    // TODO relativePath 말고 이름으로
    const fileName = relativePath.split('/').slice(-1);
    panel.title = `Relation: ${fileName}`;

    panel.webview.postMessage(
      {relationData: getRelationData()}
    );
  }

  constructor() {}
}

function getRelationData() {
  return [
      {"name": "Top Level", "parent": "", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},  // TODO: name => id
      {"name": "Level 2: A", "parent": "Top Level", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
      {"name": "Level 2: B", "parent": "Top Level", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
      {"name": "Son of A", "parent": "Level 2: A", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
      {"name": "Daughter of A", "parent": "Level 2: A", "path": "???", "onecc version": "1.0.0", "toolchain version": "1.0.0"},
    ];
}