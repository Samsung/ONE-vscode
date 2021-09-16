import * as vscode from "vscode";

export function getInputPath(
  webview: vscode.Webview,
  selectedTool: string
): void {
  const optionsForInputDialog: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Open",
    filters: {
      allFiles: ["*"],
    },
  };

  vscode.window.showOpenDialog(optionsForInputDialog).then((fileUri) => {
    if (fileUri && fileUri[0]) {
      const pathToModelFile = fileUri[0].fsPath;
      webview.postMessage({
        command: "inputPath",
        selectedTool: selectedTool,
        filePath: pathToModelFile,
      });
    }
  });
}
