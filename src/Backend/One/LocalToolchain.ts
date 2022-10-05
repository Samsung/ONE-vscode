
import * as cp from 'child_process';
import {assert} from 'console';
import * as fs from 'fs';
import * as which from 'which';

import {Logger} from '../../Utils/Logger';
import {Backend} from '../Backend';
import {Command} from '../Command';
import {Compiler} from '../Compiler';
import {Executor} from '../Executor';
import {Toolchain, ToolchainInfo, Toolchains} from '../Toolchain';
import {Version} from '../Version';

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

    if (!oneccPath) {
      return [];
    }

    const oneccRealPath = fs.realpathSync(oneccPath);
    const process = cp.spawnSync(oneccRealPath, ['--version']);
    if (process.status !== 0) {
      return [];
    }

    const result = Buffer.from(process.stdout).toString();
    const oneccVersion =
        result.toString().split('\n')[0].split(' ')[2].split('.').map(strnum => Number(strnum));
    assert(oneccVersion.length === 3);

    const [major, minor, patch] = oneccVersion;

    const toolchainInfo = new ToolchainInfo(
        'ONE Toolchain(Local)', 'Existing installed ONE Toolchain',
        new Version(major, minor, patch));

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
      Logger.error('LocalToolchain', 'Cannot find local toolchain');
      return new Command('');
    }

    const oneccRealPath = fs.realpathSync(oneccPath);
    return new Command(oneccRealPath, ['-C', _cfg]);
  }
}
