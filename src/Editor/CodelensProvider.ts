/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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
import toolsAttr from './json/tools_attr.json';

export class CodelensProvider implements vscode.CodeLensProvider {
  showTool: Array<string> = [];
  eventGenerator: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this.eventGenerator.event;

  constructor() {
    vscode.commands.registerCommand('onevscode.toggleAttrCodelens', (toolName: string) => {
      let findToolIdx = this.showTool.findIndex((tool) => tool === toolName);

      if (findToolIdx === -1) {
        this.showTool.push(toolName);
      } else {
        this.showTool.splice(findToolIdx, 1);
      }
      this.eventGenerator.fire();
    });
  }

  public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken):
      vscode.CodeLens[]|Thenable<vscode.CodeLens[]> {
    let codeLenses: vscode.CodeLens[] = [];

    if (vscode.workspace.getConfiguration('one-vscode').get('enableCodeLens', true)) {
      let regex = new RegExp(/(.+)/g);
      let activatedEditorText = document.getText();
      let matches;
      // TODO tune performance
      while ((matches = regex.exec(activatedEditorText)) !== null) {
        let line = document.lineAt(document.positionAt(matches.index).line);
        let indexOf = line.text.indexOf(matches[0]);
        let position = new vscode.Position(line.lineNumber, indexOf);
        let range = document.getWordRangeAtPosition(position, /(.+)/g) as vscode.Range;
        let lineStr = line.text;

        if (lineStr.indexOf('=') === -1) {
          toolsAttr.forEach((tool) => {
            if (tool.name === lineStr) {
              codeLenses.push(new vscode.CodeLens(range));
            }
            // TODO Add more
          });
        } else {
          // TODO Add more
        }
      }
    }

    return codeLenses;
  }

  public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
    let lineStr = vscode.window.activeTextEditor ?.document.getText(codeLens.range);

    if (lineStr?.indexOf('=') === -1) {
      toolsAttr.forEach((tool) => {
        if (tool.name === lineStr) {
          codeLens.command = {
            title: tool.description,
            command: 'onevscode.toggleAttrCodelens',
            arguments: [lineStr],
          };
        }
      });
    } else {
      // TODO Add more
    }

    return codeLens;
  }
}
