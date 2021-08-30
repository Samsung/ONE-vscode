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

import * as cp from 'child_process';
import * as vscode from 'vscode';

export class OneCfgBuilder {
  outputChannel: vscode.OutputChannel;
  firstFocus: boolean;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('ONE-VSCode');
    this.firstFocus = true;
  }

  private outputWithTime(msg: string) {
    let dateTime = new Date();
    this.outputChannel.appendLine('[' + dateTime + '] ' + msg);
  }

  private output(msg: string) {
    this.outputChannel.append(msg);
  }

  private outputLine(msg: string) {
    this.outputChannel.appendLine(msg);
  }

  private handleEvents(
      resolve: (value: string|PromiseLike<string>) => void,
      reject: (value: string|PromiseLike<string>) => void, cmd: cp.ChildProcessWithoutNullStreams) {
    // stdout
    cmd.stdout.on('data', (data: any) => {
      this.output(data.toString());
    });
    // stderr
    cmd.stderr.on('data', (data: any) => {
      this.output(data.toString());
    });

    cmd.on('exit', (code: any) => {
      let codestr = code.toString();
      console.log('child process exited with code ' + codestr);
      if (codestr === '0') {
        this.outputWithTime('Build Success.');
        this.outputLine('');
        resolve(codestr);
      } else {
        this.outputWithTime('Build Failed:' + codestr);
        this.outputLine('');
        let errorMsg = 'Failed with exit code: ' + codestr;
        reject(errorMsg);
      }
    });
  }

  private execOneCC(workspacePath: string, cfgFile: string) {
    return new Promise<string>((resolve, reject) => {
      console.log('OneCfgBuilder.execOneCC: ', workspacePath, cfgFile);

      if (this.firstFocus) {
        this.outputChannel.show(false);
        this.firstFocus = false;
      }
      this.outputWithTime('Running onecc...');

      let cmd = cp.spawn('onecc', ['-C', cfgFile], {cwd: workspacePath});
      this.handleEvents(resolve, reject, cmd);
    });
  }

  private error(msg: string) {
    vscode.window.showErrorMessage(msg);
    this.outputLine(msg);
  }

  public build(context: vscode.ExtensionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      console.log('OneCfgBuilder.build: NO workspaceFolders');
      this.error('Please build in workspace');
      return;
    }

    // TODO fix to use muiltiple workspace
    const workspaceRoot = workspaceFolders[0].uri.path;
    if (!workspaceRoot) {
      console.log('OneCfgBuilder.build: NO workspaceRoot');
      this.error('Please build in workspace');
      return;
    }

    // TODO support loading .cfg in memory to build
    let currentTabfilePath = vscode.window.activeTextEditor ?.document.uri.fsPath;
    console.log('OneCfgBuilder.build: currentTabfilePath', currentTabfilePath);
    if (currentTabfilePath === undefined) {
      console.log('OneCfgBuilder.build: no opened file');
      this.error('Please open .cfg file to build');
      return;
    }

    let filePathExt = currentTabfilePath.split('.').pop();
    if (filePathExt !== 'cfg') {
      console.log('OneCfgBuilder.build: not .cfg file');
      this.error('Please open .cfg file to build');
      return;
    }

    let cfgRelativePath = currentTabfilePath.substr(workspaceRoot.length + 1);
    // TODO invoke one command tools by section
    const output = this.execOneCC(workspaceRoot, currentTabfilePath);
    output
        .then(() => {
          vscode.window.showInformationMessage('Build ' + cfgRelativePath + ' done');
        })
        .catch(() => {
          vscode.window.showErrorMessage('Build ' + cfgRelativePath + ' failed');
        });
  }
}
