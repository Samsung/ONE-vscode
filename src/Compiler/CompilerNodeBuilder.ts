/*
 * Copyright (c) 2023 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as vscode from "vscode";
import { defaultCompiler } from "./DefaultCompiler";

class CompilerNode extends vscode.TreeItem {
  readonly deviceName: string;  // device name

  constructor(public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly dname: string = '') {
    super(label, collapsibleState);
    this.deviceName = dname;
    this.contextValue = "compiler";
    this.iconPath = new vscode.ThemeIcon("debug-start");
    if (defaultCompiler.isEqual(this)) {
      this.iconPath = new vscode.ThemeIcon("debug-continue", new vscode.ThemeColor("debugIcon.startForeground"));
      this.contextValue += ".default";
    }
  }

  public compile(
    _cfg: string,
    _options?: Map<string, string>
  ): string | undefined {
    throw new Error("Not implemented");
  }
}

interface CompilerNodeBuilder {
  buildNode(element?: CompilerNode): CompilerNode[];
}

export { CompilerNode, CompilerNodeBuilder };
