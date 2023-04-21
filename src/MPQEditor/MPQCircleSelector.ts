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

import {
  CircleGraphCtrl,
  CircleGraphEvent,
} from "../CircleGraph/CircleGraphCtrl";

export interface MPQSelectionEvent {
  onSelection(names: string[], document: vscode.TextDocument): void;
  onClosed(panel: vscode.WebviewPanel): void;
  onOpened(panel: vscode.WebviewPanel): void;
}

export type MPQSelectionCmdOpenArgs = {
  modelPath: string;
  document: vscode.TextDocument;
  names: any;
  panel: vscode.WebviewPanel;
};

export class MPQSelectionPanel
  extends CircleGraphCtrl
  implements CircleGraphEvent
{
  public static readonly viewType = "one.viewer.mpq";

  public static panels: MPQSelectionPanel[] = [];

  public static register(_context: vscode.ExtensionContext): void {}

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    _args: MPQSelectionCmdOpenArgs,
    _handler: MPQSelectionEvent | undefined
  ) {
    super(extensionUri, panel.webview);
    // TODO
  }

  public dispose() {
    //TODO
  }

  /**
   * CircleGraphEvent interface implementations
   */
  public onViewMessage(_message: any) {
    // TODO
  }
}
