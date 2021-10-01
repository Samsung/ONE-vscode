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
  codeLenses: vscode.CodeLens[] = [];
  regex: RegExp;
  showInfo: Array<string>;
  nowToolName: string;
  notShowAttr: Array<string>;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /(.+)/g;
    this.showInfo = [];
    this.nowToolName = "";
    this.notShowAttr = [];

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });

    vscode.commands.registerCommand('onevscode.codelensAction', (toolName: any) => {
      let findToolIdx = this.showInfo.findIndex((tool) => tool === toolName);
      if (findToolIdx === -1) {
        this.showInfo.push(toolName);
      } else {
        this.showInfo.splice(findToolIdx, 1);
      }
      this.notShowAttr = this.notShowAttr.filter((item) => !item.includes(toolName));
      this._onDidChangeCodeLenses.fire();
    });

    vscode.commands.registerCommand('onevscode.codelensNotShowAttr', (toolName: any, attrName: any) => {
      let toolAttr = toolName + "." + attrName;
      let findToolAttrIdx = this.notShowAttr.findIndex((tool) => tool === toolAttr);

      if (findToolAttrIdx === -1) {
        this.notShowAttr.push(toolAttr);
      } else {
        this.notShowAttr.splice(findToolAttrIdx, 1);
      }

      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (vscode.workspace.getConfiguration('one-vscode').get('enableCodeLens', true)) {
      this.codeLenses = [];

      let regex = new RegExp(this.regex);
      let text = document.getText();
      let matches;
      while ((matches = regex.exec(text)) !== null) {
        let line = document.lineAt(document.positionAt(matches.index).line);
        let indexOf = line.text.indexOf(matches[0]);
        let position = new vscode.Position(line.lineNumber, indexOf);
        let range = document.getWordRangeAtPosition(position, this.regex) as vscode.Range;
        let lineStr = line.text;

        if (range) {
          if (lineStr.indexOf('=') === -1) {
            toolsAttr.forEach((item) => {
              if (item.name === lineStr) {
                this.codeLenses.push(new vscode.CodeLens(range));
                if (this.showInfo.includes(lineStr)) {
                  this.nowToolName = lineStr;
                } else {
                  this.nowToolName = "";
                }
              }
            });
          } else {
            if (this.nowToolName !== "") {
              let attrName = lineStr.split('=')[0];
              let toolAttr = this.nowToolName + "." + attrName;
              if (this.notShowAttr.indexOf(toolAttr) === -1) {
                toolsAttr.forEach((item) => {
                  if (item.name === this.nowToolName) {
                    item.body.forEach((it) => {
                      if (it.attr_name === attrName) {
                        this.codeLenses.push(new vscode.CodeLens(range));
                      }
                    });
                  }
                });
              }
            }
          }
        }
      }
      return this.codeLenses;
    }
    return [];
  }

  public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
    let lineStr = vscode.window.activeTextEditor?.document.getText(codeLens.range);

    if (lineStr?.indexOf('=') === -1) {
      toolsAttr.forEach((item) => {
        if (item.name === lineStr) {
          this.nowToolName = lineStr;
          codeLens.command = {
            title: item.description,
            command: 'onevscode.codelensAction',
            arguments: [this.nowToolName],
          };
        }
      });
    }
    else {
      toolsAttr.forEach((item) => {
        item.body.forEach((it) => {
          if (it.attr_name === lineStr?.split('=')[0]) {
            codeLens.command = {
              title: it.attr_desc,
              command: 'onevscode.codelensNotShowAttr',
              arguments: [this.nowToolName, it.attr_name]
            };
          }
        });
      });
    }
    return codeLens;
  }
}
