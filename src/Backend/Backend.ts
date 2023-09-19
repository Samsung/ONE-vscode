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

import { ToolchainManager } from "./ToolchainManager";

/**
 * This file defines common API exposed by backend extension.
 *
 * Each backend extensions should implement Backend interface.
 * Through registration API of ONE-vscode extension, those backend extensions
 * needs to register implementation of Backend interface.
 *
 * TODO ONE-vscode and backend extensions have copies of this file. Check if this is really OK.
 */

// ** The scope of Backend is defined by each backend supporter **
// A kind of proxy. Backend doesn't know where it-self is (local? remote? it doesn't know.)
export interface Backend {
  // backend's name. this doesn't mean the name of the toolchain
  name(): string;

  // toolchain manager
  // Implementation of ToolchainManager is provided by backend supporter.
  toolchainManager(): ToolchainManager;

  supportCompiler(): boolean;
  supportExecutor(): boolean;
}
