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

import {backendRegistrationApi} from './Backend/Backend';
import {CfgEditorPanel} from './CfgEditor/CfgEditorPanel';
import {CircleGraphPanel} from './CircleGraph/CircleGraph';
import {decoder} from './Circlereader/Circlereader';
import {Circletracer} from './Circletracer';
import {ConfigPanel} from './Config/ConfigPanel';
import {createStatusBarItem} from './Config/ConfigStatusBar';
import {CodelensProvider} from './Editor/CodelensProvider';
import {HoverProvider} from './Editor/HoverProvider';
import {runInferenceQuickInput} from './Execute/executeQuickInput';
import {Jsontracer} from './Jsontracer';
import {MondrianEditorProvider} from './Mondrian/MondrianEditor';
import {OneExplorer} from './OneExplorer/OneExplorer';
import {Project} from './Project';
import {ToolchainProvider} from './Toolchain/ToolchainProvider';
import {Logger} from './Utils/Logger';
import {showInstallQuickInput} from './View/InstallQuickInput';

export function activate(context: vscode.ExtensionContext) {
  Logger.outputWithTime('one-vscode activate OK');

  new OneExplorer(context);

  // ONE view
  const toolchainProvier = new ToolchainProvider();
  context.subscriptions.push(
      vscode.window.registerTreeDataProvider('ToolchainView', toolchainProvier));
  context.subscriptions.push(vscode.commands.registerCommand(
      'onevscode.refresh-toolchain', () => toolchainProvier.refresh()));
  context.subscriptions.push(vscode.commands.registerCommand('onevscode.install-toolchain', () => {
    showInstallQuickInput(context);
  }));
  context.subscriptions.push(
      vscode.commands.registerCommand('onevscode.uninstall-toolchain', () => {
        Logger.outputWithTime('uninstall-toolchain: NYI');
      }));

  // Target Device view
  let registerDevice = vscode.commands.registerCommand('onevscode.register-device', () => {
    Logger.outputWithTime('register-device: NYI');
  });
  context.subscriptions.push(registerDevice);

  let inferenceCommand = vscode.commands.registerCommand('onevscode.infer-model', () => {
    Logger.outputWithTime('one infer model...');
    runInferenceQuickInput(context);
  });
  context.subscriptions.push(inferenceCommand);

  context.subscriptions.push(CfgEditorPanel.register(context));

  let projectBuilder = new Project.Builder();

  projectBuilder.init();

  let disposableOneBuild = vscode.commands.registerCommand('onevscode.build', () => {
    Logger.outputWithTime('one build...');
    projectBuilder.build(context);
  });
  context.subscriptions.push(disposableOneBuild);

  let disposableOneImport = vscode.commands.registerCommand('onevscode.import', () => {
    Logger.outputWithTime('one import...');
    projectBuilder.import(context);
  });
  context.subscriptions.push(disposableOneImport);

  let disposableOneJsontracer = vscode.commands.registerCommand('onevscode.json-tracer', () => {
    Logger.outputWithTime('one json tracer...');
    Jsontracer.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposableOneJsontracer);

  let disposableOneConfigurationSettings =
      vscode.commands.registerCommand('onevscode.configuration-settings', () => {
        ConfigPanel.createOrShow(context);
        Logger.outputWithTime('one configuration settings...');
      });
  context.subscriptions.push(disposableOneConfigurationSettings);

  createStatusBarItem(context);

  let disposableToggleCodelens =
      vscode.commands.registerCommand('onevscode.toggle-codelens', () => {
        let codelensState =
            vscode.workspace.getConfiguration('one-vscode').get('enableCodelens', true);
        vscode.workspace.getConfiguration('one-vscode')
            .update('enableCodelens', !codelensState, true);
      });
  context.subscriptions.push(disposableToggleCodelens);

  let codelens = new CodelensProvider(context);
  let disposableCodelens = vscode.languages.registerCodeLensProvider('ini', codelens);
  context.subscriptions.push(disposableCodelens);

  let hover = new HoverProvider();
  let disposableHover = vscode.languages.registerHoverProvider('ini', hover);
  context.subscriptions.push(disposableHover);

  let disposableOneCircleTracer = vscode.commands.registerCommand('onevscode.circle-tracer', () => {
    Logger.outputWithTime('one circle tracer...');
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Open',
      /* eslint-disable */
      filters: {'Circle files': ['circle'], 'All files': ['*']}
      /* eslint-enable */
    };
    vscode.window.showOpenDialog(options).then(fileUri => {
      if (fileUri && fileUri[0]) {
        const circleToJson = decoder(fileUri[0].fsPath);
        Circletracer.createOrShow(context.extensionUri, circleToJson);
      }
    });
  });
  context.subscriptions.push(disposableOneCircleTracer);

  context.subscriptions.push(MondrianEditorProvider.register(context));

  let disposableGraphPenel = vscode.commands.registerCommand('onevscode.circle-graphview', () => {
    CircleGraphPanel.createOrShow(context.extensionUri, undefined);
  });
  context.subscriptions.push(disposableGraphPenel);

  // returning backend registration function that will be called by backend extensions
  return backendRegistrationApi();
}

export function deactivate() {
  // TODO do cleanup
}
