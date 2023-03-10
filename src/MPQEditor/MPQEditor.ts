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

import * as cp from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { Balloon } from "../Utils/Balloon";
import { Logger } from "../Utils/Logger";
import { getNonce } from "../Utils/external/Nonce";
import { getUri } from "../Utils/external/Uri";

class MPQData {
  private _content: any;
  private _allModelNodes: string[] | undefined;
  private _modelNodes?: string[];
  private _selectedNodes: Set<string>;
  private _visqPath: string = ""; // empty means no visqData is provided

  static _layersKey: string = "layers";
  static _nameKey: string = "name";
  static _defQuantizationKey: string = "default_quantization_dtype";
  static _defGranularityKey: string = "default_granularity";

  constructor() {
    this._selectedNodes = new Set<string>();
  }

  getAsString(): string {
    return JSON.stringify(this._content, null, " ");
  }

  getValue(key: string): string {
    return this._content[key].toString();
  }

  setWithString(text: string) {
    this._content = JSON.parse(text);
  }

  updateSection(section: string, value: string) {
    this._content[section] = value;
  }

  setAllModelNodes(modelNodes: string[]) {
    this._allModelNodes = modelNodes.filter((name) => name.length > 0);
    //filter by content
    this.filterModelNodesbyContent();
  }

  filterModelNodesbyContent() {
    let curLayers = this.getLayers();
    this.filterModelNodesBy(curLayers);
  }

  getLayers() {
    return this._content[MPQData._layersKey].map(
      (item: any) => item[MPQData._nameKey]
    );
  }

  setLayers(names: string[]): string[] {
    let layersToAdd = Array<string>();
    let layersToDelete = Array<string>();
    this._content[MPQData._layersKey].forEach((layer: any) => {
      let foundIndex = names.findIndex(
        (name: string) => name === layer[MPQData._nameKey]
      );
      if (foundIndex < 0) {
        // name to delete
        layersToDelete.push(layer["name"]);
      }
    });
    names.forEach((name: any) => {
      let foundIndex = this._content[MPQData._layersKey].findIndex(
        (x: any) => x[MPQData._nameKey] === name
      );
      if (foundIndex < 0) {
        // name to add
        layersToAdd.push(name);
      }
    });
    this.removeModelNodesFromLayers(layersToDelete);
    this.addLayers(layersToAdd);

    return layersToAdd;
  }

  addLayers(names: string[]): void {
    if (names.length < 1) {
      return;
    }

    const otherQuantization =
      this._content[MPQData._defQuantizationKey] === "uint8"
        ? "int16"
        : "uint8";
    let quantization = Array<string>(names.length);
    quantization.fill(otherQuantization);
    let granularity = Array<string>(names.length);
    granularity.fill(this._content[MPQData._defGranularityKey]);
    this.updateLayers(names, quantization, granularity);
  }

  filterModelNodesBy(filter: string[]) {
    this._modelNodes = this._allModelNodes?.filter(
      (name) => filter.find((filterName) => name === filterName) === undefined
    );
  }

  getAllModelNodes(): string[] | undefined {
    return this._modelNodes;
  }

  updateLayers(names: string[], quantization: string[], granularity: string[]) {
    if (!(MPQData._layersKey in this._content)) {
      this._content[MPQData._layersKey] = [];
    }
    for (let i = 0; i < names.length; i++) {
      let layer = {
        name: names[i],
        dtype: quantization[i],
        granularity: granularity[i],
      };
      this._content[MPQData._layersKey].push(layer);
    }
    this.filterModelNodesbyContent();
  }

  updateSectionOfLayer(name: string, section: string, value: string) {
    let layer = this._content[MPQData._layersKey].find(
      (x: any) => x["name"] === name
    );
    if (layer) {
      layer[section] = value;
    }
  }

  getSelected(): Set<string> {
    return this._selectedNodes;
  }

  clearSelection() {
    this._selectedNodes.clear();
  }

  removeModelNodesFromLayers(names: any) {
    names.forEach((name: any) => {
      let foundIndex = this._content[MPQData._layersKey].findIndex(
        (x: any) => x["name"] === name
      );
      if (foundIndex > -1) {
        this._content[MPQData._layersKey].splice(foundIndex, 1);
      }
    });
    this.filterModelNodesbyContent();
  }

  getVisqPath(): string {
    return this._visqPath;
  }

  setVisqPath(path: string): void {
    this._visqPath = path;
  }
}

