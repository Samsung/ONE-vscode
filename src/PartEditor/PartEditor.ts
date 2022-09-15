/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as cp from 'child_process';
import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';
import * as vscode from 'vscode';

import {BackendColor} from '../CircleGraph/BackendColor';
import {Balloon} from '../Utils/Balloon';
import {getNonce} from '../Utils/external/Nonce';
import {Logger} from '../Utils/Logger';

import {PartGraphEvent, PartGraphSelPanel} from './PartGraphSelector';
import {PartGraphCmdCloseArgs, PartGraphCmdOpenArgs} from './PartGraphSelector';
import {PartGraphCmdFwdSelArgs, PartGraphCmdUpdateArgs} from './PartGraphSelector';
import {PartGraphCmdReloadArgs} from './PartGraphSelector';

type Partition = {
  backends?: {};
  default?: {};
  comply?: {};
};

export interface PartEditorEvent {
  onEditorDispose(e: PartEditor): void;
}

/* istanbul ignore next */
class PartEditor implements PartGraphEvent {
  private _document: vscode.TextDocument;
  private _panel: vscode.WebviewPanel;
  private _id: number;
  private _webview: vscode.Webview;
  private _disposables: vscode.Disposable[] = [];
  private _modelFilePath: string;
  private _modelFileName: string;
  private _modelFolderPath: string;
  private _backEndNames: string[] = [];
  private _backEndColors: string[] = [];
  private _modelWatcher: vscode.FileSystemWatcher|undefined;
  private _reloadTimer: NodeJS.Timer|undefined;
  private _eventHandler: PartEditorEvent|undefined;

  constructor(doc: vscode.TextDocument, panel: vscode.WebviewPanel, id: number) {
    this._document = doc;
    this._panel = panel;
    this._id = id;
    this._webview = panel.webview;

    const lastSlash = this._document.fileName.lastIndexOf(path.sep) + 1;
    const fileNameExt = this._document.fileName.substring(lastSlash);
    const fileExt = path.extname(fileNameExt);

    this._modelFileName = path.basename(fileNameExt, fileExt) + '.circle';
    this._modelFolderPath = this._document.fileName.substring(0, lastSlash);
    this._modelFilePath = this._modelFolderPath + this._modelFileName;
    this._modelWatcher = undefined;
    this._eventHandler = undefined;
  }

  get modelFileName() {
    return this._modelFileName;
  }

