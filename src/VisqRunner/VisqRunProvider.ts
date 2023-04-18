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
import * as path from "path";
import * as vscode from "vscode";

import { Logger } from "../Utils/Logger";
import { getNonce } from "../Utils/external/Nonce";
import { getUri } from "../Utils/external/Uri";
import { JobRunner } from "../Job/JobRunner";
import { Command } from "../Backend/Command";
import { WorkJobs } from "../Job/WorkJobs";
import { JobCommand } from "../Job/JobCommand";
import { JobType } from "../Job/Job";
import { Balloon } from "../Utils/Balloon";

class VisqCommand extends JobCommand {
  constructor(cmd: Command) {
    super(cmd);
    this.jobType = JobType.tVisq;
    this.name = "visq";
    this.notiTitle = "Running visq...";
    this.valid = true;
  }
}

class VISQCfgData {
  private _content: any;

  static floatModelKey: string = "fp32_circle";
  static quantizedModelKey: string = "q_circle";
  static dataKey: string = "data";
  static mpeirOutputKey: string = "mpeir_output";
  static mseOutputKey: string = "mse_output";
  static taeOutputKey: string = "tae_output";
  static srmseOutputKey: string = "srmse_output";
  static dumpDotKey: string = "dump_dot_graph";
  static mpeirOnKey: string = "mpeir_on";
  static mseOnKey: string = "mse_on";
  static taeOnKey: string = "tae_on";
  static srmseOnKey: string = "srmse_on";

  static keys: string[] = [
    VISQCfgData.floatModelKey,
    VISQCfgData.quantizedModelKey,
    VISQCfgData.dataKey,
  ];

  static metricKeys: { [metric: string]: any } = {
    mpeir: [VISQCfgData.mpeirOnKey, VISQCfgData.mpeirOutputKey],
    mse: [VISQCfgData.mseOnKey, VISQCfgData.mseOutputKey],
    tae: [VISQCfgData.taeOnKey, VISQCfgData.taeOutputKey],
    srmse: [VISQCfgData.srmseOnKey, VISQCfgData.srmseOutputKey],
  };

  constructor() {
    this._content = {};
  }

  getAsString(): string {
    return JSON.stringify(this._content, null, " ");
  }

  setWithString(text: string) {
    this._content = JSON.parse(text);
  }

  getToolArgs(): string[] {
    let args: string[] = [];
    // set inputs
    for (let key of VISQCfgData.keys) {
      if (key in this._content) {
        args.push("--" + key);
        args.push(this._content[key]);
      }
    }

    {
      for (let metric in VISQCfgData.metricKeys) {
        const onKey = VISQCfgData.metricKeys[metric][0];
        const outputKey = VISQCfgData.metricKeys[metric][1];
        if (
          onKey in this._content &&
          this._content[onKey] &&
          outputKey in this._content
        ) {
          args.push("--" + outputKey);
          args.push(this._content[outputKey]);
        }
      }
    }

    // set options
    if (
      VISQCfgData.dumpDotKey in this._content &&
      this._content[VISQCfgData.dumpDotKey]
    ) {
      args.push("--" + VISQCfgData.dumpDotKey);
    }

    return args;
  }

  getOutputFiles(): string[] {
    let outputs: string[] = [];
    for (let metric in VISQCfgData.metricKeys) {
      const onKey = VISQCfgData.metricKeys[metric][0];
      const outputKey = VISQCfgData.metricKeys[metric][1];
      if (
        onKey in this._content &&
        this._content[onKey] &&
        outputKey in this._content
      ) {
        outputs.push(this._content[outputKey]);
      }
    }

    return outputs;
  }

  setFloatModel(model: string): void {
    this._content[VISQCfgData.floatModelKey] = model;
  }

  setQuantizedModel(model: string): void {
    this._content[VISQCfgData.quantizedModelKey] = model;
  }

  setH5Data(data: string): void {
    this._content[VISQCfgData.dataKey] = data;
  }

  setMPEIROutputPath(path: string): void {
    this._content[VISQCfgData.mpeirOutputKey] = path;
  }

  setMSEOutputPath(path: string): void {
    this._content[VISQCfgData.mseOutputKey] = path;
  }

