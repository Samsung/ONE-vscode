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
import * as fs from 'fs';
import * as vscode from 'vscode';
import { Disposable, disposeAll } from './dispose';
import { CircleGraphCtrl } from './CircleEditorCtrl';

import { getUri } from '../Utils/external/Uri';

import * as flatbuffers from 'flatbuffers';
import * as circle from './circle_schema_generated';


class CircleEditor extends CircleGraphCtrl {
	private readonly _panel: vscode.WebviewPanel;

	constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		super(extensionUri, panel.webview);
		this._panel = panel;
	}

	public loadContent() {
		this._panel.webview.html = this.getHtmlForWebview(this._panel.webview);
	}

	public owner(panel: vscode.WebviewPanel) {
		return this._panel === panel;
	}
}

interface CircleEditorDocumentDelegate { //?
	getFileData(): Promise<Uint8Array>;
}


interface CircleEdits {
	content: string; //edit할 사항 작성
}

class OperatorEdits implements CircleEdits {
	content = "operator";
	//edit 내용
}

// 이 객체를 받아와서 수정해야 함 
export class CircleEditorDocument extends Disposable implements vscode.CustomDocument {
	private readonly _uri: vscode.Uri;
  private _circleEditor: CircleEditor[]; 
  // circle document는 열려있는 circle 파일
  // Editor 배열 안에 editor?

  static async create(uri: vscode.Uri):
      Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
    return new CircleEditorDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
	super();
    this._uri = uri;
    this._circleEditor = [];
  }

  public get uri() {
    return this._uri;
  }

  // CustomDocument implements
  dispose(): void {
    // NOTE panel is closed before document and this is just for safety
    this._circleEditor.forEach((editor) => {
      editor.disposeGraphCtrl();
    });
    this._circleEditor = [];
  }

  public openEditor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    let editor = new CircleEditor(panel, extensionUri);
    editor.initGraphCtrl(this.uri.path, undefined);
    editor.loadContent();
    this._circleEditor.push(editor);
	console.log("여기 작동?",editor);
    panel.onDidDispose(() => {
      // TODO make faster
      this._circleEditor.forEach((editor, index) => {
        if (editor.owner(panel)) {
          editor.disposeGraphCtrl();
          this._circleEditor.splice(index, 1);
        }
      });
    });

    return editor;
  }

};

// 맨처음 생성
export class CircleEditorProvider implements
	vscode.CustomEditorProvider<CircleEditorDocument> {
	
	public static readonly viewType = 'one.editor.circle';

	private _context: vscode.ExtensionContext;

	public static register(context: vscode.ExtensionContext): void {
		const provider = new CircleEditorProvider(context);

		console.log("CircleEditorProvider의 register 함수")

		const registrations = [
			vscode.window.registerCustomEditorProvider(CircleEditorProvider.viewType, provider, {
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

		console.log("CircleEditorProvider 생성자 내부")
		this._context = context;
		
	}

	//edit 발생 시 
	private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<CircleEditorDocument>>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	saveCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		console.log("Ctrl+s")
		throw new Error("Method not implemented.");
		//return document.save(cancellation); -> 이런 함수 document에 짜야 함
	}
	saveCustomDocumentAs(document: CircleEditorDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
		console.log("save as")
		throw new Error('Method not implemented.');

	}
	revertCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		console.log("revert")
		throw new Error('Method not implemented.');
	}
	backupCustomDocument(document: CircleEditorDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
		console.log("backup")
		throw new Error('Method not implemented.');
	}

	// 우리 서클파일 연다.
	// CustomReadonlyEditorProvider implements
	async openCustomDocument(
		uri: vscode.Uri, openContext: {backupId?: string},
		_token: vscode.CancellationToken): Promise<CircleEditorDocument> {
	  const document: CircleEditorDocument = await CircleEditorDocument.create(uri);
	  // NOTE as a readonly viewer, there is not much to do
  
	  // TODO handle dispose
	  // TODO handle file change events
	  // TODO handle backup
	  console.log("open Custom Document 내부");
	  return document;
	}

	// CustomReadonlyEditorProvider implements 
	//from CircleViewer
	async resolveCustomEditor(
		document: CircleEditorDocument, webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken): Promise<void> {
	  document.openEditor(webviewPanel, this._context.extensionUri);
	}

};


