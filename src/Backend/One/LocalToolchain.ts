
import * as cp from 'child_process';
import { assert } from 'console';
import * as fs from 'fs';

// import {OneStorage} from '../../OneExplorer/OneStorage';
import {Backend} from '../Backend';
import {Command} from '../Command';
import {Compiler} from '../Compiler';
import {Executor} from '../Executor';
import {Toolchain, ToolchainInfo, Toolchains} from '../Toolchain';
import {Version} from '../Version';
import * as which from 'which';

export class OneLocalToolchain implements Backend {
  private static _name = 'ONE(Installed, local)';

  name(): string {
    return OneLocalToolchain._name;
  }

  compiler(): Compiler|undefined {
    return new LocalCompiler();
  }

  executor(): Executor|undefined {
    return undefined;
  }

  executors(): Executor[] {
    return [];
  }
}

class LocalCompiler implements Compiler {
  getToolchainTypes(): string[] {
    return ['local'];
  }

  getToolchains(_toolchainType: string, _start: number, _count: number): Toolchains {
    // Let's return installed local toolchain.
    return this.getInstalledToolchains(_toolchainType);
  }

  /**
   * Find the existing onecc path by 'which' 
   */
  getInstalledToolchains(_toolchainType: string): Toolchains {
    let oneccPath = which.sync('onecc', {nothrow: true});

    if(!oneccPath){
      return [];
    }

    const oneccRealPath = fs.realpathSync(oneccPath);
    const process = cp.spawnSync(oneccRealPath, ['--version']);
    if (process.status !== 0) {
      return [];
    }
    
    const result = Buffer.from(process.stdout).toString();
    const oneccVersion = result.toString().split('\n')[0].split(' ')[2].split('.').map(strnum => Number(strnum));
    assert(oneccVersion.length === 3);

    const [major, minor, patch] = oneccVersion;

    const toolchainInfo =
        new ToolchainInfo('ONE Toolchain(Local)', 'Existing installed ONE Toolchain', new Version(major, minor, patch));

    return [new LocalToolchain(toolchainInfo)];
  }

  prerequisitesForGetToolchains(): Command {
    // Do nothing
    return new Command('');
  }
}

class LocalToolchain extends Toolchain {
  run(_cfg: string): Command {
    // find onecc path (can find only if it is installed from debian pkg)
    const oneccPath = which.sync('onecc', {nothrow: true});
    if (!oneccPath) {
      return new Command('');
    }

    // const cfgObj = OneStorage.getCfgObj(_cfg);
    // if (cfgObj) {
    //   const cfgInfo: any = {};
    //   const enabledSteps = new Set<string>();
    //   for (let [key, value] of Object.entries(cfgObj.rawObj)) {
    //     const data: any = {};
    //     if (key === 'onecc') {
    //       for (let [step, isEnabled] of Object.entries(value)) {
    //         if (isEnabled === 'True') {
    //           data[step] = true;
    //           enabledSteps.add(step);
    //         }
    //       }
    //     } else if (enabledSteps.has(key)) {
    //       // TODO: consider when the input/output path is a relative path
    //       const inputPath = value['input_path'];
    //       const outputPath = value['output_path'];
    //       // FIXME: consider when the input path and the output path is same
    //       if (inputPath && outputPath && inputPath !== outputPath) {
    //         Relation.store(outputPath, inputPath);
    //         if (outputPath.split('.').pop() === 'circle') {
    //           Relation.store(outputPath + '.log', outputPath);
    //         }
    //       }
    //       for (let [k, v] of Object.entries(value)) {
    //         if (k !== 'input_path' && k !== 'output_path') {
    //           data[k.replace(/_/gi, '-')] = v === 'True' ? true : v;
    //         }
    //       }
    //     } else {
    //       continue;
    //     }
    //     cfgInfo[key] = data;
    //   }
    //   for (let product of cfgObj.getProducts) {
    //     BuildInfo.set(product.path, 'toolchain', this.info);
    //     BuildInfo.set(product.path, 'cfg', cfgInfo);
    //   }
    // }

    // const process = cp.spawnSync(oneccRealPath, ['--version']);
    // if (process.status === 0) {
    //   const result = Buffer.from(process.stdout).toString();
    //   const oneccVersion = result.toString().split('\n')[0].split(' ')[2];
    //   if (cfgObj) {
    //     for (let product of cfgObj.getProducts) {
    //       BuildInfo.set(product.path, 'onecc', oneccVersion);
    //     }
    //   }
    // }
  
    const oneccRealPath = fs.realpathSync(oneccPath);
    return new Command(oneccRealPath, ['-C', _cfg]);
  }
}