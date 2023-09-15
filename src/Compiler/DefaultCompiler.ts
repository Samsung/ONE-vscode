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

import { Logger } from "../Utils/Logger";
import { CompilerNode } from "./CompilerNodeBuilder";

class DefaultToolchain {
  private static _instance: DefaultToolchain;
  private _compilerNode?: CompilerNode;

  private constructor() {
    // This is private constructor
  }

  public static getInstance() {
    return this._instance || (this._instance = new this());
  }

  public set(compiler: CompilerNode) {
    if (this.isEqual(compiler)) {
      return;
    }
    this._compilerNode = compiler;

    Logger.debug("DefaultCompiler", `${this._compilerNode.label} was set as a default toolchain.`);
  }

  /* istanbul ignore next */
  public openDocument() {
    const doc =
      "https://github.com/Samsung/ONE-vscode/blob/main/docs/Tutorial.md#set-default-toolchain";
    vscode.env.openExternal(vscode.Uri.parse(doc));
  }

  public unset() {
    this._compilerNode = undefined;
  }

  public get(): CompilerNode | undefined {
    return this._compilerNode;
  }

  public isEqual(compiler: CompilerNode) {
    if (this._compilerNode && this._compilerNode.label === compiler.label) {
      return true;
    }
    return false;
  }
}

const defaultCompiler = DefaultToolchain.getInstance();

export { defaultCompiler };
