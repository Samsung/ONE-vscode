import * as vscode from "vscode";
import { CircleEditorDocument } from "./CircleEditorDocument";
import { disposeAll } from "./dispose";
import * as fs from "fs";
import { getNonce } from "../Utils/external/Nonce";
import { CircleException } from "./CircleEditorException";
import {getUri} from '../Utils/external/Uri';

/**
 * Message commands for communicating with webviews
 */
export enum MessageDefs {
  // message command
  alert = "alert",
  request = "request",
  response = "response",
  pageloaded = "pageloaded",
  loadmodel = "loadmodel",
  finishload = "finishload",
  reload = "reload",
  selection = "selection",
  backendColor = "backendColor",
  error = "error",
  colorTheme = "colorTheme",
  // loadmodel type
  modelpath = "modelpath",
  uint8array = "uint8array",
  // selection
  names = "names",
  tensors = "tensors",
  // partiton of backends
  partition = "partition",
  // commands for custom editor features
  edit = "edit",
  customType = "customType",
  loadJson = "loadJson",
  updateJson = "updateJson",
  requestEncodingData = "requestEncodingData"
}

/**
 * Custom Editor Provider necessary for vscode extension API
 */
export class CircleEditorProvider implements vscode.CustomEditorProvider<CircleEditorDocument>{
  public static readonly viewType = "one.editor.circle";
  private readonly folderMediaCircleEditor = "media/CircleEditor";

  constructor(private readonly _context: vscode.ExtensionContext) {}

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<CircleEditorDocument>
  >();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  private readonly webviews = new WebviewCollection();

  public static register(context: vscode.ExtensionContext): void {
    const provider = new CircleEditorProvider(context);

    const registrations = [
      vscode.window.registerCustomEditorProvider(
        CircleEditorProvider.viewType,
        provider,
        {
          webviewOptions: {
            retainContextWhenHidden: true,
          },
          supportsMultipleEditorsPerDocument: true,
        }
      ),
      // TODO: Add command registrations
    ];
    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: { backupId?: string },
    _token: vscode.CancellationToken
  ): Promise<CircleEditorDocument> {
    const document: CircleEditorDocument = await CircleEditorDocument.create(uri);

    const listeners: vscode.Disposable[] = [];

    listeners.push(
      document.onDidChangeDocument((e) => {
        // Tell VS Code that the document has been edited by the use.
        this._onDidChangeCustomDocument.fire({
          document,
          ...e,
        });
      })
    );

    listeners.push(
      document.onDidChangeContent((e) => {
        // Update all webviews when the document changes
        for (const webviewPanel of this.webviews.get(document.uri)) {
          this.postMessage(webviewPanel, e);
        }
      })
    );

    document.onDidDispose(() => disposeAll(listeners));
    return document;
  }

  resolveCustomEditor(
    document: CircleEditorDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this.webviews.add(document.uri, webviewPanel);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    webviewPanel.webview.onDidReceiveMessage((e) =>
      this.onMessage(document, e)
    );
  }

  saveCustomDocument(
    document: CircleEditorDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.save(cancellation);
  }
  saveCustomDocumentAs(
    document: CircleEditorDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }
  revertCustomDocument(
    document: CircleEditorDocument,
    cancellation: vscode.CancellationToken
  ): Thenable<void> {
    return document.revert(cancellation);
  }
  backupCustomDocument(
    document: CircleEditorDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  private postMessage(
    panel: vscode.WebviewPanel,
    body: any
  ): void {
    panel.webview.postMessage( body );
  }

  private onMessage(document: CircleEditorDocument, message: any) {
    switch (message.command) {
      case MessageDefs.alert:
        CircleException.exceptionAlert(message.text); //error msg
        return;
      case MessageDefs.request:
        this.handleRequest(document, message.url, message.encoding);
        return;
      case MessageDefs.pageloaded:
        return; //html load
      case MessageDefs.loadmodel:
        document.sendModel(message.offset);
        return;
      case MessageDefs.finishload: //load model finish
        return;
      case MessageDefs.selection: //return
        return;
      case MessageDefs.edit:
        document.makeEdit(message);
        return;
      case MessageDefs.customType:
        document.sendCustomType(message);
        return;
      case MessageDefs.loadJson:
        document.loadJson();
        return;
      case MessageDefs.updateJson:
        document.editJsonModel(message);
        return;
      case MessageDefs.requestEncodingData:
        document.sendEncodingData(message);
    }
  }

	protected handleRequest(document: CircleEditorDocument, url: string, encoding: string) {
    // TODO check scheme
    const reqUrl = new URL(url);
    let filePath = vscode.Uri.joinPath(
        this._context.extensionUri, this.folderMediaCircleEditor, reqUrl.pathname);
    if (!fs.existsSync(filePath.fsPath)) {
      filePath = vscode.Uri.joinPath(
        this._context.extensionUri, `${this.folderMediaCircleEditor}/external`, reqUrl.pathname);
    }

    try {
      const fileData = fs.readFileSync(filePath.fsPath, { encoding: encoding, flag: 'r' });
      document._onDidChangeContent.fire({ command: "response", response: fileData });
    } catch (err) {
      document._onDidChangeContent.fire({command: "error", response: ''});
    }
  }
  
  private getHtmlForWebview(webview: vscode.Webview): string {
    const htmlUrl = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._context.extensionUri,
        this.folderMediaCircleEditor,
        "index.html"
      )
    );
    const codiconUri = getUri(webview, this._context.extensionUri, ['node_modules','@vscode','codicons','dist','codicon.css']);
    let html = fs.readFileSync(htmlUrl.fsPath, { encoding: "utf-8" });
        
