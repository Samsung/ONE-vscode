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

export type ArtifactType =
  | "DIRECTORY"
  | "BASEMODEL_TFLITE"
  | "BASEMODEL_ONNX"
  | "BASEMODEL_PB"
  | "CONFIG_ONE"
  | "PRODUCT_CIRCLE"
  | "PRODUCT_TVN"
  | "PRODUCT_MONDRIAN"
  | "PRODUCT_CHROME_TRACE"
  | "PRODUCT_TV2W"
  | "PRODUCT_TV2O"
  | "PRODUCT_TV2M"
  | "PRODUCT_CIRCLE_LOG";


export interface Artifact {
  type: ArtifactType;
  path: string;
}

/**
 * @reference (OneExplorer) Node
 */
export interface NodeAttr {
  ext?: string;
  hidable?: boolean;
}

/**
 * @reference vscode.TreeItem
 */
export interface TreeItemAttr {
  icon?: vscode.ThemeIcon;
  openViewType?: string;
  collapsibleState?: vscode.TreeItemCollapsibleState;
}

export interface ArtifactAttr extends NodeAttr, TreeItemAttr {}

class DirectoryArtifactAttr implements ArtifactAttr {
  readonly ext = undefined;
  readonly hidable = false;
  icon?: vscode.ThemeIcon;
  readonly openViewType = undefined;
  readonly collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
}

class BaseModelArtifactAttr implements ArtifactAttr {
  ext?: string;
  readonly hidable = false;
  icon?: vscode.ThemeIcon;
  openViewType?: string;
  readonly collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
}

class ConfigArtifactAttr implements ArtifactAttr {
  ext?: string;
  readonly hidable = false;
  icon?: vscode.ThemeIcon;
  openViewType?: string;
  readonly collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
}

class ProductArtifactAttr implements ArtifactAttr {
  ext?: string;
  hidable?: boolean;
  icon?: vscode.ThemeIcon;
  openViewType?: string;
  readonly collapsibleState = vscode.TreeItemCollapsibleState.None;
}

export interface IArtifactAttrProvider {
  to: (type: ArtifactType) => ArtifactAttr;
}

export class ArtifactAttrProvider implements IArtifactAttrProvider {
  to(type: ArtifactType): ArtifactAttr {
    switch (type) {
      case "DIRECTORY":
        return DIRECTORY_ARTIFACT_ATTR;
      case "BASEMODEL_TFLITE":
        return BASEMODEL_TFLITE_ARTIFACT_ATTR;
      case "BASEMODEL_ONNX":
        return BASEMODEL_ONNX_ARTIFACT_ATTR;
      case "BASEMODEL_PB":
        return BASEMODEL_PB_ARTIFACT_ATTR;
      case "CONFIG_ONE":
        return CONFIG_ONE_ARTIFACT_ATTR;
      case "PRODUCT_CIRCLE":
        return PRODUCT_CIRCLE_ARTIFACT_ATTR;
      case "PRODUCT_TVN":
        return PRODUCT_TVN_ARTIFACT_ATTR;
      case "PRODUCT_MONDRIAN":
        return PRODUCT_MONDRIAN_ARTIFACT_ATTR;
      case "PRODUCT_CHROME_TRACE":
        return PRODUCT_CHROME_TRACE_ARTIFACT_ATTR;
      case "PRODUCT_TV2W":
        return PRODUCT_TV2W_ARTIFACT_ATTR;
      case "PRODUCT_TV2O":
        return PRODUCT_TV2O_ARTIFACT_ATTR;
      case "PRODUCT_TV2M":
        return PRODUCT_TV2M_ARTIFACT_ATTR;
      case "PRODUCT_CIRCLE_LOG":
        return PRODUCT_CIRCLE_LOG_ARTIFACT_ATTR;
    }
  }
}

// DIRECTORY //
export const DIRECTORY_ARTIFACT_ATTR: DirectoryArtifactAttr = {
  ext: undefined,
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: undefined,
  collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
};

// BASEMODEL //
export const BASEMODEL_TFLITE_ARTIFACT_ATTR: BaseModelArtifactAttr = {
  ext: ".tflite",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "one.viewer.circle",
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
};

export const BASEMODEL_ONNX_ARTIFACT_ATTR: BaseModelArtifactAttr = {
  ext: ".onnx",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "one.viewer.circle",
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
};

export const BASEMODEL_PB_ARTIFACT_ATTR: BaseModelArtifactAttr = {
  ext: ".pb",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "one.viewer.circle",
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
};

// CONFIG //
export const CONFIG_ONE_ARTIFACT_ATTR : ConfigArtifactAttr = {
  ext: ".cfg",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "one.editor.cfg",
  collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
};

// PRODUCT //
export const PRODUCT_CIRCLE_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".circle",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "one.viewer.circle",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};

export const PRODUCT_TVN_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".tvn",
  hidable: false,
  icon: new vscode.ThemeIcon("symbol-variable"),
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};

export const PRODUCT_MONDRIAN_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".tracealloc.json",
  hidable: true,
  icon: new vscode.ThemeIcon("graph"),
  openViewType: "one.viewer.mondrian",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
export const PRODUCT_CHROME_TRACE_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".json",
  hidable: true,
  icon: new vscode.ThemeIcon("graph"),
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
export const PRODUCT_TV2M_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".tv2m",
  hidable: true,
  icon: new vscode.ThemeIcon("symbol-method"),
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
export const PRODUCT_TV2O_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".tv2o",
  hidable: true,
  icon: new vscode.ThemeIcon("symbol-method"),
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
export const PRODUCT_TV2W_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".tv2w",
  hidable: true,
  icon: new vscode.ThemeIcon("symbol-method"),
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
export const PRODUCT_CIRCLE_LOG_ARTIFACT_ATTR: ProductArtifactAttr = {
  ext: ".circle.log",
  hidable: true,
  icon: vscode.ThemeIcon.File,
  openViewType: "default",
  collapsibleState: vscode.TreeItemCollapsibleState.None,
};
