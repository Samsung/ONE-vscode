import * as vscode from "vscode";
import { Disposable, disposeAll } from "./dispose";
import * as Circle from './circle_schema_generated';
import * as flatbuffers from 'flatbuffers';

export class CircleEditorDocument extends Disposable implements vscode.CustomDocument{
  private readonly _uri: vscode.Uri;
  private _model: Circle.ModelT;

  public get uri(): vscode.Uri { return this._uri; }
  public get model(): Circle.ModelT { return this._model }
  public get modelData(): Uint8Array {
    let fbb = new flatbuffers.Builder(1024);
    Circle.Model.finishModelBuffer(fbb, this._model.pack(fbb));
    return fbb.asUint8Array();
  }

  static async create(uri: vscode.Uri, bytes: Uint8Array):
    Promise<CircleEditorDocument|PromiseLike<CircleEditorDocument>> {
    return new CircleEditorDocument(uri, bytes);
  }

  private constructor (uri: vscode.Uri, bytes: Uint8Array) {
    super();
    this._uri = uri;
    this._model = this.loadModel(bytes);
  }

  // dispose
  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDidDispose = this._onDidDispose.event;

  // tell to webview
  private readonly _onDidChangeContent = this._register(new vscode.EventEmitter<{
		readonly modelData: Uint8Array;
  }>());
  public readonly onDidChangeContent = this._onDidChangeContent.event;

  // tell to vscode
  private readonly _onDidChangeDocument = this._register(new vscode.EventEmitter<{
		readonly label: string,
		undo(): void,
		redo(): void,
	}>());
	public readonly onDidChangeDocument = this._onDidChangeDocument.event;

	dispose(): void {
		this._onDidDispose.fire();
		super.dispose();
  }
  

	makeEdit(message: any) {
		const oldModelData = this.modelData;
		
		//message type이 모두 있는지 확인
		switch (message.type) {
			case "operator":
				break;
			case "tensor":
				break;
			
			default:
				break;
		}

		const newModelData = this.modelData;

		this.notifyEdit(oldModelData, newModelData);
	}

	notifyEdit(oldModelData: Uint8Array, newModelData: Uint8Array) {
    this._onDidChangeContent.fire({
      modelData: newModelData,
    });

		this._onDidChangeDocument.fire({
			label: 'Model',
      undo: async () => {
				this._model = this.loadModel(oldModelData);
				this._onDidChangeContent.fire({
					modelData: oldModelData
				});
			},
      redo: async () => {
        this._model = this.loadModel(newModelData);
				this._onDidChangeContent.fire({
          modelData: newModelData
				});
			}
		});
  }
  
  private loadModel(bytes: Uint8Array): Circle.ModelT {
    let buf = new flatbuffers.ByteBuffer(bytes);
    return Circle.Model.getRootAsModel(buf).unpack();
  }

	/**
	 * Called by VS Code when the user saves the document.
	 */
	async save(cancellation: vscode.CancellationToken): Promise<void> {
		await this.saveAs(this.uri, cancellation);
	}

	/**
	 * Called by VS Code when the user saves the document to a new location.
	 */
	async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
		if (cancellation.isCancellationRequested) {
			return;
		}
		await vscode.workspace.fs.writeFile(targetResource, this.modelData);
	}

	/**
	 * Called by VS Code when the user calls `revert` on a document.
	 */
	async revert(_cancellation: vscode.CancellationToken): Promise<void> {
		const oldModelData = this.modelData;
		const newModelData = await vscode.workspace.fs.readFile(this.uri);
		this._model = this.loadModel(newModelData);

		this.notifyEdit(oldModelData, newModelData);
	}

	/**
	 * Called by VS Code to backup the edited document.
	 *
	 * These backups are used to implement hot exit.
	 */
	async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
		await this.saveAs(destination, cancellation);

		return {
			id: destination.toString(),
			delete: async () => {
				try {
					await vscode.workspace.fs.delete(destination);
				} catch {
					// noop
				}
			}
		};
	}
}
