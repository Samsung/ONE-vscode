import { assert } from 'console';
import * as vscode from 'vscode';
import { OneNode } from '../OneExplorer/OneExplorer';
import { Balloon } from '../Utils/Balloon';

export class MetadataViewerPanel {
  public static readonly viewType = 'one.viewer.metadata';

  private _disposables: vscode.Disposable[] = [];

  public static register(context: vscode.ExtensionContext): void {
    const registrations = [
      // add command
      vscode.commands.registerCommand('one.metadata.showMetadataViewer', async (uri) => {
        await MetadataViewerPanel.createPanel(context, uri);
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

  private static async createPanel(context: vscode.ExtensionContext, uri: vscode.Uri | OneNode): Promise<void> {
    let relativePath = "";
    console.log(uri);
    if (uri instanceof vscode.Uri) {
      relativePath = uri.fsPath;
    } else if (uri instanceof OneNode && uri.tooltip !== undefined && typeof(uri.tooltip) === "string") {
      console.log(uri.tooltip);
      relativePath = uri.tooltip;
    }

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath.toString();
      // console.log(workspacePath);
      // console.log(relativePath);
      if (relativePath.length <= workspacePath.length) {
        // TODO 로그쓰기
        Balloon.error("Invalid Path", false);
        return;
      }

      // TODO: 뭔가 예외상황 있을 듯
      relativePath = '.' + relativePath.substring(workspacePath.length);
    }

    // Create and show a new webview
    const panel = vscode.window.createWebviewPanel(
      MetadataViewerPanel.viewType, // Identifies the type of the webview. Used internally
      'Metadata', // Title of the panel displayed to the user
      vscode.ViewColumn.One, // Editor column to show the new webview panel in.
      {} // Webview options. More on these later.
    );

    const htmlUri = vscode.Uri.joinPath(context.extensionUri, "media", "MetadataViewer", "index.html");
    panel.webview.html = Buffer.from(await vscode.workspace.fs.readFile(htmlUri)).toString();
    // TODO title에 어떻게 스타일주는지, 같은 이름의 파일이 열렸는지 어떻게 확인할 것인지
    // TODO relativePath 말고 이름으로
    panel.title = `Metadata: ${relativePath}`;
  }

  constructor() {}
}

function getMetadata() {
  return {
    "./test.log": {
      "file_extension": "log",
      "create_time": Date(),
      "modified_time": Date(),
      "deleted_time": null,

      "toolchain_version": "toolchain v1.3.0",
      "onecc_version": "1.20.0",
      "operations": {
        "op_total": 50,
        "ops": {
          "conv2d": 1,
          "relu": 1
        }
      },
      "cfg settings": {
        "onecc": {
          "one-import-tf": true,
          "one-import-tflite": false,
          "one-import-onnx": false
        },
        "one-import-tf": {
          "converter_version": "v2",
          "input_array": "a",
          "output_array": "a",
          "input_shapes": "1,299,299"
        }
      }
    }
  };
}