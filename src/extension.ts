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

import {backendRegistrationApi} from './Backend/API';
import {CfgEditorPanel} from './CfgEditor/CfgEditorPanel';
import {CircleViewerProvider} from './CircleGraph/CircleViewer';
import {DeviceViewProvider} from './Execute/DeviceViewProvider';
import {Jsontracer} from './Jsontracer';
import {MondrianEditorProvider} from './Mondrian/MondrianEditor';
import {initOneExplorer} from './OneExplorer/OneExplorer';
import {PartEditorProvider} from './PartEditor/PartEditor';
import {PartGraphSelPanel} from './PartEditor/PartGraphSelector';
import {ToolchainProvider} from './Toolchain/ToolchainProvider';
import {Logger} from './Utils/Logger';

/* istanbul ignore next */
export function activate(context: vscode.ExtensionContext) {
  const tag = 'activate';

  Logger.info(tag, 'one-vscode activate OK');

  initOneExplorer(context);

  // ONE view
  const toolchainProvider = new ToolchainProvider();
  context.subscriptions.push(
      vscode.window.registerTreeDataProvider('ToolchainView', toolchainProvider));
  context.subscriptions.push(
      vscode.commands.registerCommand('one.toolchain.refresh', () => toolchainProvider.refresh()));
  context.subscriptions.push(
      vscode.commands.registerCommand('one.toolchain.install', () => toolchainProvider.install()));
  context.subscriptions.push(vscode.commands.registerCommand(
      'one.toolchain.uninstall', (node) => toolchainProvider.uninstall(node)));
  context.subscriptions.push(
      vscode.commands.registerCommand('one.toolchain.runCfg', (cfg) => toolchainProvider.run(cfg)));
  context.subscriptions.push(vscode.commands.registerCommand(
      'one.toolchain.setDefaultToolchain',
      (toolchain) => toolchainProvider.setDefaultToolchain(toolchain)));

  // Target Device view
  const deviceViewProvider = new DeviceViewProvider();
  context.subscriptions.push(
      vscode.window.registerTreeDataProvider('TargetDeviceView', deviceViewProvider));
  let registerDevice = vscode.commands.registerCommand('one.device.refresh', () => {
    deviceViewProvider.refresh();
  });
  context.subscriptions.push(registerDevice);

  CfgEditorPanel.register(context);

  let disposableOneJsontracer = vscode.commands.registerCommand('one.viewer.jsonTracer', () => {
    Logger.info(tag, 'one json tracer...');
    Jsontracer.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposableOneJsontracer);

  context.subscriptions.push(MondrianEditorProvider.register(context));

  PartEditorProvider.register(context);
  context.subscriptions.push(PartGraphSelPanel.register(context));

  context.subscriptions.push(CircleViewerProvider.register(context));

  // returning backend registration function that will be called by backend extensions
  return backendRegistrationApi();
}

/* istanbul ignore next */
export function deactivate() {
  // TODO do cleanup
}
