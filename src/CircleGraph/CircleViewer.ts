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

import * as vscode from 'vscode';

import {CircleGraphCtrl} from './CircleGraphCtrl';


/**
 * @brief Viewer control with CircleGraphCtrl
 */
/* istanbul ignore next */
class CircleViewer extends CircleGraphCtrl {
  private readonly _panel: vscode.WebviewPanel;

  constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    super(extensionUri, panel.webview);
    this._panel = panel;
  }

  public owner(panel: vscode.WebviewPanel) {
    return this._panel === panel;
  }
}

/**
 * @brief Readonly CustomDocument for circle model
 * @note  Actual content is handled by CircleGraphCtrl itself so documment
 *        only provides URI of the file
 */
/* istanbul ignore next */
export class CircleViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _circleViewer: CircleViewer[];
  private _fileWatcher: vscode.FileSystemWatcher|undefined;
  private _reloadTimer: NodeJS.Timer|undefined;

  static async create(uri: vscode.Uri):
      Promise<CircleViewerDocument|PromiseLike<CircleViewerDocument>> {
    return new CircleViewerDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
    this._uri = uri;
    this._circleViewer = [];
    this._fileWatcher = undefined;
    this._reloadTimer = undefined;
  }

  public get uri() {
    return this._uri;
  }

  // CustomDocument implements
  dispose(): void {
    // NOTE panel is closed before document and this is just for safety
    this._circleViewer.forEach((view) => {
      view.disposeGraphCtrl();
    });
    this._circleViewer = [];
  }

  public openView(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    let view = new CircleViewer(panel, extensionUri);
    view.initGraphCtrl(this.uri.fsPath, undefined);
    view.loadContent();
    this._circleViewer.push(view);

    this._fileWatcher = vscode.workspace.createFileSystemWatcher(this._uri.path);
    this._fileWatcher.onDidChange(() => this.reload(panel));
    this._fileWatcher.onDidCreate(() => this.reload(panel));

    panel.onDidDispose(() => {
      // TODO make faster
      this._circleViewer.forEach((view, index) => {
        if (view.owner(panel)) {
          view.disposeGraphCtrl();
          this._circleViewer.splice(index, 1);
        }
      });
      if (this._fileWatcher) {
        this._fileWatcher.dispose();
        this._fileWatcher = undefined;
      }
    });

    return view;
  }

  public reload(panel: vscode.WebviewPanel) {
    // NOTE using timer here is to avoid rapid reloads and wait for a some
    // short time. 500msec here can be adjusted for better user experience.
    if (this._reloadTimer) {
      clearTimeout(this._reloadTimer);
    }
    this._reloadTimer = setTimeout(() => {
      this._circleViewer.forEach((view) => {
        if (view.owner(panel)) {
          view.loadContent();
        }
      });
    }, 500);
  }
}

/**
 * @brief Circle model viewer readonly Provider
 */
/* istanbul ignore next */
export class CircleViewerProvider implements
    vscode.CustomReadonlyEditorProvider<CircleViewerDocument> {
  public static readonly viewType = 'one.viewer.circle';

  private _context: vscode.ExtensionContext;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new CircleViewerProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(CircleViewerProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: true,
      })
      // Add command registration here
    ];
    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  // CustomReadonlyEditorProvider implements
  async openCustomDocument(
      uri: vscode.Uri, _openContext: {backupId?: string},
      _token: vscode.CancellationToken): Promise<CircleViewerDocument> {
    const document: CircleViewerDocument = await CircleViewerDocument.create(uri);
    // NOTE as a readonly viewer, there is not much to do

    // TODO handle dispose
    // TODO handle backup

    return document;
  }

  // CustomReadonlyEditorProvider implements
  async resolveCustomEditor(
      document: CircleViewerDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    document.openView(webviewPanel, this._context.extensionUri);
  }
}
