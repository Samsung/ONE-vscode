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

/**
 * Set vscode context that is used globally
 */
function setGlobalContext() {
  // These contexts are used to show "Compile" menu in File Explorer view
  //
  // 1. When a file is right-clicked (e.g., .pb, .tflite, etc)
  // 2. When a dir is right-clicked (e.g., Keras model or saved model)

  let compilableFileExts = ['.pb', '.tflite', '.onnx'];
  vscode.commands.executeCommand('setContext', 'onevscode.compilableExtList', compilableFileExts);

  // TODO Search directories containing Keras model or saved model
  //
  // Refer to https://github.com/Samsung/FOO-vscode/issues/331#issuecomment-1081295299 for
  // experience with directory path format.
  let dirList: string[] = [/* NYI */];
  vscode.commands.executeCommand('setContext', 'onevscode.compilableDirList', dirList);
}

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

class FooBackend implements BackendAPI {
  public name() { return "FooBackend"; }

  public install(): Tool[] {
    let msg = `From ${this.name()}: installation started`;
    showMsg(msg);

    msg = `From ${this.name()}: installation completed`;
    showMsg(msg);

    let tool1 = new Tool("a", "1.0");
    let tool2 = new Tool("b", "1.1");
    let tools: Tool[] = [ tool1, tool2 ];

    return tools;
  }

  public valueTest(): void {
    let msg = `From ${this.name()}: value test started`;
    showMsg(msg);

    msg = `From ${this.name()}: value test completed`;
    showMsg(msg);
  }
};

export function activate(context: vscode.ExtensionContext) {

  let onevscode = vscode.extensions.getExtension('Samsung.one-vscode');

  if (onevscode === undefined) {
    vscode.window.showErrorMessage("Cannot find Samsung.one-vscode Extension");
    return;
  }

  let onevscodeAPI = onevscode.exports;

  onevscodeAPI.registerBackend(new FooBackend());

  showMsg(`From FooBackend: Backend registered`);
}

export function deactivate() {
  // TODO do cleanup
}
