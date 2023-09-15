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

import { Logger } from "../Utils/Logger";
import { ExecutorNode } from "./ExecuteViewProvider";

class DefaultExecutor {
  private static _instance: DefaultExecutor;
  private _executorNode?: ExecutorNode;

  private constructor() {
    // This is private constructor
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public set(executor: ExecutorNode) {
    if (this.isEqual(executor)) {
      return;
    }
    this._executorNode = executor;

    Logger.debug("DefaultToolchain", `${this._executorNode.label} was set as a default toolchain.`);
  }

  // /* istanbul ignore next */
  // public openDocument() {
  //   const doc =
  //     "https://github.com/Samsung/ONE-vscode/blob/main/docs/Tutorial.md#set-default-toolchain";
  //   vscode.env.openExternal(vscode.Uri.parse(doc));
  // }

  public get(): ExecutorNode | undefined {
    return this._executorNode;
  }


  public isEqual(executor: ExecutorNode) {
    if (this._executorNode && this._executorNode.label === executor.label) {
      return true;
    }
    return false;
  }
}

const defaultExecutor = DefaultExecutor.getInstance();

export { defaultExecutor };
