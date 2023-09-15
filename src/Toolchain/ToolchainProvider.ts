/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

import { Toolchain } from "../Backend/Toolchain";
import { Job } from "../Job/Job";
import { Logger } from "../Utils/Logger";
import { showInstallQuickInput } from "../View/InstallQuickInput";

import { JobInstall } from "./JobInstall";
import { JobUninstall } from "./JobUninstall";
import { ToolchainEnv } from "./ToolchainEnv";
import { CompilerNode } from "../Compiler/CompilerNodeBuilder";
import { ExecutorNode } from "../Executor/ExecutorNodeBuilder";

export class ToolchainProvider {
  tag = this.constructor.name; // logging tag

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new ToolchainProvider();

    const registrations = [
      vscode.commands.registerCommand("one.toolchain.install", () =>
        provider.install()
      ),
      vscode.commands.registerCommand("one.toolchain.uninstall", (node) =>
        provider.uninstall(node)
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  /* istanbul ignore next */
  private error(msg: string, ...args: string[]): Thenable<string | undefined> {
    Logger.error(this.tag, msg);
    return vscode.window.showErrorMessage(msg, ...args);
  }

  /* istanbul ignore next */
  public _notifyInstalled(toolchainEnv: ToolchainEnv, toolchain: Toolchain) {
    const name = `${toolchain.info.name}-${toolchain.info.version?.str()}`;
    vscode.window.showInformationMessage(`Installed ${name} successfully.`);
    vscode.commands.executeCommand("one.compiler.refresh");
    vscode.commands.executeCommand("one.executor.refresh");
  }

  /* istanbul ignore next */
  public _notifyInstallationError() {
    this.error("Installation has failed");
  }

  /* istanbul ignore next */
  public _notifyInstallationCancelled() {
    Logger.info(this.tag, "Installation was cancelled");
  }

  // Use this function only for test
  public _install(
    toolchainEnv: ToolchainEnv,
    toolchain: Toolchain
  ): boolean | undefined {
    // NOTE(jyoung)
    // The `DebianToolchain` of the backend and the `DebianToolchain` of this project
    // are not recognized as the same object by `instanceof` function.
    const installed = toolchainEnv
      .listInstalled()
      .filter((value) => value.constructor.name === "DebianToolchain");

    if (installed.length > 1) {
      this.error("Installed debian toolchain must be unique.");
      return false;
    }

    if (installed.length !== 1) {
      toolchainEnv.install(toolchain).then(
        () => this._notifyInstalled(toolchainEnv, toolchain),
        () => this._notifyInstallationError()
      );
      return;
    }

    /* istanbul ignore next */
    vscode.window
      .showInformationMessage(
        "Do you want to remove the existing and re-install? Backend toolchain can be installed only once.",
        "Yes",
        "No"
      )
      .then((answer) => {
        if (answer === "Yes") {
          const jobs: Array<Job> = [];
          jobs.push(new JobUninstall(installed[0].tool.uninstall()));
          jobs.push(new JobInstall(toolchain.tool.install()));
          toolchainEnv.request(jobs).then(
            () => this._notifyInstalled(toolchainEnv, toolchain),
            () => this._notifyInstallationError()
          );
        } else {
          this._notifyInstallationCancelled();
        }
      });
  }

  /* istanbul ignore next */
  public install() {
    showInstallQuickInput().then(
      ([toolchainEnv, toolchain]) => {
        this._install(toolchainEnv, toolchain);
      },
      () => this._notifyInstallationCancelled()
    );
  }

  /* istanbul ignore next */
  public uninstall(node: CompilerNode | ExecutorNode): boolean {
    // const notifyUninstalled = () => {
    //   vscode.window.showInformationMessage(`Uninstallation was successful.`);
    //   // TODO unset defaultCompiler and defaultExecutor
    //   // if (node instanceof CompilerNode && defaultCompiler.isEqual(node)) {
    //   //   Logger.info(this.tag, "Setting default toolchain was cancelled.");
    //   //   defaultCompiler.unset();
    //   //   // TODO unset defaultExecutor
    //   // }
    //   vscode.commands.executeCommand("one.compiler.refresh");
    //   vscode.commands.executeCommand("one.executor.refresh");
    // };

    // /* istanbul ignore next */
    // const notifyError = () => {
    //   this.error("Uninstallation has failed.");
    // };

    // const backendName = node.deviceName;
    // if (!Object.keys(gToolchainEnvMap).includes(backendName)) {
    //   this.error("Invalid toolchain node.");
    //   return false;
    // }

    // gToolchainEnvMap[backendName].uninstall(node.toolchain).then(
    //   () => notifyUninstalled(),
    //   () => notifyError()
    // );
    return true;
  }
}
