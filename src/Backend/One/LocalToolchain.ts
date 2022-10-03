
import * as cp from 'child_process';
import * as fs from 'fs';

import {BuildInfo} from '../../MetadataManager/Metadata';
import {Relation} from '../../MetadataManager/Relation';
import {OneStorage} from '../../OneExplorer/OneStorage';
import {Backend} from '../Backend';
import {Command} from '../Command';
import {Compiler} from '../Compiler';
import {Executor} from '../Executor';
import {DeviceSpec} from '../Spec';
import {Toolchain, ToolchainInfo, Toolchains} from '../Toolchain';
import {Version} from '../Version';

const which = require('which');

export class LocalToolchain implements Backend {
  private static _name = 'dummy backend';

  name(): string {
    return LocalToolchain._name;
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
  getToolchains(_toolchainType: string, _start: number, _count: number): Toolchains {
    const array = new Array<Toolchain>();
    const toolchainInfo =
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(1, 2, 3));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
    // const array = new Array<Toolchain>();
    // const toolchainInfo = new ToolchainInfo("dummy toolchain", "dummy!!!!", new Version(1, 2,
    // 3)); array.push(new DummyToolchain(toolchainInfo)); return array;
  }
  getInstalledToolchains(_toolchainType: string): Toolchains {
    const array = new Array<Toolchain>();
    const toolchainInfo =
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(1, 2, 3));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
    // const array = new Array<Toolchain>();
    // const toolchainInfo = new ToolchainInfo("dummy toolchain", "dummy!!!!", new Version(1, 2,
    // 3)); array.push(new DummyToolchain(toolchainInfo)); return array;
  }
  prerequisitesForGetToolchains(): Command {
    return new Command('prerequisitesForGetToolchains');
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
        new ToolchainInfo('metadata toolchain', 'Toolchain for metadata', new Version(1, 2, 3));
    array.push(new MetadataToolchain(toolchainInfo));
    return array;
  }
  runInference(_modelPath: string, _options?: string[]|undefined): Command {
    return new Command('runInference');
  }
  require(): DeviceSpec {
    return new DeviceSpec('hw', 'sw', undefined);
  }
}

class MetadataToolchain extends Toolchain {
  run(_cfg: string): Command {
    console.log('LocalToolcahin:run');
    // find onecc path (can find only if it is installed from debian pkg)
    let oneccPath = which.sync('onecc', {nothrow: true});
    if (oneccPath === null) {
      // Use fixed installation path
      oneccPath = '/home/one/onecc_test/bin/onecc';
    }

    const cfgObj = OneStorage.getCfgObj(_cfg);
    console.log(cfgObj?.rawObj);
    // const slashIdx = _cfg.lastIndexOf('/');
    // const basePath = _cfg.substring(0, slashIdx == -1 ? 0 : slashIdx);
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
          // TODO: consider when the input/output path is a relative path
          const inputPath = value['input_path'];
          const outputPath = value['output_path'];
          // const inputPath = (value['input_path'].charAt(0)==='/' ? '' : basePath) +
          // value['input_path']; const outputPath = (value['input_path'].charAt(0)==='/' ? '' :
          // basePath) + value['output_path'];
          // FIXME: consider when the input path and the output path is same
          if (inputPath && outputPath && inputPath !== outputPath) {
            Relation.store(outputPath, inputPath);
            if (outputPath.split('.').pop() === 'circle') {
              Relation.store(outputPath + '.log', outputPath);
            }
            /* eslint-enable */
          }
          for (let [k, v] of Object.entries(value)) {
            if (k !== 'input_path' && k !== 'output_path') {
              // while(k.)
              data[k.replace(/_/gi, '-')] = v;
            }
          }
        } else {
          continue;
        }
        cfgInfo[key] = data;
      }
      for (let product of cfgObj.getProducts) {
        BuildInfo.set(product.path, 'toolchain', this.info);
        BuildInfo.set(product.path, 'cfg', cfgInfo);
      }
    }

    const oneccRealPath = fs.realpathSync(oneccPath);
    const process = cp.spawnSync(oneccRealPath, ['--version']);
    if (process.status === 0) {
      const result = Buffer.from(process.stdout).toString();
      const oneccVersion = result.toString().split('\n')[0].split(' ')[2];
      if (cfgObj) {
        for (let product of cfgObj.getProducts) {
          BuildInfo.set(product.path, 'onecc', oneccVersion);
        }
      }
    }
    return new Command(oneccRealPath, ['-C', _cfg]);
  }
}