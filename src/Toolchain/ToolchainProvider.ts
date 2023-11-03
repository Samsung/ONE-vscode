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
import { saveDirtyDocuments } from "../Utils/Helpers";
import { Logger } from "../Utils/Logger";
import { showInstallQuickInput } from "../View/InstallQuickInput";

import { DefaultToolchain } from "./DefaultToolchain";
import { JobInstall } from "./JobInstall";
import { JobUninstall } from "./JobUninstall";
import { gToolchainEnvMap, ToolchainEnv } from "./ToolchainEnv";

type ToolchainTreeData = BaseNode | undefined | void;

// BaseNode is a wrapper class for vscode.TreeItem
export class BaseNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}

// BackendNode expresses a backend for a group of toolchains
// However, BackendNode doesn't have dependency ToolchainNode directly
export class BackendNode extends BaseNode {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon("bracket");
    this.contextValue = "backend";
  }
}

// ToolchainNode expresses a toolchain from a backend
// Toolchain doesn't have dependency BackendNode directly but can know its backend name
export class ToolchainNode extends BaseNode {
  readonly backendName: string;

  constructor(
    public readonly label: string,
    public readonly backend: string,
    public readonly toolchain: Toolchain
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    if (DefaultToolchain.getInstance().isEqual(toolchain)) {
      this.iconPath = new vscode.ThemeIcon(
        "layers",
        new vscode.ThemeColor("debugIcon.startForeground")
      );
      this.contextValue = "toolchain-default";
    } else {
      this.iconPath = new vscode.ThemeIcon(
        "layers",
        new vscode.ThemeColor("disabledForeground")
      );
      this.contextValue = "toolchain";
    }
    this.description = toolchain.info.version?.str();
    const dependency = toolchain.info.depends
      ?.map((t) => `${t.name} ${t.version.str()}`)
      .join("\n")
      .toString();
    this.tooltip = dependency;
    this.backendName = backend;
  }
}

// NodeBuilder creates BackendNodes or ToolchainNodes
export class NodeBuilder {
  static createBackendNodes(): BackendNode[] {
    return Object.keys(gToolchainEnvMap).map((backendName) => {
      let bnode = new BackendNode(backendName);
      return bnode;
    });
  }

  static createToolchainNodes(bnode: BaseNode): ToolchainNode[] {
    if (bnode instanceof BackendNode === false) {
      return [];
    }

    const backendName = bnode.label;
    if (!Object.keys(gToolchainEnvMap).includes(backendName)) {
      return [];
    }
    const toolchains = gToolchainEnvMap[bnode.label].listInstalled();
    if (Object.keys(gToolchainEnvMap).length === 1 && toolchains.length === 1) {
      DefaultToolchain.getInstance().set(
        gToolchainEnvMap[backendName],
        toolchains[0]
      );
    }
    return toolchains
      .filter((t) => t.info.version)
      .map((t) => {
        let tnode = new ToolchainNode(t.info.name, backendName, t);
        return tnode;
      });
  }
}

// ToolchainProvider provides TreeData
export class ToolchainProvider implements vscode.TreeDataProvider<BaseNode> {
  tag = this.constructor.name; // logging tag

  private _onDidChangeTreeData: vscode.EventEmitter<ToolchainTreeData> =
    new vscode.EventEmitter<ToolchainTreeData>();
  readonly onDidChangeTreeData?: vscode.Event<ToolchainTreeData> =
    this._onDidChangeTreeData.event;

  /* istanbul ignore next */
  public static register(context: vscode.ExtensionContext) {
    const provider = new ToolchainProvider();

    const registrations = [
      vscode.window.registerTreeDataProvider("ToolchainView", provider),
      vscode.commands.registerCommand("one.toolchain.refresh", () =>
        provider.refresh()
      ),
      vscode.commands.registerCommand("one.toolchain.install", () =>
        provider.install()
      ),
      vscode.commands.registerCommand("one.toolchain.uninstall", (node) =>
        provider.uninstall(node)
      ),
      vscode.commands.registerCommand("one.toolchain.runCfg", (cfg) =>
        provider.run(cfg)
      ),
      vscode.commands.registerCommand("one.toolchain.inferModel", (model) =>
        provider.infer(model)
      ),
      vscode.commands.registerCommand(
        "one.toolchain.profileModel",
        (model, options) => provider.profile(model, options)
      ),
      vscode.commands.registerCommand("one.toolchain.getModelInfo", (model) =>
        provider.getModelInfo(model)
      ),
      vscode.commands.registerCommand(
        "one.toolchain.setDefaultToolchain",
        (toolchain) => provider.setDefaultToolchain(toolchain)
      ),
    ];

    registrations.forEach((disposable) =>
      context.subscriptions.push(disposable)
    );
  }