export class MPQEditorProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "one.editor.mpq";
  public static readonly fileExtension = ".mpq.json";

  private _disposables: vscode.Disposable[] = [];
  private _mpqDataMap: any = {};

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
      vscode.commands.registerCommand(
        "one.editor.mpq.showFromDefaultExplorer",
        (uri) => {
          MPQEditorProvider.createMPQJson(uri);
        }
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  public static createMPQJson(uri: vscode.Uri): void {
    const dirPath = path.parse(uri.path).dir;
    const modelName = path.parse(uri.path).name;
    const extName = path.parse(uri.path).ext.slice(1);
    const circleName = path.parse(uri.path).base;

    const content =
      '{"default_quantization_dtype": "uint8",' +
      '"default_granularity": "channel",' +
      '"layers": [],' +
      '"model_path": ' +
      '"' +
      circleName +
      '"' +
      "}";

    const findInputPath = (mpqName: string): string => {
      const maxIters = 5;
      for (let i = 0; i < maxIters; i++) {
        const mpqPath: string = path.join(
          dirPath,
          mpqName + MPQEditorProvider.fileExtension
        );
        if (!fs.existsSync(mpqPath)) {
          return mpqName + MPQEditorProvider.fileExtension;
        }
        mpqName = mpqName + "(1)";
      }
      return "";
    };

    let mpqName = findInputPath(modelName);
    if (mpqName.length < 1) {
      // failed to find valid name, just revert to initial version
      mpqName = modelName + MPQEditorProvider.fileExtension;
    }

    const validateInputPath = (mpqName: string): string | undefined => {
      const mpqPath: string = path.join(dirPath, mpqName);

      if (!mpqPath.endsWith(MPQEditorProvider.fileExtension)) {
        return "A file extension must be " + MPQEditorProvider.fileExtension;
      }

      if (fs.existsSync(mpqPath)) {
        return `A file or folder ${mpqPath} already exists at this location. Please choose a different name.`;
      }
    };

    vscode.window
      .showInputBox({
        title: `Create mixed precision quantization configuration for '${modelName}.${extName}' :`,
        placeHolder: `Enter a file name`,
        value: mpqName,
        valueSelection: [
          0,
          mpqName.length - `${MPQEditorProvider.fileExtension}`.length,
        ],
        validateInput: validateInputPath,
      })
      .then((value) => {
        if (!value) {
          Logger.debug("MPQEditor", "User hit the escape key!");
          return;
        }

        // 'uri' path is not occupied, assured by validateInputPath
        const uri = vscode.Uri.file(`${dirPath}/${value}`);

        const edit = new vscode.WorkspaceEdit();
        edit.createFile(uri);
        edit.insert(uri, new vscode.Position(0, 0), content);

        vscode.workspace.applyEdit(edit).then((isSuccess) => {
          if (isSuccess) {
            vscode.workspace.openTextDocument(uri).then((document) => {
              document.save();
              vscode.commands.executeCommand(
                "vscode.openWith",
                uri,
                MPQEditorProvider.viewType
              );
            });
          } else {
            Logger.error(
              "MPQEditor",
              "CreateMPQ",
              `Failed to create the file ${uri}`
            );
          }
        });
      });
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._mpqDataMap[document.uri.toString()] = new MPQData();
    await this.initWebview(document, webviewPanel);
    this.initWebviewPanel(document, webviewPanel);
    this.updateWebview(document, webviewPanel.webview);
  }

  private async initWebview(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): Promise<void> {
    let webview: vscode.Webview = webviewPanel.webview;

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

    // Receive message from the webview.
    webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case "requestDisplayMPQ":
          this.updateWebview(document, webview);
          break;
        case "addSpecificLayerFromDialog":
          this.hadleAddSpecificLayerFromDialog(document);
          break;
        case "setModelNodesToDefault":
          this._mpqDataMap[document.uri.toString()].removeModelNodesFromLayers(
            e.names
          );
          break;
        case "removeSelectedFromLayers":
          this.handleRemoveSelectedFromLayers(document, webview);
          break;
        case "updateLayers":
          this._mpqDataMap[document.uri.toString()].updateLayers(
            e.names,
            e.quantization,
            e.granularity
          );
          break;
        case "updateSpecificQuantization":
          this._mpqDataMap[document.uri.toString()].updateSectionOfLayer(
            e.name,
            "dtype",
            e.value
          );
          break;
        case "updateSpecificGranularity":
          this._mpqDataMap[document.uri.toString()].updateSectionOfLayer(
            e.name,
            "granularity",
            e.value
          );
          break;
        case "requestModelNodes":
          this.handleRequestModelNodes(document, webview);
          break;
        case "updateSection":
          this._mpqDataMap[document.uri.toString()].updateSection(
            e.section,
            e.value
          );
          break;
        case "updateDocument":
          this.updateDocument(document);
          break;
        case "removeLayer":
          this.handleRemoveLayerFromLayers(e.name, document, webview);
          break;
        default:
          break;
      }
    });
  }

  private updateDocument(document: vscode.TextDocument) {
    if (
      this._mpqDataMap[document.uri.toString()].getAsString() !==
      document.getText()
    ) {
      // TODO Optimize this to modify only changed lines
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        this._mpqDataMap[document.uri.toString()].getAsString()
      );
      vscode.workspace.applyEdit(edit);
    }
  }

  private initWebviewPanel(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ): void {
    vscode.commands.executeCommand(
      "setContext",
      MPQEditorProvider.viewType,
      true
    );

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (
          e.contentChanges.length > 0 &&
          e.document.uri.toString() === document.uri.toString()
        ) {
          this.updateWebview(document, webviewPanel.webview);
        }
      }
    );

    webviewPanel.onDidChangeViewState(
      () => {
        vscode.commands.executeCommand(
          "setContext",
          MPQEditorProvider.viewType,
          webviewPanel.visible
        );
      },
      null,
      this._disposables
    );

    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
      while (this._disposables.length) {
        const x = this._disposables.pop();
        if (x) {
          x.dispose();
        }
      }
      vscode.commands.executeCommand(
        "setContext",
        MPQEditorProvider.viewType,
        false
      );
    });
  }

  private updateWebview(
    document: vscode.TextDocument,
    webview: vscode.Webview
  ): void {
    this._mpqDataMap[document.uri.toString()].setWithString(document.getText());
    const content = JSON.parse(document.getText());
    if (content !== undefined) {
      webview.postMessage({
        type: "displayMPQ",
        content: content,
      });
    }
  }

  private hadleAddSpecificLayerFromDialog(document: vscode.TextDocument) {
    const nodes = this._mpqDataMap[document.uri.toString()].getAllModelNodes();
    const pickOptions = {
      canPickMany: true,
    };

    vscode.window
      .showQuickPick(nodes, pickOptions)
      .then((values: string | undefined) => {
        if (!values) {
          return;
        }

        this._mpqDataMap[document.uri.toString()].addLayers(values);
        this.updateDocument(document);
      });
  }

  private handleRemoveSelectedFromLayers(
    document: vscode.TextDocument,
    webview: vscode.Webview
  ) {
    let curConf = this._mpqDataMap[document.uri.toString()];
    let selection = curConf.getSelected();

    curConf.removeModelNodesFromLayers(selection);
    curConf.clearSelection();

    this.updateDocument(document);
    webview.postMessage({
      type: "selectionChanged",
      names: Array<string>(),
    });
  }

  private handleRemoveLayerFromLayers(
    name: string,
    document: vscode.TextDocument,
    webview: vscode.Webview
  ) {
    let curConf = this._mpqDataMap[document.uri.toString()];

    curConf.removeModelNodesFromLayers([name]);
    curConf.clearSelection();

    this.updateDocument(document);
    webview.postMessage({
      type: "selectionChanged",
      names: Array<string>(),
    });
  }

  private getModelFilePath(document: vscode.TextDocument): string {
    const dirPath = path.parse(document.uri.path).dir;
    let fileName =
      this._mpqDataMap[document.uri.toString()].getValue("model_path");
    return path.join(dirPath, fileName);
  }

  private handleRequestModelNodes(
    document: vscode.TextDocument,
    webview: vscode.Webview
  ): void {
    const K_DATA: string = "data";
    const K_EXIT: string = "exit";
    const K_ERROR: string = "error";
    let modelFilePath = this.getModelFilePath(document);

    // TODO integrate with Toolchain
    const tool = "/usr/share/one/bin/circle-operator";
    if (!fs.existsSync(tool)) {
      // check whether it is installed
      Balloon.info(
        "To add more layers for editing please install ONE-toolchain"
      );
      return;
    }

    const toolargs = ["--name", modelFilePath];
    let result: string = "";
    let error: string = "";

    let runPromise = new Promise<string>((resolve, reject) => {
      let cmd = cp.spawn(tool, toolargs, { shell: false });

      cmd.stdout.on(K_DATA, (data: any) => {
        let str = data.toString();
        if (str.length > 0) {
          result = result + str;
        }
      });

      cmd.stderr.on(K_DATA, (data: any) => {
        error = result + data.toString();
        Logger.error("MPQEditor", error);
      });

      cmd.on(K_EXIT, (code: any) => {
        let codestr = code.toString();
        if (codestr === "0") {
          resolve(result);
        } else {
          let msg = "Failed to load model: " + modelFilePath;
          Balloon.error(msg);
          reject(msg);
        }
      });

      cmd.on(K_ERROR, () => {
        let msg = "Failed to run circle-operator: " + modelFilePath;
        Balloon.error(msg);
        reject(msg);
      });
    });

    runPromise
      .then((names) => {
        const nodesNames = names.split(/\r?\n/);
        this._mpqDataMap[document.uri.toString()].setAllModelNodes(nodesNames);
        webview.postMessage({
          type: "modelNodesChanged",
          names: nodesNames,
        });
      })
      .catch((error) => {
        Logger.error("MPQEditor", error);
      });
  }
}
