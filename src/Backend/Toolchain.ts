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

import {Command} from '../Project/Command';
import {Version} from '../Utils/Version';

interface PackageInfo {
  name: string;
  version: Version;
}

// NOTE: This structure should be used as Return Values
// TODO: Support the latest version
interface ToolchainInfo {
  name: string;
  description: string;
  version: Version;        // specific version
  depends: PackageInfo[];  // too much dependens on deb
  installed: boolean;
}

// TODO: Support `DockerToolchain` so multiple toolchains can be installed
// Toolchain: Debian(...) OR Docker(...)
// A toolchain has a package or multiple packages
interface Toolchain {
  info: ToolchainInfo;
  install(): Command;
  uninstall(): Command;
  installed(): Command;  // isInstalled ?
}

// Request
// NOTE: This structure should be used as Request Values for Toolchains
// TODO: ToolchainRequest

// TODO: How to handle `nightly`?
// TODO: MinimumVersion(): >=
// TODO: filter() or where()
// TODO: filter(regex)
// TODO: orderBy()
class Toolchains extends Array<Toolchain> {
  // NYI
};

export {PackageInfo, ToolchainInfo, Toolchain, Toolchains};