  public registerHandlers(handler: PartEditorEvent) {
    this._eventHandler = handler;

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.uri.toString() === this._document.uri.toString()) {
        this.updateWebview();
      }
    });

    this._panel.onDidDispose(() => {
      const args: PartGraphCmdCloseArgs = {docPath: this._document.fileName, id: this._id};
      vscode.commands.executeCommand(PartGraphSelPanel.cmdClose, args);

      if (this._eventHandler) {
        this._eventHandler.onEditorDispose(this);
      }

      changeDocumentSubscription.dispose();
    });

    this._panel.onDidChangeViewState(
        () => {
            // TODO implement
        },
        null, this._disposables);

    // Receive message from the webview.
    this._panel.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'requestBackends':
          // when initialization, request backend list
          this.handleRequestBackends();
          return;

        case 'requestOpNames':
          // after 'requestBackends', request operator names to fill listbox
          this.handleRequestOpNames();
          return;

        case 'requestPartition':
          // after 'requestOpNames', request partition info; op -> backend
          this.handleRequestPartition();
          return;

        case 'updateDocument':
          // when partition has changed
          this.handleUpdateDocument(message);
          return;

        case 'selectByGraph':
          // when user wants graph view
          this.handleSelectByGraph(message);
          return;

        case 'forwardSelection':
          // when operators listbox selection has changed
          this.handleForwardSelection(message.selection);
          return;
      }
    });

    const parsedPath = path.parse(this._document.fileName);
    const circleFile = path.join(parsedPath.dir, parsedPath.name) + '.circle';

    this._modelWatcher = vscode.workspace.createFileSystemWatcher(circleFile);
    this._disposables.push(this._modelWatcher);
    this._modelWatcher.onDidChange(() => this.reloadModel());
    this._modelWatcher.onDidCreate(() => this.reloadModel());
  }

  public loadContent() {
    // TODO revise to get from backend
    // item 0 is initial default backend
    this._backEndNames = ['CPU', 'CPU', 'ACL_CL', 'TRIX'];
    this._backEndColors = ['#303030', '#808000', '#800000', '#008080'];
  }

  private updateWebview() {
    if (this._panel.webview) {
      let content = ini.parse(this._document.getText());
      this._webview.postMessage({command: 'updatePartition', part: content});

      const args: PartGraphCmdUpdateArgs = {
        docPath: this._document.fileName,
        id: this._id,
        docText: this._document.getText()
      };
      vscode.commands.executeCommand(PartGraphSelPanel.cmdUpdate, args);
    }
  }

  private reloadModel() {
    if (this._reloadTimer) {
      clearTimeout(this._reloadTimer);
    }
    this._reloadTimer = setTimeout(() => {
      this.handleRequestOpNames();

      const args: PartGraphCmdReloadArgs = {
        docPath: this._document.fileName,
        id: this._id,
        docText: this._document.getText()
      };
      vscode.commands.executeCommand(PartGraphSelPanel.cmdReload, args);
    }, 500);
  }

  private makeDefaultPartiton() {
    let partition: Partition = {};
    partition.backends = this._backEndNames.slice(1, this._backEndNames.length).join(',');
    partition.default = this._backEndNames[0];
    partition.comply = 'opname';
    return partition;
  }

  private handleSelectByGraph(message: any) {
    let names = message.selection;
    if (typeof names !== 'string') {
      names = '';
    }
    let backends: BackendColor[] = [];
    for (let idx = 1; idx < this._backEndNames.length; idx++) {
      let backend: BackendColor = {};
      backend.name = this._backEndNames[idx];
      backend.color = this.toRGBColor(this._backEndColors[idx]);
      backend.theme = '';
      backends.push(backend);
    }
    for (let idx = 1; idx < this._backEndNames.length; idx++) {
      let backend: BackendColor = {};
      backend.name = this._backEndNames[idx];
      backend.color = this.toRGBColor(this._backEndColors[idx]);
      backend.theme = 'vscode-dark';
      backends.push(backend);
    }
    const args: PartGraphCmdOpenArgs = {
      docPath: this._document.fileName,
      id: this._id,
      docText: this._document.getText(),
      names: names,
      backends: backends,
      viewColumn: this._panel.viewColumn
    };
    vscode.commands.executeCommand(PartGraphSelPanel.cmdOpen, args, this);
  }

  private toRGBColor(color: string) {
    if (color.substring(0, 1) === '#') {
      let code = color.substring(1);
      if (code.length === 6) {
        let codeR = parseInt('0x' + code.substring(0, 2), 16);
        let codeG = parseInt('0x' + code.substring(2, 4), 16);
        let codeB = parseInt('0x' + code.substring(4, 6), 16);
        let rgbColor = `rgb(${codeR}, ${codeG}, ${codeB})`;
        return rgbColor;
      }
    }
    return color;
  }

  private handleRequestBackends() {
    let backends: BackendColor[] = [];
    for (let idx = 0; idx < this._backEndNames.length; idx++) {
      let backend: BackendColor = {};
      backend.name = this._backEndNames[idx];
      backend.color = this._backEndColors[idx];
      backends.push(backend);
    }
    if (this._webview) {
      this._webview.postMessage({command: 'resultBackends', backends: backends});
    }
  }

  private handleRequestOpNames() {
    const K_DATA: string = 'data';
    const K_EXIT: string = 'exit';
    const K_ERROR: string = 'error';
    // TODO integrate with Toolchain
    const tool = '/usr/share/one/bin/circle-operator';
    const toolargs = ['--name', '--code', this._modelFilePath];
    let result: string = '';
    let error: string = '';

    let runPromise = new Promise<string>((resolve, reject) => {
      let cmd = cp.spawn(tool, toolargs, {cwd: this._modelFolderPath});

      cmd.stdout.on(K_DATA, (data: any) => {
        let str = data.toString();
        if (str.length > 0) {
          result = result + str;
        }
      });

      cmd.stderr.on(K_DATA, (data: any) => {
        error = result + data.toString();
        Logger.error('Partition', error);
      });

      cmd.on(K_EXIT, (code: any) => {
        let codestr = code.toString();
        if (codestr === '0') {
          resolve(result);
        } else {
          let msg = 'Failed to load model: ' + this._modelFileName;
          Balloon.error(msg);
          reject(msg);
        }
      });

      cmd.on(K_ERROR, () => {
        let msg = 'Failed to run circle-operator: ' + this._modelFileName;
        Balloon.error(msg);
        reject(msg);
      });
    });

    runPromise
        .then((result) => {
          if (this._webview) {
            this._webview.postMessage({command: 'resultOpNames', names: result});
          }
        })
        .catch((error) => {
          Logger.error('Partition', error);
        });
  }

  private handleRequestPartition() {
    if (this._webview) {
      let content = ini.parse(this._document.getText());
      this._webview.postMessage({command: 'resultPartition', part: content});
    }
  }

  private isValidPartition(partition: any) {
    if (!partition) {
      return false;
    }
    if (!partition.backends || !partition.default || !partition.comply) {
      return false;
    }
    return true;
  }

  private handleUpdateDocument(message: any) {
    let partContent = ini.parse(this._document.getText());

    if (!this.isValidPartition(partContent.partition)) {
      partContent['partition'] = this.makeDefaultPartiton();
    }

    if (Object.prototype.hasOwnProperty.call(message, 'opname')) {
      partContent.OPNAME = message.opname;
    }

    if (Object.prototype.hasOwnProperty.call(message, 'partition')) {
      partContent.partition = message.partition;
    }

    let text = ini.stringify(partContent);
    const edit = new vscode.WorkspaceEdit();
    edit.replace(this._document.uri, new vscode.Range(0, 0, this._document.lineCount, 0), text);
    vscode.workspace.applyEdit(edit);
  }

  private handleForwardSelection(selection: string) {
    const args: PartGraphCmdFwdSelArgs = {
      docPath: this._document.fileName,
      id: this._id,
      selection: selection
    };
    vscode.commands.executeCommand(PartGraphSelPanel.cmdFwdSelection, args);
  }

  // PartGraphEvent implements
  public onSelection(names: string[], _tensors: string[]) {
    this._webview.postMessage({command: 'selectWithNames', selection: names});
  }
}

