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


interface CircleEdit {
	message: any; //edit할 사항 작성
}

export class CircleEditorDocument extends Disposable implements vscode.CustomDocument {
    
    private readonly _uri: vscode.Uri;
    public ModelState: Circle.ModelT;
    //public _edits: CircleEdit[];

    public get uri() { return this._uri; }

    static async create(uri: vscode.Uri):
        Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
        return new CircleEditorDocument(uri);
    }

    private constructor (uri: vscode.Uri) {
        super();
        this._uri = uri;

        let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
        let buf = new flatbuffers.ByteBuffer(bytes);
        this.ModelState = Circle.Model.getRootAsModel(buf).unpack();
    }

    private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
	

    //onDid sth from pawdraw editor
	public readonly onDidDispose = this._onDidDispose.event;

	private readonly _onDidChangeDocument = this._register(new vscode.EventEmitter<{
		readonly content?: Uint8Array;
		readonly edits: readonly CircleEdit[];
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
    const document: CircleEditorDocument = await CircleEditorDocument.create(uri);
    // NOTE as a readonly viewer, there is not much to do

    //resource read here 

     
    // TODO handle dispose
    // TODO handle file change events
    // TODO handle backup

    //listener from pawdraweditor
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
        for (const webviewPanel of this.webviews.get(document.uri)) {
            this.postMessage(webviewPanel, 'update', //model state (binary type)
            );
        }
    }));

    document.onDidDispose(() => disposeAll(listeners));
    return document;
    }
    
    resolveCustomEditor(document: CircleEditorDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        throw new Error('Method not implemented.');
    }
    

    saveCustomDocument(document: CircleEditorDocument, cancellation: vscode.CancellationToken): Thenable<void> {
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
                                    type:"dd", command:"dd"
                                });
                            });
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
