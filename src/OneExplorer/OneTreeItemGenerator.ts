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

import { Node, OneTreeItem } from "./OneExplorer";
import { ArtifactAttrProvider, ArtifactAttr } from "./Artifact";

interface TreeItemGenerator<T, U> {
  generate(node: T): U;
}

export class OneTreeItemGenerator
  implements TreeItemGenerator<Node, OneTreeItem>
{
  constructor(private _artifactAttrProvider: ArtifactAttrProvider) {}

  generate(node: Node): OneTreeItem {
    const attr: ArtifactAttr = this._artifactAttrProvider.to(node.artifactType);
    if (!attr) {
      throw Error(
        `ArtifactAttrProvider Failed! Cannot get artifact attribute for ${node}`
      );
    }

    return new OneTreeItem(
      node,
      attr.icon!,
      attr.collapsibleState!,
      attr.openViewType
    );
  }
}
