import * as vscode from 'vscode';

export function createStatusBarItem(context: vscode.ExtensionContext) {
    let myStatusBarItem: vscode.StatusBarItem;
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.text =`$(file-add) ONE configuration Settings`;
    myStatusBarItem.command = 'onevscode.configuration-settings';
    context.subscriptions.push(myStatusBarItem);
    myStatusBarItem.show();
}