  public getTreeItem(element: BaseNode): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: BaseNode): Thenable<BaseNode[]> {
    if (element === undefined) {
      return Promise.resolve(NodeBuilder.createBackendNodes());
    } else {
      return Promise.resolve(NodeBuilder.createToolchainNodes(element));
    }
  }

  /* istanbul ignore next */
  private error(msg: string, ...args: string[]): Thenable<string | undefined> {
    Logger.error(this.tag, msg);
    return vscode.window.showErrorMessage(msg, ...args);
  }

  public refresh() {
    this._onDidChangeTreeData.fire();
  }

  /* istanbul ignore next */
  public _notifyInstalled(toolchainEnv: ToolchainEnv, toolchain: Toolchain) {
    const name = `${toolchain.info.name}-${toolchain.info.version?.str()}`;
    vscode.window.showInformationMessage(`Installed ${name} successfully.`);
    this.refresh();
    vscode.commands.executeCommand("one.device.refresh");
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
  public uninstall(tnode: ToolchainNode): boolean {
    const notifyUninstalled = () => {
      vscode.window.showInformationMessage(`Uninstallation was successful.`);
      if (DefaultToolchain.getInstance().isEqual(tnode.toolchain)) {
        Logger.info(this.tag, "Setting default toolchain was cancelled.");
        DefaultToolchain.getInstance().unset();
      }
      this.refresh();
      vscode.commands.executeCommand("one.device.refresh");
    };

    /* istanbul ignore next */
    const notifyError = () => {
      this.error("Uninstallation has failed.");
    };

    const backendName = tnode.backendName;
    if (!Object.keys(gToolchainEnvMap).includes(backendName)) {
      this.error("Invalid toolchain node.");
      return false;
    }

    gToolchainEnvMap[backendName].uninstall(tnode.toolchain).then(
      () => notifyUninstalled(),
      () => notifyError()
    );
    return true;
  }

  private checkAvailableToolchain(): [
    ToolchainEnv | undefined,
    Toolchain | undefined
  ] {
    /* istanbul ignore next */
    const notifyGuideline = () => {
      this.error(
        "Default toolchain is not set. Please install toolchain and set the default toolchain.",
        "OK",
        "See Instructions"
      ).then((value) => {
        if (value === "See Instructions") {
          /* istanbul ignore next */
          DefaultToolchain.getInstance().openDocument();
        }
      });
    };

    const activeToolchainEnv = DefaultToolchain.getInstance().getToolchainEnv();
    const activeToolchain = DefaultToolchain.getInstance().getToolchain();

    if (!activeToolchainEnv || !activeToolchain) {
      notifyGuideline();
      return [undefined, undefined];
    }

    return [activeToolchainEnv, activeToolchain];
  }

  public _run(cfg: string): boolean {
    const [activeToolchainEnv, activeToolchain] =
      this.checkAvailableToolchain();
    if (!activeToolchainEnv || !activeToolchain) {
      return false;
    }

    const activeToolchainName = activeToolchain.info.name;

    /* istanbul ignore next */
    const notifySuccess = () => {
      vscode.window.showInformationMessage(
        `${activeToolchainName} has run successfully.`
      );
    };

    /* istanbul ignore next */
    const notifyError = (err?: Error) => {
      let str = `Running ${activeToolchainName} has failed. `;
      if (err) {
        str += err.message;
      }
      vscode.window.showErrorMessage(str);
    };

    Logger.info(
      this.tag,
      `Run ${activeToolchainName}-${activeToolchain.info.version?.str()} toolchain with ${cfg} cfg.`
    );
    activeToolchainEnv
      .run(cfg, activeToolchain)
      .then(() => notifySuccess())
      .catch((err) => notifyError(err));
    return true;
  }

  public async run(cfg: string): Promise<boolean> {
    const proceed: boolean = await saveDirtyDocuments(cfg);

    if (proceed) {
      return this._run(cfg);
    }
    return false;
  }

  public infer(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    /* istanbul ignore next */
    const notifySuccess = () => {
      vscode.window.showInformationMessage("Inference success.");
    };
    /* istanbul ignore next */
    const notifyError = () => {
      this.error("Inference has failed.");
    };

    const [toolchainEnv, toolchain] = this.checkAvailableToolchain();
    if (toolchainEnv === undefined || toolchain === undefined) {
      return;
    }

    Logger.info(
      this.tag,
      `Infer ${model} file using ${
        toolchain.info.name
      }-${toolchain.info.version?.str()} toolchain.`
    );

    toolchainEnv.infer(toolchain, model, options).then(
      (result: string) => {
        notifySuccess();
        return result;
      },
      () => {
        notifyError();
      }
    );
    return;
  }

  public profile(
    model: string,
    options?: Map<string, string>
  ): string | undefined {
    /* istanbul ignore next */
    const notifySuccess = () => {
      vscode.window.showInformationMessage("Profile success.");
    };
    /* istanbul ignore next */
    const notifyError = () => {
      this.error("Profile has failed.");
    };

    const [toolchainEnv, toolchain] = this.checkAvailableToolchain();
    if (toolchainEnv === undefined || toolchain === undefined) {
      return;
    }

    Logger.info(
      this.tag,
      `Profile ${model} file using ${
        toolchain.info.name
      }-${toolchain.info.version?.str()} toolchain.`
    );

    toolchainEnv.profile(toolchain, model, options).then(
      () => {
        notifySuccess();
      },
      () => {
        notifyError();
      }
    );
    return;
  }

  public getModelInfo(model: string): string | undefined {
    /* istanbul ignore next */
    const notifySuccess = () => {
      vscode.window.showInformationMessage(
        "Getting model information success."
      );
    };
    /* istanbul ignore next */
    const notifyError = () => {
      this.error("Getting model information has failed.");
    };

    const [toolchainEnv, toolchain] = this.checkAvailableToolchain();
    if (toolchainEnv === undefined || toolchain === undefined) {
      return;
    }

    Logger.info(
      this.tag,
      `Run show with ${model} file using ${
        toolchain.info.name
      }-${toolchain.info.version?.str()} toolchain.`
    );

    toolchainEnv.getModelInfo(toolchain, model, "target-arch").then(
      (result: string) => {
        notifySuccess();
        return result;
      },
      () => {
        notifyError();
      }
    );
    return;
  }

  public setDefaultToolchain(tnode: ToolchainNode): boolean {
    const backendName = tnode.backendName;
    if (!Object.keys(gToolchainEnvMap).includes(backendName)) {
      this.error("Invalid toolchain node.");
      return false;
    }

    DefaultToolchain.getInstance().set(
      gToolchainEnvMap[tnode.backend],
      tnode.toolchain
    );
    return true;
  }
}