/* istanbul ignore next */
export class PartEditorProvider implements vscode.CustomTextEditorProvider, PartEditorEvent {
  public static readonly viewType = 'one.editor.part';
  public static readonly folderMediaPartEditor = 'media/PartEditor';

  private static nextId: number = 1;

  private readonly _extensionUri: vscode.Uri;

  private _partEditors: PartEditor[] = [];

  public static register(context: vscode.ExtensionContext): void {
    const provider = new PartEditorProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(PartEditorProvider.viewType, provider, {
        // NOTE: retainContextWhenHidden does not apply when provided to 'webview.options'
        webviewOptions: {retainContextWhenHidden: true},
      })
      // Add command registration here
    ];

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
  }

  public async resolveCustomTextEditor(
      document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    let partEditor = new PartEditor(document, webviewPanel, PartEditorProvider.nextId++);
    this._partEditors.push(partEditor);

    partEditor.registerHandlers(this);
    partEditor.loadContent();

    webviewPanel.webview.options = this.getWebviewOptions(this._extensionUri),
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, partEditor);
  }

  public onEditorDispose(e: PartEditor) {
    this._partEditors.forEach((editor, index) => {
      if (e === editor) {
        this._partEditors.splice(index, 1);
      }
    });
  }

  private getHtmlForWebview(webview: vscode.Webview, partEditor: PartEditor) {
    const htmlPath = this.getMediaPath('index.html');
    let html = fs.readFileSync(htmlPath.fsPath, {encoding: 'utf-8'});

    const nonce = getNonce();
    html = html.replace(/%nonce%/gi, nonce);
    html = html.replace('%webview.cspSource%', webview.cspSource);

    html = this.updateUri(html, webview, '%index.css%', 'index.css');
    html = this.updateUri(html, webview, '%index.js%', 'index.js');

    html = this.updateText(html, webview, '%MODEL_NAME%', partEditor.modelFileName);

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._extensionUri, PartEditorProvider.folderMediaPartEditor, file);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, replaceUri.toString());
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }

  private updateText(html: string, webview: vscode.Webview, search: string, replace: string) {
    return html.replace(search, replace);
  }

  private getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,
      // And restrict the webview to only loading content from our extension's
      // 'media/PartEditor' directory.
      localResourceRoots:
          [vscode.Uri.joinPath(extensionUri, PartEditorProvider.folderMediaPartEditor)]
    };
  }
}
