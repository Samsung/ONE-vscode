/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as vscode from "vscode";

import { Logger } from "../Utils/Logger";
import { getNonce } from "../Utils/external/Nonce";
import { getUri } from "../Utils/external/Uri";
import { MPQData } from "./MPQData";

export class MPQEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "one.editor.mpq";
  public static readonly fileExtension = ".mpq.json";

  private _disposables: vscode.Disposable[] = [];
  private _mpqDataMap: any = {};

  /**
   * register MPQEditorProvider and its commands
   */
  public static register(context: vscode.ExtensionContext): void {
    const provider = new MPQEditorProvider(context);
    const registrations = [
      vscode.window.registerCustomEditorProvider(
        MPQEditorProvider.viewType,
        provider,
        {
          webviewOptions: { retainContextWhenHidden: true },
        }
      ),
      // Add command registration here
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  /**
   * @brief create file with default mpq configuration
   * @returns valid uri of file on success or undefined on failure
   */
  public static async createDefaultMPQ(
    mpqName: string,
    dirPath: string,
    circleName: string
  ): Promise<vscode.Uri | undefined> {
    const content = `{"default_quantization_dtype": "uint8",
      "default_granularity": "channel",
      "layers": [],
      "model_path": "${circleName}"}`;

    // 'uri' path is not occupied, assured by validateInputPath
    const uri = vscode.Uri.file(`${dirPath}/${mpqName}`);

    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri);
    edit.insert(uri, new vscode.Position(0, 0), content);

    try {
      await vscode.workspace.applyEdit(edit);
      let document = await vscode.workspace.openTextDocument(uri);
      document.save();
    } catch (error) {
      return undefined;
    }

    return uri;
  }

  /**
   * @brief Create and open for edit default mpq file
   */
  public static createMPQJson(uri: vscode.Uri): void {
    const dirPath = path.parse(uri.path).dir;
    const modelName = path.parse(uri.path).name;
    const extName = path.parse(uri.path).ext.slice(1);
    const circleName = path.parse(uri.path).base;

    // try to guess unoccupied name for mpq.json
    let mpqName = MPQEditorProvider.findMPQName(modelName, dirPath);
    if (mpqName === undefined) {
      // failed to find valid name, just revert to initial version
      mpqName = modelName + MPQEditorProvider.fileExtension;
    }

    vscode.window
      .showInputBox({
        title: `Create mixed precision quantization configuration for '${modelName}.${extName}' :`,
        placeHolder: `Enter a file name`,
        value: mpqName,
        valueSelection: [
          0,
          mpqName.length - `${MPQEditorProvider.fileExtension}`.length,
        ],
        validateInput: (mpqName: string): string | undefined => {
          return MPQEditorProvider.validateMPQName(dirPath, mpqName);
        },
      })
      .then((value) => {
        if (!value) {
          Logger.debug("MPQEditor", "User hit the escape key!");
          return;
        }

        MPQEditorProvider.createDefaultMPQ(value!, dirPath, circleName).then(
          (uri) => {
            if (uri) {
              vscode.commands.executeCommand(
                "vscode.openWith",
                uri,
                MPQEditorProvider.viewType
              );
            } else {
              Logger.error(
                "MPQEditor",
                "createMPQJson",
                `Failed to create mpq file for the ${value}!`
              );
            }
          }
        );
      });
  }

  /**
   * @brief A helper function to validate mpqName
   * @note It checks whether
   * (1) 'mpqName' already exists in 'dirPath' directory
   * (2) 'mpqName' has valid extension
   * @returns 'undefined' on success or the cause of failure otherwise
   */
  public static validateMPQName(
    dirPath: string,
    mpqName: string
  ): string | undefined {
    const mpqPath: string = path.join(dirPath, mpqName);

    if (!mpqPath.endsWith(MPQEditorProvider.fileExtension)) {
      return "A file extension must be " + MPQEditorProvider.fileExtension;
    }

    if (fs.existsSync(mpqPath)) {
      return `A file or folder ${mpqPath} already exists at this location. Please choose a different name.`;
    }

    return undefined;
  }

  /**
   * @brief A helper function to find unoccupied mpq file-name
   * @returns valid file name for mpq configuration or undefined on failure
   * @throw Error, when input is invalid (e.g. baseMPQName is empty)
   */
  public static findMPQName(
    baseMPQName: string,
    dirPath: string
  ): string | undefined {
    if (baseMPQName.length === 0) {
      throw new Error("Invalid mixed precision quantization file name");
    }

    const baseName = baseMPQName;
    let mpqName: string | undefined = undefined;

    const options = { cwd: dirPath };
    // set maximal trials as maximal quantity of files + 1
    const files = glob.sync("*" + MPQEditorProvider.fileExtension, options);
    const maxMPQIndex = files.length + 1;

    for (let i = 0; i < maxMPQIndex; i++) {
      mpqName = baseMPQName + MPQEditorProvider.fileExtension;
      const mpqPath: string = path.join(dirPath, mpqName);
      if (!fs.existsSync(mpqPath)) {
        break;
      }
      baseMPQName = baseName + `(${i + 1})`;
      mpqName = undefined;
    }

    return mpqName;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when custom editor is opened.
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._mpqDataMap[document.uri.toString()] = new MPQData();
    await this.initWebview(document, webviewPanel);
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private async initWebview(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    const webview: vscode.Webview = webviewPanel.webview;

    webview.options = {
      enableScripts: true,
    };

    const nonce = getNonce();
    const scriptUri = getUri(webview, this.context.extensionUri, [
      "media",
      "MPQEditor",
      "index.js",
    ]);
    const styleUri = getUri(webview, this.context.extensionUri, [
      "media",
      "MPQEditor",
      "style.css",
    ]);
    const codiconUri = getUri(webview, this.context.extensionUri, [
      "node_modules",
      "@vscode",
      "codicons",
      "dist",
      "codicon.css",
    ]);
    const toolkitUri = getUri(webview, this.context.extensionUri, [
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);
    const htmlUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media/MPQEditor/index.html"
    );
    let html = Buffer.from(
      await vscode.workspace.fs.readFile(htmlUri)
    ).toString();
    html = html.replace(/\${nonce}/g, `${nonce}`);
    html = html.replace(/\${webview.cspSource}/g, `${webview.cspSource}`);
    html = html.replace(/\${scriptUri}/g, `${scriptUri}`);
    html = html.replace(/\${toolkitUri}/g, `${toolkitUri}`);
    html = html.replace(/\${cssUri}/g, `${styleUri}`);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    webview.html = html;

    //TODO process messages
  }

  /**
   * @brief Update document by text
   */
  public static async updateDocumentBy(
    document: vscode.TextDocument,
    text: string
  ) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      text
    );
    await vscode.workspace.applyEdit(edit);
  }
}
