/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
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

import {Toolchain} from '../Backend/Toolchain';
import {Logger} from '../Utils/Logger';
import {ToolchainEnv} from './ToolchainEnv';

class DefaultToolchain {
  private static _instance: DefaultToolchain;
  private _toolchainEnv?: ToolchainEnv;
  private _toolchain?: Toolchain;

  private constructor() {
    // This is private constructor
  }

  static getInstance() {
    return this._instance || (this._instance = new this());
  }

  async ask(toolchainEnv: ToolchainEnv, toolchain: Toolchain): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const name = `${toolchain.info.name}-${toolchain.info.version ?.str()}`;
      vscode.window
          .showInformationMessage(`Do you want to use ${name} as a default toolchain?`, 'Yes', 'No')
          .then((answer) => {
            if (answer === 'Yes') {
              this.set(toolchainEnv, toolchain);
              return resolve(true);
            } else {
              return reject(null);
            }
          });
    });
  }

  set(toolchainEnv: ToolchainEnv, toolchain: Toolchain) {
    this._toolchainEnv = toolchainEnv;
    this._toolchain = toolchain;
    const name = `${toolchain.info.name}-${toolchain.info.version ?.str()}`;
    vscode.window.showInformationMessage(`Set ${name} as a default toolchain.`, 'OK', `Instruction`)
        .then((value) => {
          if (value === 'Instruction') {
            this.openDocument();
          }
        });
  }

  unset() {
    this._toolchainEnv = undefined;
    this._toolchain = undefined;
  }

  openDocument() {
    const doc =
        'https://github.com/Samsung/ONE-vscode/blob/main/docs/HowToUse.md#set-default-toolchain';
    vscode.env.openExternal(vscode.Uri.parse(doc));
  }

  getToolchain(): Toolchain|undefined {
    return this._toolchain;
  }

  getToolchainEnv(): ToolchainEnv|undefined {
    return this._toolchainEnv;
  }

  isEqual(toolchain: Toolchain) {
    if (this._toolchain &&
        JSON.stringify(this._toolchain.info) === JSON.stringify(toolchain.info)) {
      return true;
    }
    return false;
  }
}

export {DefaultToolchain};
