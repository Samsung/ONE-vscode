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

export function createStatusBarItem(context: vscode.ExtensionContext) {
  let cfgStatusBarItem: vscode.StatusBarItem;
  cfgStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  cfgStatusBarItem.text = `$(file-add) ONE configuration Settings`;
  cfgStatusBarItem.command = 'onevscode.configuration-settings';
  context.subscriptions.push(cfgStatusBarItem);
  cfgStatusBarItem.show();
}
