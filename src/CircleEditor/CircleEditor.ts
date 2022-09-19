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
import { Disposable, disposeAll } from './dispose';
import { CircleEditorCtrl } from './CircleEditorCtrl';


interface CircleEdit {
	message: any; //edit할 사항 작성
}

class CircleEditor extends CircleEditorCtrl {
	private readonly _panel: vscode.WebviewPanel;

	// 변경사항배열 : 메시지 저장해놓고, save 할 때 한 번에 변경 실행 후 저장
	// message : 기능별로 짤라놓은 규칙이 있음
	// 속성, input 같이 수정 -> 배열 없이 하나의 메시지만 사용하려면 2개를 합친 메시지를 또 만들어야함
	// [ operator 속성 메시지, 인풋 메시지 ] 
	// save 시점은 같이 고민을 해보자
	private _edits: Array<CircleEdit> = [];

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

//event 발생할 때 이 클래스를 거치게 할 방법이 없나..?

}

interface CircleEditorDocumentDelegate { //?
	getFileData(): Promise<Uint8Array>;
}



export class CircleEditorDocument extends Disposable implements vscode.CustomDocument {
	private readonly _uri: vscode.Uri;
  private _circleEditor: CircleEditor[];

  static async create(uri: vscode.Uri):
      Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
    return new CircleEditorDocument(uri);
  }

  private constructor(uri: vscode.Uri) {
	super();
    this._uri = uri;
    this._circleEditor = [];
	console.log("CircleDocument 생성됨")
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

//makeEdit, save, saveAs, revert, backup(when implementing hot exit)

};


export class CircleEditorProvider implements
	vscode.CustomEditorProvider<CircleEditorDocument> {
	public static readonly viewType = 'one.editor.circle';

	private _context: vscode.ExtensionContext;

	private _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<CircleEditorDocument>>;
	onDidChangeCustomDocument: vscode.Event<vscode.CustomDocumentEditEvent<CircleEditorDocument>>;
	
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
		this.onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

	}

	

	//edit 발생 시 
	
	saveCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		
		throw new Error("Method not implemented.");
		//return document.save(cancellation); -> 이런 함수 document에 짜야 함
	}
	saveCustomDocumentAs(document: CircleEditorDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
		throw new Error('Method not implemented.');
	}
	revertCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
		
		throw new Error('Method not implemented.');
	}
	backupCustomDocument(document: CircleEditorDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
		throw new Error('Method not implemented.');
	}


	// CustomReadonlyEditorProvider implements
	async openCustomDocument(
		uri: vscode.Uri, openContext: {backupId?: string},
		_token: vscode.CancellationToken): Promise<CircleEditorDocument> {
	  const document: CircleEditorDocument = await CircleEditorDocument.create(uri);
	  // NOTE as a readonly viewer, there is not much to do
  
	  // TODO handle dispose
	  // TODO handle file change events
	  // TODO handle backup
	  console.log("open Custom Document 내부")
  
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


