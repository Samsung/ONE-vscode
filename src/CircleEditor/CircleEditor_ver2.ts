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
import * as Circle from './circle_schema_generated';
import * as flatbuffers from 'flatbuffers';
import { Balloon } from '../Utils/Balloon';

interface CircleEdit {
	message: any; //edit할 사항 작성
}

export class CircleEditorDocument extends Disposable implements vscode.CustomDocument {
    
    private readonly _uri: vscode.Uri;
    public ModelState: Circle.ModelT; //상태 관리용 모델
    //private _documentData: Uint8Array; //저장된 리소스 원본, 원래는 revert에 쓰였음

    //public _edits: CircleEdit[];

    public get uri() { return this._uri; }
    //public get documentData(): Uint8Array { return this._documentData; }


    static async create(uri: vscode.Uri, model: Circle.ModelT):
        Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
        return new CircleEditorDocument(uri,model);
    }

    private constructor (uri: vscode.Uri, model: Circle.ModelT) {
        super();
        this._uri = uri;
        this.ModelState = model;
    }

    private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
	

    //onDid sth from pawdraw editor
	public readonly onDidDispose = this._onDidDispose.event;

	private readonly _onDidChangeDocument = this._register(new vscode.EventEmitter<{
		readonly content?: Uint8Array;
		//readonly edits: readonly CircleEdit[];
	}>());
	
	public readonly onDidChangeContent = this._onDidChangeDocument.event;

	private readonly _onDidChange = this._register(new vscode.EventEmitter<{
		readonly label: string,
		undo(): void,
		redo(): void,
	}>());
	
	public readonly onDidChange = this._onDidChange.event;



    dispose(): void {
        throw new Error('Method not implemented.');
    }
	

    modelToByte(): Uint8Array{
        let fbb = new flatbuffers.Builder(1024);
        Circle.Model.finishModelBuffer(fbb, this.ModelState.pack(fbb));
        return fbb.asUint8Array();
    }

    async save(cancellation: vscode.CancellationToken): Promise<void> {
	
        this._onDidChangeDocument.fire({
			content: this.modelToByte(),
		});
	}
};


