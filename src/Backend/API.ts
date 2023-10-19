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

import * as vscode from "vscode";
const assert = require("assert");
import { Backend } from "./Backend";
import { gToolchainEnvMap, ToolchainEnv } from "../Toolchain/ToolchainEnv";
import { Logger } from "../Utils/Logger";

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
export interface BackendMap {
  [key: string]: Backend;
}

// TODO Move outside API.ts
// List of backend extensions registered
let globalBackendMap: BackendMap = {};

const logTag = "API";

// TODO Move outside API.ts
export namespace BackendContext {
  export const isRegistered = (backendName: string) => {
    return globalBackendMap[backendName] !== undefined;
  };
}

const registerBackend = (backend: Backend) => {
  const backendName = backend.name();
  assert(backendName.length > 0);
  globalBackendMap[backendName] = backend;
  const compiler = backend.compiler();
  if (compiler) {
    gToolchainEnvMap[backend.name()] = new ToolchainEnv(compiler);
    vscode.commands.executeCommand(
      "setContext",
      `one:backend.${backend.name()}`,
      "enabled"
    );
  }

  Logger.info(
    logTag,
    "Backend",
    backendName,
    "was registered into ONE-vscode."
  );

  // NOTE: This might not 100% guaratee the activating extension has been done.
  //   - link: https://github.com/Samsung/ONE-vscode/pull/1101#issuecomment-1195099002
  // TODO: Consider better way to refresh toolchainView after backend's registration.
  vscode.commands.executeCommand("one.toolchain.refresh");
  vscode.commands.executeCommand("one.device.refresh");
};

export const API = {
  registerBackend,
};

export { globalBackendMap };