  setTAEOutputPath(path: string): void {
    this._content[VISQCfgData.taeOutputKey] = path;
  }

  setSRMSEOutputPath(path: string): void {
    this._content[VISQCfgData.srmseOutputKey] = path;
  }

  setDumpDot(dump: boolean): void {
    this._content[VISQCfgData.dumpDotKey] = dump;
  }

  setMPEIROn(on: boolean): void {
    this._content[VISQCfgData.mpeirOnKey] = on;
  }

  setMSEOn(on: boolean): void {
    this._content[VISQCfgData.mseOnKey] = on;
  }

  setTAEOn(on: boolean): void {
    this._content[VISQCfgData.taeOnKey] = on;
  }

  setSRMSEOn(on: boolean): void {
    this._content[VISQCfgData.srmseOnKey] = on;
  }
}

export class VISQRunProvider implements vscode.CustomTextEditorProvider {
  public static readonly viewType = "one.editor.cfgvisq";
  public static readonly fileExtension = ".cfg.visq.json";

  private _disposables: vscode.Disposable[] = [];
  private _cfgDataMap: any = {};

  public static register(context: vscode.ExtensionContext): void {
    const provider = new VISQRunProvider(context);
    const registrations = [
      vscode.window.registerCustomEditorProvider(
        VISQRunProvider.viewType,
        provider,
        {
          webviewOptions: { retainContextWhenHidden: true },
        }
      ),
      // Add command registration here
      vscode.commands.registerCommand(
        "one.editor.visqcfg.showFromDefaultExplorer",
        (uri, selected) => {
          // parse selection to get float model, quantized model, data path
          let circleModels: string[] = [];
          let h5Data: string = "";
          for (let uri of selected) {
            const extName = path.parse(uri.path).ext.slice(1);
            if (extName === "circle") {
              circleModels.push(uri.path);
            } else if (extName === "h5") {
              h5Data = uri.path;
            }
          }
          if (circleModels.length < 1 || circleModels.length > 2) {
            // TODO
            return;
          }
          let floatModel = circleModels[0];
          let quantizedModel =
            circleModels.length === 2 ? circleModels[1] : undefined;
          if (quantizedModel !== undefined) {
            if (
              floatModel.toLowerCase().includes(".q8") ||
              floatModel.toLowerCase().includes(".q16")
            ) {
              [floatModel, quantizedModel] = [quantizedModel, floatModel];
            }
          }
          const dirPath = path.parse(floatModel).dir;
          const modelName = path.parse(floatModel).name;
          const extName = path.parse(floatModel).ext.slice(1);

          let defData = new VISQCfgData();
          defData.setFloatModel(floatModel);
          if (quantizedModel !== undefined) {
            defData.setQuantizedModel(quantizedModel);
          }
          if (h5Data.length > 0) {
            defData.setH5Data(h5Data);
          }
          let msePath: string = path.join(
            dirPath,
            modelName + ".mse.visq.json"
          );
          defData.setMSEOutputPath(msePath);
          defData.setMSEOn(true);

          let mpeirPath: string = path.join(
            dirPath,
            modelName + ".mpeir.visq.json"
          );
          defData.setMPEIROutputPath(mpeirPath);
          defData.setMPEIROn(true);

          let taePath: string = path.join(
            dirPath,
            modelName + ".tae.visq.json"
          );
          defData.setTAEOutputPath(taePath);
          defData.setTAEOn(true);

          let srmsePath: string = path.join(
            dirPath,
            modelName + ".srmse.visq.json"
          );
          defData.setSRMSEOutputPath(srmsePath);
          defData.setSRMSEOn(true);

          defData.setDumpDot(false);

          const content = defData.getAsString();

          const findInputPath = (name: string): string => {
            const maxIters = 5;
            for (let i = 0; i < maxIters; i++) {
              const mpqPath: string = path.join(
                dirPath,
                name + VISQRunProvider.fileExtension
              );
              if (!fs.existsSync(mpqPath)) {
                return name + VISQRunProvider.fileExtension;
              }
              name = name + "(1)";
            }
            return "";
          };

          let cfgName = findInputPath(modelName);
          if (cfgName.length < 1) {
            // failed to find valid name, just revert to initial version
            cfgName = modelName + VISQRunProvider.fileExtension;
          }

          const validateInputPath = (name: string): string | undefined => {
            const cfgPath: string = path.join(dirPath, name);
            if (!cfgPath.endsWith(VISQRunProvider.fileExtension)) {
              return (
                "A file extension must be " + VISQRunProvider.fileExtension
              );
            }
            if (fs.existsSync(cfgPath)) {
              return `A file or folder ${cfgPath} already exists at this location. Please choose a different name.`;
            }
          };

          vscode.window
            .showInputBox({
              title: `Create visq run configuration for '${modelName}.${extName}' :`,
              placeHolder: `Enter a file name`,
              value: cfgName,
              valueSelection: [
                0,
                cfgName.length - `${VISQRunProvider.fileExtension}`.length,
              ],
              validateInput: validateInputPath,
            })
            .then((value) => {
              if (!value) {
                Logger.debug("VISQRunProvider", "User hit the escape key!");
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
                      VISQRunProvider.viewType
                    );
                  });
                } else {
                  Logger.error(
                    "VisqCfgRunner",
                    "CreateVisqCfg",
                    `Failed to create the file ${uri}`
                  );
                }
              });
            });
        }
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._cfgDataMap[document.uri.toString()] = new VISQCfgData();
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
      "VisqRunner",
      "index.js",
    ]);
    const styleUri = getUri(webview, this.context.extensionUri, [
      "media",
      "VisqRunner",
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
      "media/VisqRunner/index.html"
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
        case "requestDisplayCFG":
          this.updateWebview(document, webview);
          break;
        case "loadFloatInputFile":
          this.handleLoadInputFile(true, document);
          break;
        case "loadQuantizedInputFile":
          this.handleLoadInputFile(false, document);
          break;
        case "loadH5DataFile":
          this.handleLoadH5DataFile(document);
          break;
        case "loadMPEIROutputFile":
          this.handleLoadMPEIRInputFile(document);
          break;
        case "loadMSEOutputFile":
          this.handleLoadMSEInputFile(document);
          break;
        case "loadTAEOutputFile":
          this.handleLoadTAEInputFile(document);
          break;
        case "loadSRMSEOutputFile":
          this.handleLoadSRMSEInputFile(document);
          break;
        case "dumpDot":
          this.handleDumpDotToggled(e.dump, document);
          break;
        case "runCfg":
          this.handleRunCfg(document);
          break;
        case "toggleMPEIROutputFile":
          this.handleMPEIRToggle(e.on, document);
          break;
        case "toggleMSEOutputFile":
          this.handleMSEToggle(e.on, document);
          break;
        case "toggleTAEOutputFile":
          this.handleTAEToggle(e.on, document);
          break;
        case "toggleSRMSEOutputFile":
          this.handleSRMSEToggle(e.on, document);
          break;
        case "onMPEIRChanged":
          this.handleMPEIRChanged(e.path, document);
          break;
        case "onMSEChanged":
          this.handleMSEChanged(e.path, document);
          break;
        case "onTAEChanged":
          this.handleTAEChanged(e.path, document);
          break;
        case "onSRMSEChanged":
          this.handleSRMSEhanged(e.path, document);
          break;
        default:
          break;
      }
    });
  }

  private handleLoadInputFile(float: boolean, document: vscode.TextDocument) {
    let filters = {};
    if (float) {
      filters = { "target files": ["circle"] };
    } else {
      filters = { "target files": ["q8.circle", "q16.circle", "circle"] };
    }

    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: filters,
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();

        let docUri = document.uri.toString();
        if (float) {
          this._cfgDataMap[docUri].setFloatModel(path);
        } else {
          this._cfgDataMap[docUri].setQuantizedModel(path);
        }
        this.updateDocument(document);
      }
    });
  }

  private handleLoadH5DataFile(document: vscode.TextDocument) {
    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: { "target files": ["h5"] },
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();
        this._cfgDataMap[document.uri.toString()].setH5Data(path);
        this.updateDocument(document);
      }
    });
  }

  private handleLoadMPEIRInputFile(document: vscode.TextDocument) {
    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: { "target files": ["mpeir.visq.json"] },
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();
        this._cfgDataMap[document.uri.toString()].setMPEIROutputPath(path);
        this.updateDocument(document);
      }
    });
  }

  private handleLoadMSEInputFile(document: vscode.TextDocument) {
    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: { "target files": ["mse.visq.json"] },
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();
        this._cfgDataMap[document.uri.toString()].setMSEOutputPath(path);
        this.updateDocument(document);
      }
    });
  }

  private handleLoadTAEInputFile(document: vscode.TextDocument) {
    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: { "target files": ["tae.visq.json"] },
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();
        this._cfgDataMap[document.uri.toString()].setTAEOutputPath(path);
        this.updateDocument(document);
      }
    });
  }

  private handleLoadSRMSEInputFile(document: vscode.TextDocument) {
    const dialogOptions = {
      canSelectMany: false,
      canSelectFolders: false,
      openLabel: "Open",
      filters: { "target files": ["mse.visq.json"] },
    };

    vscode.window.showOpenDialog(dialogOptions).then((fileUri) => {
      if (fileUri && fileUri[0]) {
        const path = fileUri[0].fsPath.toString();
        this._cfgDataMap[document.uri.toString()].setSRMSEOutputPath(path);
        this.updateDocument(document);
      }
    });
  }

  private handleRunCfg(document: vscode.TextDocument) {
    // as for now installed visq doesn't work because it lacks DotBuilder.py
    // which is not included into installation
    const tool =
      "/home/stanislav/repos/ONE_f/ONE/build/release_build_4/bin/visq"; //"/usr/share/one/bin/visq";
    const cmd = new Command(tool);
    const toolargs: string[] =
      this._cfgDataMap[document.uri.toString()].getToolArgs();
    toolargs.forEach((option) => {
      cmd.push(option);
    });
    let visqJob = new VisqCommand(cmd);
    visqJob.successCallback = () => {
      Balloon.info("Running visq has succeeded.");
      const outputs: string[] =
        this._cfgDataMap[document.uri.toString()].getOutputFiles();
      for (let output of outputs) {
        let uri: vscode.Uri = vscode.Uri.file(output);
        vscode.commands.executeCommand("vscode.open", uri);
      }
    };

    visqJob.failureCallback = () => {
      Balloon.error("Running visq has failed.");
    };

    let jobs = new WorkJobs(visqJob);
    let runner = new JobRunner();
    runner.start(jobs);
  }

  private handleDumpDotToggled(dump: boolean, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setDumpDot(dump);
    this.updateDocument(document);
  }

  private handleMPEIRToggle(on: boolean, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setMPEIROn(on);
    this.updateDocument(document);
  }

  private handleMSEToggle(on: boolean, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setMSEOn(on);
    this.updateDocument(document);
  }

  private handleTAEToggle(on: boolean, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setTAEOn(on);
    this.updateDocument(document);
  }

  private handleSRMSEToggle(on: boolean, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setSRMSEOn(on);
    this.updateDocument(document);
  }

  private handleMPEIRChanged(path: string, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setMPEIROutputPath(path);
    this.updateDocument(document);
  }

  private handleMSEChanged(path: string, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setMSEOutputPath(path);
    this.updateDocument(document);
  }

  private handleTAEChanged(path: string, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setTAEOutputPath(path);
    this.updateDocument(document);
  }

  private handleSRMSEhanged(path: string, document: vscode.TextDocument) {
    this._cfgDataMap[document.uri.toString()].setSRMSEOutputPath(path);
    this.updateDocument(document);
  }

  private updateDocument(document: vscode.TextDocument) {
    if (
      this._cfgDataMap[document.uri.toString()].getAsString() !==
      document.getText()
    ) {
      // TODO Optimize this to modify only changed lines
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(0, 0, document.lineCount, 0),
        this._cfgDataMap[document.uri.toString()].getAsString()
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
      VISQRunProvider.viewType,
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
          VISQRunProvider.viewType,
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
        VISQRunProvider.viewType,
        false
      );
    });
  }

  private updateWebview(
    document: vscode.TextDocument,
    webview: vscode.Webview
  ): void {
    this._cfgDataMap[document.uri.toString()].setWithString(document.getText());
    const content = JSON.parse(document.getText());
    if (content !== undefined) {
      webview.postMessage({
        type: "displayCFG",
        content: content,
      });
    }
  }
}
