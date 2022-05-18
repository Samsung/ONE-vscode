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
import {CompilePanel} from './Compile/CompilePanel';
import {ConfigPanel} from './Config/ConfigPanel';
import {createStatusBarItem} from './Config/ConfigStatusBar';
import {CodelensProvider} from './Editor/CodelensProvider';
import {HoverProvider} from './Editor/HoverProvider';
import {runInferenceQuickInput} from './Execute/executeQuickInput';
import {Jsontracer} from './Jsontracer';
import {MondrianEditorProvider} from './Mondrian/MondrianEditor';
import {OneExplorer} from './OneExplorer';
import {Project} from './Project';
import {Utils} from './Utils';
import {showInstallQuickInput} from './View/InstallQuickInput';

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
  // Refer to https://github.com/Samsung/ONE-vscode/issues/331#issuecomment-1081295299 for
  // experience with directory path format.
  let dirList: string[] = [/* NYI */];
  vscode.commands.executeCommand('setContext', 'onevscode.compilableDirList', dirList);
}

export function activate(context: vscode.ExtensionContext) {
  const logger = Utils.Logger.getInstance();

  logger.outputWithTime('one-vscode activate OK');

  setGlobalContext();

  new OneExplorer(context, logger);

  // ONE view
  let refreshCompiler = vscode.commands.registerCommand('onevscode.refresh-toolchain', () => {
    console.log('refresh-toolchain: NYI');
  });
  context.subscriptions.push(refreshCompiler);
  let installCompiler = vscode.commands.registerCommand('onevscode.install-toolchain', () => {
    showInstallQuickInput(context);
  });
  context.subscriptions.push(installCompiler);

  // Target Device view
  let registerDevice = vscode.commands.registerCommand('onevscode.register-device', () => {
    console.log('register-device: NYI');
  });
  context.subscriptions.push(registerDevice);

  let inferenceCommand = vscode.commands.registerCommand('onevscode.infer-model', () => {
    console.log('one infer model...');
    runInferenceQuickInput(context);
  });
  context.subscriptions.push(inferenceCommand);

  // show compilation page
  let compileWebView = vscode.commands.registerCommand('onevscode.show-compile-webview', () => {
    CompilePanel.render(context.extensionUri);
  });
  context.subscriptions.push(compileWebView);

  context.subscriptions.push(CfgEditorPanel.register(context));

  let projectBuilder = new Project.Builder(logger);

  projectBuilder.init();

  let disposableOneBuild = vscode.commands.registerCommand('onevscode.build', () => {
    console.log('one build...');
    projectBuilder.build(context);
  });
  context.subscriptions.push(disposableOneBuild);

  let disposableOneImport = vscode.commands.registerCommand('onevscode.import', () => {
    console.log('one import...');
    projectBuilder.import(context);
  });
  context.subscriptions.push(disposableOneImport);

  let disposableOneJsontracer = vscode.commands.registerCommand('onevscode.json-tracer', () => {
    console.log('one json tracer...');
    Jsontracer.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(disposableOneJsontracer);

  let disposableOneConfigurationSettings =
      vscode.commands.registerCommand('onevscode.configuration-settings', () => {
        ConfigPanel.createOrShow(context);
        console.log('one configuration settings...');
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
    console.log('one circle tracer...');
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
