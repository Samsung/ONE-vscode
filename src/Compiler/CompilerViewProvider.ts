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

import { saveDirtyDocuments } from "../Utils/Helpers";
import { Logger } from "../Utils/Logger";
import { defaultCompiler } from "./DefaultCompiler";
import { CompilerNode, CompilerNodeBuilder } from "./CompilerNodeBuilder";
import { BackendCompilerNodeBuilder } from "./BackendCompilerNode";

type ToolchainTreeData = CompilerNode | undefined | void;

class CompilerViewProvider implements vscode.TreeDataProvider<CompilerNode> {
  tag = this.constructor.name; // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ToolchainTreeData> =
    new vscode.EventEmitter<ToolchainTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ToolchainTreeData> =
    this._onDidChangeTreeData.event;

  builder: CompilerNodeBuilder[] = [new BackendCompilerNodeBuilder()];

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new CompilerViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider("ToolchainView", provider),
      vscode.commands.registerCommand("one.compiler.refresh", () =>
        provider.refresh()
      ),
      vscode.commands.registerCommand("one.compiler.install", () =>
        vscode.commands.executeCommand("one.toolchain.install")
      ),
      vscode.commands.registerCommand("one.compiler.uninstall", (node) =>
        vscode.commands.executeCommand("one.toolchain.uninstall", node)
      ),
      vscode.commands.registerCommand("one.compiler.runCfg", (cfg) =>
        provider.run(cfg)
      ),
      vscode.commands.registerCommand(
        "one.compiler.setDefaultCompiler",
        (compiler) => provider.setDefaultCompiler(compiler)
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  public getTreeItem(element: CompilerNode): vscode.TreeItem {
    return element;
  }

  public getChildren(
    element?: CompilerNode
  ): vscode.ProviderResult<CompilerNode[]> {
    let children: CompilerNode[] = [];
    this.builder.forEach(
      (builder) => (children = children.concat(builder.buildNode(element)))
    );
    return children;
  }

  /* istanbul ignore next */
  private error(msg: string, ...args: string[]): Thenable<string | undefined> {
    Logger.error(this.tag, msg);
    return vscode.window.showErrorMessage(msg, ...args);
  }

  public refresh() {
    this._onDidChangeTreeData.fire();
  }

  public async run(cfg: string): Promise<string | undefined> {
    const proceed: boolean = await saveDirtyDocuments(cfg);

    if (defaultCompiler.get() === undefined) {
      Logger.debug("DefaultCompiler", `Default compiler is not set.`);
      return;
    }

    if (proceed) {
      return defaultCompiler.get()!.compile(cfg);
    }
  }

  public setDefaultCompiler(tnode: CompilerNode): boolean {
    defaultCompiler.set(tnode);
    this.refresh();
    return true;
  }
}

export { CompilerViewProvider };
