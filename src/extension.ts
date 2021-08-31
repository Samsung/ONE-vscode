import * as vscode from 'vscode';
import {OneBuildPanel} from './OneBuildPanel';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('one-vscode.compile', () => {
    OneBuildPanel.createOrShow(context.extensionUri);
  }));
}

// this method is called when your extension is deactivated
export function deactivate() {}
