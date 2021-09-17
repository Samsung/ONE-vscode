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

import {CodelensProvider} from './Codelens/CodelensProvider';
import {Project} from './Project';
import {Utils} from './Utils';

export function activate(context: vscode.ExtensionContext) {
  console.log('one-vscode activate OK');

  let logger = new Utils.Logger();
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

  let disposableOneBarchart = vscode.commands.registerCommand('onevscode.barchart', () => {
    console.log('one barchart...');
  });
  context.subscriptions.push(disposableOneBarchart);

  let disposableOneConfigurationSettings =
      vscode.commands.registerCommand('onevscode.configuration-settings', () => {
        console.log('one configuration settings...');
      });
  context.subscriptions.push(disposableOneConfigurationSettings);

  let codelens = new CodelensProvider();
  let disposableCodelens = vscode.languages.registerCodeLensProvider('ini', codelens);
  context.subscriptions.push(disposableCodelens);
}

export function deactivate() {
  // TODO do cleanup
}
