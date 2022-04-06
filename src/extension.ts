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

function showMsg(msg: string) {
  console.log(msg);
  vscode.window.showInformationMessage(msg);
}

class Tool
{
  public name: string;
  public version: string;
  constructor (n:string, v: string) {
    this.name = n;
    this.version = v;
  }
}

interface BackendAPI
{
  name(): string;
  install(): Tool[];
  valueTest(): void;
};

let backends: BackendAPI[] = [];

export function activate(context: vscode.ExtensionContext) {

  let api =
  {
    registerBackend(backendAPI: BackendAPI) {
      showMsg(`registerBackend@ONE-vscode: ${backendAPI.name()} will be registered`);
      backends.push(backendAPI);
      showMsg(`registerBackend@ONE-vscode: ${backendAPI.name()} was registered`);
    }
  };

  let disposableInstall = vscode.commands.registerCommand('onevscode.install', () => {
    let msg: string = "No backend was registered.";
    if (backends.length === 0) {
      msg = "No backend was registered.";
      showMsg(msg);
      return;
    }
    else {
      showMsg(`installing ${backends[0].name()}...`);

      let tools = backends[0].install();

      showMsg(`${tools.length} tools were installed.`);

      let toolMsg: string = '';
      tools.forEach(tool=>{ toolMsg = toolMsg + ` / ${tool.name} : ${tool.version}`; });
      showMsg(toolMsg);
    }

  });
  context.subscriptions.push(disposableInstall);

  // DON'T FORGET TO RETURN THIS
  return api;
}

export function deactivate() {
  // TODO do cleanup
}