    const nonce = getNonce();
    html = html.replace(/%nonce%/gi, nonce);
    html = html.replace('%webview.cspSource%', webview.cspSource);
    html = html.replace(/\${codiconUri}/g, `${codiconUri}`);
    // necessary files from netron to work
    html = this.updateUri(html, webview, '%view-grapher.css%', 'view-grapher.css');
    html = this.updateUri(html, webview, '%view-sidebar.css%', 'view-sidebar.css');
    html = this.updateUri(html, webview, '%view-json-editor.css%', 'view-json-editor.css');
    html = this.updateUri(html, webview, '%type.js%', 'type.js');
    html = this.updateUri(html, webview, '%view-sidebar.js%', 'view-sidebar.js');
    html = this.updateUri(html, webview, '%view-grapher.js%', 'view-grapher.js');
    html = this.updateUri(html, webview, '%view-json-editor.js%', 'view-json-editor.js');
    html = this.updateExternalUri(html, webview, '%dagre.js%', 'dagre.js');
    html = this.updateExternalUri(html, webview, '%base.js%', 'base.js');
    html = this.updateExternalUri(html, webview, '%text.js%', 'text.js');
    html = this.updateExternalUri(html, webview, '%json.js%', 'json.js');
    html = this.updateExternalUri(html, webview, '%xml.js%', 'xml.js');
    html = this.updateExternalUri(html, webview, '%python.js%', 'python.js');
    html = this.updateExternalUri(html, webview, '%protobuf.js%', 'protobuf.js');
    html = this.updateExternalUri(html, webview, '%flatbuffers.js%', 'flatbuffers.js');
    html = this.updateExternalUri(html, webview, '%flexbuffers.js%', 'flexbuffers.js');
    html = this.updateExternalUri(html, webview, '%zip.js%', 'zip.js');
    html = this.updateExternalUri(html, webview, '%gzip.js%', 'gzip.js');
    html = this.updateExternalUri(html, webview, '%tar.js%', 'tar.js');
    // for circle format
    html = this.updateExternalUri(html, webview, '%circle.js%', 'circle.js');
    html = this.updateExternalUri(html, webview, '%circle-schema.js%', 'circle-schema.js');
    // modified for one-vscode
    html = this.updateUri(html, webview, '%index.js%', 'index.js');
    html = this.updateUri(html, webview, '%view.js%', 'view.js');
    // viewMode: this is replaced as a comment as we do not provide selection mode
    // html = html.replace('%viewMode%', this._viewMode);

    return html;
  }

  private getMediaPath(file: string) {
    return vscode.Uri.joinPath(this._context.extensionUri, this.folderMediaCircleEditor, file);
  }

  private updateExternalUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, 'external/' + replace);
    return html.replace(search, `${replaceUri}`);
  }

  private updateUri(html: string, webview: vscode.Webview, search: string, replace: string) {
    const replaceUri = this.getUriFromPath(webview, replace);
    return html.replace(search, `${replaceUri}`);
  }

  private getUriFromPath(webview: vscode.Webview, file: string) {
    const mediaPath = this.getMediaPath(file);
    const uriView = webview.asWebviewUri(mediaPath);
    return uriView;
  }
}

/**
 * class for retaining webviews opened
 */
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
