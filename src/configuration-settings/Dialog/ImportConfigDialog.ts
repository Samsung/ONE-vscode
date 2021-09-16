import * as vscode from 'vscode';

export function importConfig(newWebview: vscode.Webview): void{
    const optionsImport: vscode.OpenDialogOptions = {
        canSelectMany: false,
        openLabel: "Import",
        filters: {
          /* eslint-disable-next-line @typescript-eslint/naming-convention */
          "ONE .cfg Files": ["cfg"],
        },
      };
      vscode.window.showOpenDialog(optionsImport).then((fileUri) => {
        if (fileUri && fileUri[0]) {
          const pathToConfiglFile = fileUri[0].fsPath;

          const configParser = require("configparser");
          const config = new configParser();

          config.read(pathToConfiglFile);
          const sections = config.sections();
          const options = sections.reduce(
            (options: object, section: string) => ({
              ...options,
              [section]: config.items(section),
            }),
            {}
          );
        newWebview.postMessage({
            command: "importConfig",
            filePath: pathToConfiglFile,
            options: options,
          });
        }
      });
} 