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

import { Logger } from "../Utils/Logger";
import { defaultExecutor } from "./DefaultExecutor";
import { ExecutorNode, ExecutorNodeBuilder } from "./ExecutorNodeBuilder";
import { TRIVExecutorNodeBuilder } from "./TRIVExecutorNode";

type ExecutorTreeData = ExecutorNode | undefined | void;

class ExecutorViewProvider
  implements vscode.TreeDataProvider<ExecutorNode>
{
  tag = this.constructor.name; // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ExecutorTreeData> =
    new vscode.EventEmitter<ExecutorTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ExecutorTreeData> =
    this._onDidChangeTreeData.event;

  builder: ExecutorNodeBuilder[] = [
    new TRIVExecutorNodeBuilder(),
  ];

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new ExecutorViewProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider("ExecutorView", provider),
      vscode.commands.registerCommand("one.executor.refresh", () =>
        provider.refresh()
      ),
      vscode.commands.registerCommand("one.executor.inferModel", (model) =>
        provider.infer(model)
      ),
      vscode.commands.registerCommand(
        "one.executor.profileModel",
        (model, options) => provider.profile(model, options)
      ),
      vscode.commands.registerCommand("one.executor.getModelInfo", (model) =>
        provider.getModelInfo(model)
      ),
      vscode.commands.registerCommand(
        "one.executor.setDefaultExecutor",
        (executor) => provider.setDefaultExecutor(executor)
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  public registerBuilder(builder: ExecutorNodeBuilder) {
    this.builder.push(builder);
  }

  getTreeItem(element: ExecutorNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ExecutorNode): vscode.ProviderResult<ExecutorNode[]> {
    let children: ExecutorNode[] = [];
    this.builder.forEach((builder) => children = children.concat(builder.buildNode(element)));
    return children;
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  public infer(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    if (defaultExecutor.get() === undefined) {
      Logger.debug("DefaultExecutor", `Default executor is not set.`);
      return;
    }
    return defaultExecutor.get()!.infer(model, options);
  }

  public profile(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    if (defaultExecutor.get() === undefined) {
      Logger.debug("DefaultExecutor", `Default executor is not set.`);
      return;
    }
    return defaultExecutor.get()!.profile(model, options);
  }

  public getModelInfo(model: string): string | undefined {
    if (defaultExecutor.get() === undefined) {
      Logger.debug("DefaultExecutor", `Default executor is not set.`);
      return;
    }
    return defaultExecutor.get()!.getModelInfo(model);
  }

  public setDefaultExecutor(tnode: ExecutorNode): boolean {
    defaultExecutor.set(tnode);
    this.refresh();
    return true;
  }
}

export { ExecutorViewProvider, ExecutorNode };
