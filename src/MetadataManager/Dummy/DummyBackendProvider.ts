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

import * as cp from 'child_process';
import * as fs from 'fs';

import {backendRegistrationApi} from '../../Backend/API';
import {Backend} from '../../Backend/Backend';
import {Command} from '../../Backend/Command';
import {Compiler} from '../../Backend/Compiler';
import {Executor} from '../../Backend/Executor';
import {DeviceSpec} from '../../Backend/Spec';
import {Toolchain, ToolchainInfo, Toolchains} from '../../Backend/Toolchain';
import {Version} from '../../Backend/Version';
import {OneStorage} from '../../OneExplorer/OneStorage';
import {Metadata} from '../metadataAPI';

const which = require('which');

class DummyBackend implements Backend {
  private static _name = 'dummy backend';

  name(): string {
    return DummyBackend._name;
  }
  compiler(): Compiler|undefined {
    return new DummyCompiler();
  }
  executor(): Executor|undefined {
    return new DummyExecutor();
  }
  executors(): Executor[] {
    return [new DummyExecutor()];
  }
}

class DummyCompiler implements Compiler {
  getToolchainTypes(): string[] {
    return ['officially'];
  }
  /* eslint-disable-next-line */
  getToolchains(toolchainType: string, start: number, count: number): Toolchains {
    const array = new Array<Toolchain>();
    const toolchainInfo =
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(0, 1, 0));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
  }
  /* eslint-disable-next-line */
  getInstalledToolchains(toolchainType: string): Toolchains {
    const array = new Array<Toolchain>();
    const toolchainInfo =
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(0, 1, 0));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
  }
  prerequisitesForGetToolchains(): Command {
    return new Command('');
  }
}

class DummyExecutor implements Executor {
  name(): string {
    return 'dummy executor';
  }
  getExecutableExt(): string[] {
    return ['.cfg', '.pb', '.tflite', 'onnx'];
  }
  toolchains(): Toolchains {
    const array = new Array<Toolchain>();
    const toolchainInfo =
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(0, 1, 0));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
  }
  runInference(_modelPath: string, _options?: string[]|undefined): Command {
    return new Command('');
  }
  require(): DeviceSpec {
    return new DeviceSpec('', '', undefined);
  }
}

class MetadataToolchain extends Toolchain {
  run(_cfg: string): Command {
    // find onecc path (can find only if it is installed from debian pkg)
    let oneccPath = which.sync('onecc', {nothrow: true});
    if (oneccPath === null) {
      // Use fixed installation path
      oneccPath = '/home/one/onecc_test/bin/onecc';
    }

    const cfgObj = OneStorage.getCfgObj(_cfg);
    console.log(cfgObj?.rawObj);
    if (cfgObj) {
      const cfgInfo: any = {};
      const enabledSteps = new Set<string>();
      for (let [key, value] of Object.entries(cfgObj.rawObj)) {
        const data: any = {};
        if (key === 'onecc') {
          for (let [step, isEnabled] of Object.entries(value)) {
            if (isEnabled === 'True') {
              data[key] = true;
              // cfgInfo[key] = value;
              enabledSteps.add(step);
            }
          }
        } else if (enabledSteps.has(key)) {
          /* eslint-disable */
          const inputPath = value['input_path'];
          const outputPath = value['output_path'];
          // FIXME: consider when the input path and the output path is same
          if (inputPath && outputPath && inputPath !== outputPath) {
            Metadata.setRelationMap(outputPath, inputPath);
            if (outputPath.split('.').pop() === 'circle') {
              Metadata.setRelationMap(outputPath + '.log', outputPath);
            }
            /* eslint-enable */
          }
          for (let [k, v] of Object.entries(value)) {
            if (k !== 'input_path' && k !== 'output_path') {
              // while(k.)
              data[k.replace(/-/gi, '-')] = v;
            }
          }
        } else {
          continue;
        }
        cfgInfo[key] = data;
      }
      for (let product of cfgObj.getProducts) {
        Metadata.setBuildInfoMap(product.path, 'toolchain', this.info);
        // TODO: Refine cfg data (delete input/output path, replace string 'True' to boolean...)
        Metadata.setBuildInfoMap(product.path, 'cfg', cfgInfo);
      }
    }

    const oneccRealPath = fs.realpathSync(oneccPath);
    const process = cp.spawnSync(oneccRealPath, ['--version']);
    if (process.status === 0) {
      const result = Buffer.from(process.stdout).toString();
      const oneccVersion = result.toString().split('\n')[0].split(' ')[2];
      if (cfgObj) {
        for (let product of cfgObj.getProducts) {
          Metadata.setBuildInfoMap(product.path, 'onecc', oneccVersion);
        }
      }
    }
    return new Command(oneccRealPath, ['-C', _cfg]);
  }
}

export class DummyBackendProvider {
  public static register() {
    const backend = new DummyBackend();
    backendRegistrationApi().registerBackend(backend);
  }
}
