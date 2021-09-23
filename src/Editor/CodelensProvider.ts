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
import tools_attr from './json/tools_attr.json';

export class CodelensProvider implements vscode.CodeLensProvider {
  codeLenses: vscode.CodeLens[] = [];
  regex: RegExp;
  showInfo: Array<string>;
  now_tool_name: string;
  NotshowAttr: Array<string>;
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex = /(.+)/g;
    this.showInfo = [];
    this.now_tool_name = "";
    this.NotshowAttr = [];

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });

    vscode.commands.registerCommand('onevscode.codelensAction', (tool_name: any) => {
      let find_tool_idx = this.showInfo.findIndex((tool) => tool == tool_name);
      if (find_tool_idx == -1) {
        this.showInfo.push(tool_name);
      } else {
        this.showInfo.splice(find_tool_idx, 1);
      }
      this.NotshowAttr = this.NotshowAttr.filter((item) => !item.includes(tool_name));
      this._onDidChangeCodeLenses.fire();
    });

    vscode.commands.registerCommand('onevscode.codelensNotShowAttr', (tool_name: any, attr_name: any) => {
      let tool_attr = tool_name + "." + attr_name;
      let find_tool_attr_idx = this.NotshowAttr.findIndex((tool) => tool == tool_attr);

      if (find_tool_attr_idx == -1) {
        this.NotshowAttr.push(tool_attr);
      } else {
        this.NotshowAttr.splice(find_tool_attr_idx, 1);
      }

      this._onDidChangeCodeLenses.fire();
    })

    vscode.commands.registerCommand('onevscode.showCodeLens', () => {
      const codelens_state = vscode.workspace.getConfiguration('one-vscode').get('enableCodeLens', true);
      vscode.workspace.getConfiguration('one-vscode').update('enableCodeLens', !codelens_state, true);
    });
  }

  public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (vscode.workspace.getConfiguration('one-vscode').get('enableCodeLens', true)) {
      this.codeLenses = [];

      const regex = new RegExp(this.regex);
      const text = document.getText();
      let matches;
      while ((matches = regex.exec(text)) !== null) {
        const line = document.lineAt(document.positionAt(matches.index).line);
        const indexOf = line.text.indexOf(matches[0]);
        const position = new vscode.Position(line.lineNumber, indexOf);
        const range = document.getWordRangeAtPosition(position, this.regex);
        let line_str = line.text;

        if (range) {
          if (line_str.indexOf('=') === -1) {
            tools_attr.forEach((item) => {
              if (item.name == line_str) {
                this.codeLenses.push(new vscode.CodeLens(range));
                if (this.showInfo.includes(line_str)) {
                  this.now_tool_name = line_str;
                } else {
                  this.now_tool_name = "";
                }
              }
            });
          } else {
            if (this.now_tool_name != "") {
              let attr_name = line_str.split('=')[0];
              let tool_attr = this.now_tool_name + "." + attr_name;
              if (this.NotshowAttr.indexOf(tool_attr) == -1) {
                tools_attr.forEach((item) => {
                  if (item.name === this.now_tool_name) {
                    item.body.forEach((it) => {
                      if (it.attr_name === attr_name) {
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
    let line_str = vscode.window.activeTextEditor?.document.getText(codeLens.range);

    if (line_str?.indexOf('=') === -1) {
      tools_attr.forEach((item) => {
        if (item.name === line_str) {
          this.now_tool_name = line_str;
          codeLens.command = {
            title: item.description,
            command: 'onevscode.codelensAction',
            arguments: [this.now_tool_name],
          };
        }
      });
    }
    else {
      tools_attr.forEach((item) => {
        item.body.forEach((it) => {
          if (it.attr_name === line_str?.split('=')[0]) {
            codeLens.command = {
              title: it.attr_desc,
              command: 'onevscode.codelensNotShowAttr',
              arguments: [this.now_tool_name, it.attr_name]
            };
          }
        });

      });
    }

    return codeLens;
  }
}
