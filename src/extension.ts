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

import * as vscode from "vscode";

import { API } from "./Backend/API";
import { OneToolchain } from "./Backend/One/OneToolchain";
import { CfgEditorPanel } from "./CfgEditor/CfgEditorPanel";
import { EdgeTPUCfgEditorPanel } from "./CfgEditor/EdgeTPUCfgEditorPanel";
import { CircleEditorProvider } from "./CircleEditor/CircleEditorProvider";
import { CircleViewerProvider } from "./CircleGraph/CircleViewer";
import { DeviceViewProvider } from "./Execute/DeviceViewProvider";
import { JsonTracerViewerPanel } from "./Jsontracer/JsonTracerViewerPanel";
import { MetadataViewerProvider } from "./MetadataViewer/MetadataViewerProvider";
import { MondrianEditorProvider } from "./Mondrian/MondrianEditor";
import { OneTreeDataProvider } from "./OneExplorer/OneExplorer";
import { PartEditorProvider } from "./PartEditor/PartEditor";
import { PartGraphSelPanel } from "./PartEditor/PartGraphSelector";
import { ToolchainProvider } from "./Toolchain/ToolchainProvider";
import { Logger } from "./Utils/Logger";
import { VisqViewerProvider } from "./Visquv/VisqViewer";
import { MPQEditorProvider } from "./MPQEditor/MPQEditor";
import { MPQSelectionPanel } from "./MPQEditor/MPQCircleSelector";
import { EdgeTPUToolchain } from "./Backend/EdgeTPU/EdgeTPUToolchain";

/* istanbul ignore next */
export function activate(context: vscode.ExtensionContext) {
  const tag = "activate";

  Logger.info(tag, "one-vscode activate OK");

  /**
   * Set runtime extensionKind in setContext to use in package.json 'when' clause.
   * NOTE that 'extensionKind' in package.json and 'one:extensionKind' can be different.
   *      'extensionKind' is a preferred setting
   *      'context.extension.extensionKind' is an actual runtime extenionKind.
   *      'one:extensionKind' is a context value equivalent to context.extension.extensionKind.
   */
  if (context.extension.extensionKind === vscode.ExtensionKind.UI) {
    vscode.commands.executeCommand("setContext", "one:extensionKind", "UI");
  } else {
    vscode.commands.executeCommand(
      "setContext",
      "one:extensionKind",
      "Workspace"
    );
  }

  OneTreeDataProvider.register(context);

  ToolchainProvider.register(context);

  DeviceViewProvider.register(context);

  CfgEditorPanel.register(context);

  EdgeTPUCfgEditorPanel.register(context);

  JsonTracerViewerPanel.register(context);

  MondrianEditorProvider.register(context);

  PartEditorProvider.register(context);
  PartGraphSelPanel.register(context);

  CircleEditorProvider.register(context);

  CircleViewerProvider.register(context);

  VisqViewerProvider.register(context);

  MetadataViewerProvider.register(context);

  MPQEditorProvider.register(context);
  MPQSelectionPanel.register(context);

  API.registerBackend(new OneToolchain());
  API.registerBackend(new EdgeTPUToolchain());

  // returning backend registration function that will be called by backend extensions
  return API;
}

/* istanbul ignore next */
export function deactivate() {
  // TODO do cleanup
}
