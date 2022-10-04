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
import {Relation} from '../MetadataManager/Relation';

import {RelationViewer} from './RelationViewer';

export class RelationViewerDocument implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _relationViewer: RelationViewer[];

  static async create(uri: vscode.Uri):
      Promise<RelationViewerDocument|PromiseLike<RelationViewerDocument>> {
    return new RelationViewerDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
    this._uri = uri;
    this._relationViewer = [];
  }

  public get uri() {
    return this._uri;
  }

  // CustomDocument implements
  dispose(): void {
    // NOTE panel is closed before document and this is just for safety
    this._relationViewer.forEach((view) => {
      while (this._relationViewer.length) {
        view.disposeMetadataView();
      }
    });
    this._relationViewer = [];
  }

  public openView(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, fileUri: vscode.Uri) {
    let view = new RelationViewer(panel, extensionUri);
    view.initWebview();
    view.loadContent();
    this._relationViewer.push(view);

    Relation.getRelationInfo(fileUri).then(payload => {
      // Send a message the relation data to the web view
      panel.webview.postMessage({type: 'create', payload: payload});
    });
    panel.onDidDispose(() => {
      // TODO make faster
      this._relationViewer.forEach((view, index) => {
        if (view.owner(panel)) {
          view.disposeMetadataView();
          this._relationViewer.splice(index, 1);
        }
      });
    });

    return view;
  }
}

export class RelationViewerProvider implements
    vscode.CustomReadonlyEditorProvider<RelationViewerDocument> {
  public static readonly viewType = 'one.viewer.relation';
  private _context: vscode.ExtensionContext;

  public static register(context: vscode.ExtensionContext): void {
    const provider = new RelationViewerProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(RelationViewerProvider.viewType, provider, {
        webviewOptions: {
          retainContextWhenHidden: true,
        }
      }),
      vscode.commands.registerCommand(
          'one.viewer.relation.showFromDefaultExplorer',
          async (uri) => {
            const fileUri = uri;

            vscode.commands.executeCommand(
                'vscode.openWith', fileUri, RelationViewerProvider.viewType);
          }),
      vscode.commands.registerCommand(
          'one.viewer.relation.showFromOneExplorer',
          async (uri) => {
            // If the method is executed in the ONE Explorer, change the uri instance.
            const fileUri = uri.uri;

            vscode.commands.executeCommand(
                'vscode.openWith', fileUri, RelationViewerProvider.viewType);
          })
      // Add command registration here
    ];

    // supported file extension to show relations context menu
    vscode.commands.executeCommand(
        'setContext', 'one.relation.supportedFiles',
        ['.tflite', '.pb', '.onnx', '.circle', '.log']);

    registrations.forEach(disposable => context.subscriptions.push(disposable));
  }

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  // CustomReadonlyEditorProvider implements
  async openCustomDocument(
      uri: vscode.Uri, _openContext: {backupId?: string},
      _token: vscode.CancellationToken): Promise<RelationViewerDocument> {
    const document: RelationViewerDocument = await RelationViewerDocument.create(uri);
    // NOTE as a readonly viewer, there is not much to do

    // TODO handle dispose
    // TODO handle file change events
    // TODO handle backup

    return document;
  }

  // CustomReadonlyEditorProvider implements
  async resolveCustomEditor(
      document: RelationViewerDocument, webviewPanel: vscode.WebviewPanel,
      _token: vscode.CancellationToken): Promise<void> {
    document.openView(webviewPanel, this._context.extensionUri, document.uri);
  }
}