export class CircleEditorProvider implements
	vscode.CustomEditorProvider<CircleEditorDocument> {

    public static readonly viewType = 'one.editor.circle';
    
    //constructor
    constructor(
		private readonly _context: vscode.ExtensionContext
	) { }


    private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<CircleEditorDocument>>();
	public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
    
    private readonly webviews = new WebviewCollection();

    //register from CircleViewer
    //registerCommand excluded
    public static register(context: vscode.ExtensionContext): void {
		
        const provider = new CircleEditorProvider(context);

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

    //from CircleViewer create function + add listeners
    async openCustomDocument(
        uri: vscode.Uri, openContext: {backupId?: string},
        _token: vscode.CancellationToken): Promise<CircleEditorDocument> {


        let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
        let buf = new flatbuffers.ByteBuffer(bytes);
        let InitialModel = Circle.Model.getRootAsModel(buf).unpack();

        const document: CircleEditorDocument = await CircleEditorDocument.create(uri, InitialModel);
        
        const listeners: vscode.Disposable[] = [];

        listeners.push(document.onDidChange(e => {
            // Tell VS Code that the document has been edited by the use.
            this._onDidChangeCustomDocument.fire({
                document,
                ...e,
            });
        }));

        listeners.push(document.onDidChangeContent(e => {
            // Update all webviews when the document changes
  
            let fbb = new flatbuffers.Builder(1024);
            Circle.Model.finishModelBuffer(fbb, document.ModelState.pack(fbb));
            
            for (const webviewPanel of this.webviews.get(document.uri)) {
                // this.postMessage(webviewPanel, 'update', fbb.asUint8Array());
                this.postMessage(webviewPanel, 'test', fbb.asUint8Array());
            }
        }));

        document.onDidDispose(() => disposeAll(listeners));
        return document;
    }
    
    resolveCustomEditor(document: CircleEditorDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        this.webviews.add(document.uri, webviewPanel);

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		webviewPanel.webview.onDidReceiveMessage(e => this.onMessage(document, e));

		// Wait for the webview to be properly ready before we init
		webviewPanel.webview.onDidReceiveMessage(e => {
			if (e.command === 'ready') {
                this.postMessage(webviewPanel, 'init', document.ModelState);
			}else if(e.command === 'test'){
                this.postMessage(webviewPanel, 'test', document.ModelState);
            }
        });
    }
    

    saveCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
        document.save(cancellation);
        throw new Error('Method not implemented.');
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

    private postMessage(panel: vscode.WebviewPanel, type: string, body: any): void {

		panel.webview.postMessage({ type, body });
	}

	private onMessage(document: CircleEditorDocument, message: any) {
        //로직 수행 후 post message가 없는 요청들
		
        switch (message.command) {
            case MessageDefs.alert:
              Balloon.error(message.text);
              return;
            case MessageDefs.request:
              //return Document.StateModel
              return;
            case MessageDefs.pageloaded:
              return;
            case MessageDefs.loadmodel:
             //multi model mode 필요한지 보류
              return;
            case MessageDefs.finishload:
              return;
            case MessageDefs.selection:
              return;
      
              
            //added new logics
            case MessageDefs.editOperator:

            //document.editOperator() 등을 호출
            //edit 로직 마지막에 change~~.fire() 로 postMessage 대체
             
              return;
            case MessageDefs.editTensor:
              
              return;
            case MessageDefs.editBuffer:
             
              return;
            case 'test':
                {
                    console.log("msg arrived here")
                    
                    return;
                }
          }
		}
        



//getHtml
    private getHtmlForWebview(webview: vscode.Webview): string {
		
        //need to get html from GUI
        //this is temporary html for testing
        let html =
            `<!DOCTYPE html>
                    <html lang="en">

                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">F
                        <title>Document</title>
                    </head>

                    <body>
                        <button id="testBtn">클릭!</button><br>
                        <input type="text"></input>
                        <script>
                            const vscode = acquireVsCodeApi();
                            const testBtn = document.querySelector("#testBtn");
                            testBtn.addEventListener("click", e => {
                                e.preventDefault();
                                vscode.postMessage({
                                    type:"dd", command:"test"
                                });
                            });

                            window.addEventListener("message", (e)=>{
                                console.log(e);
                            })
                        </script>
                    </body>

            </html>`;


        return html;

    }
};




class WebviewCollection {

	private readonly _webviews = new Set<{
		readonly resource: string;
		readonly webviewPanel: vscode.WebviewPanel;
	}>();

	/**
	 * Get all known webviews for a given uri.
	 */
	public *get(uri: vscode.Uri): Iterable<vscode.WebviewPanel> {
		const key = uri.toString();

		console.log("webview Collection get 함수 내부 ")

		for (const entry of this._webviews) {
			if (entry.resource === key) {
				yield entry.webviewPanel;
			}
		}
	}

	/**
	 * Add a new webview to the collection.
	 */
	public add(uri: vscode.Uri, webviewPanel: vscode.WebviewPanel) {
		const entry = { resource: uri.toString(), webviewPanel };
		this._webviews.add(entry);

		webviewPanel.onDidDispose(() => {
			this._webviews.delete(entry);
		});
	}
}


export class MessageDefs {
    // message command
    public static readonly alert = 'alert';
    public static readonly request = 'request';
    public static readonly response = 'response';
    public static readonly pageloaded = 'pageloaded';
    public static readonly loadmodel = 'loadmodel';
    public static readonly finishload = 'finishload';
    public static readonly reload = 'reload';
    public static readonly selection = 'selection';
    public static readonly backendColor = 'backendColor';
    public static readonly error = 'error';
    public static readonly colorTheme = 'colorTheme';
    // loadmodel type
    public static readonly modelpath = 'modelpath';
    public static readonly uint8array = 'uint8array';
    // selection
    public static readonly names = 'names';
    public static readonly tensors = 'tensors';
    // partiton of backends
    public static readonly partition = 'partition';
  
    //added by yuyeon
    public static readonly editOperator = 'editOperator';
    public static readonly editTensor = 'editTensor';
    public static readonly editBuffer = 'editBuffer';
    public static readonly testMessage = 'dd';
  };