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

import assert from 'assert';

import {globalBackendMap} from '../Backend';
import {Compiler} from '../Backend/Compiler';
import {Toolchain} from '../Backend/Toolchain';
// Project
import {BuilderJob} from '../Project/BuilderJob';
import {Job} from '../Project/Job';
import {JobConfig} from '../Project/JobConfig';
import * as JobToolchain from '../Project/JobToolchain';
import {WorkFlow} from '../Project/WorkFlow';
// Utils
import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

export class Env implements BuilderJob {
  logger: Logger;
  workFlow: WorkFlow;  // our build WorkFlow
  currentWorkspace: string = '';
  prepare: boolean = false;

  constructor(l: Logger) {
    this.logger = l;
    this.workFlow = new WorkFlow(l);
  }

  public init() {
    this.workFlow.clearJobs();
  }

  public addJob(job: Job): void {
    assert(this.prepare === false);
    this.workFlow.addJob(job);
  }

  public clearJobs(): void {
    this.workFlow.clearJobs();
    this.prepare = false;
  }

  public finishAdd(): void {
    console.log('Done building WorkFlow.');
    console.log(this.workFlow.jobs);
    this.prepare = true;
  }

  // FYI. this.workFlow is copied internally
  // TODO: Add complete cb function
  public build() {
    try {
      this.currentWorkspace = helpers.obtainWorkspaceRoot();
    } catch (e: unknown) {
      let errmsg = 'Failed to obtain workspace root';
      if (e instanceof Error) {
        errmsg = e.message;
      }
      // TODO add more type for e if changed in obtainWorkspaceRoot
      Balloon.error(errmsg);
      return;
    }

    this.workFlow.start(this.currentWorkspace);
  }
}

// A CompileEnv has a Toolchain
export class CompileEnv extends Env {
  installed: Toolchain[] = [];
  compiler: Compiler;

  constructor(l: Logger, compiler: Compiler) {
    super(l);
    this.compiler = compiler;
  }

  refresh() {
    this.init();
    const toolchains = this.compiler.toolchains();
    toolchains.forEach((t) => {
      if (t.info.installed) {
        const index = this.installed.indexOf(t);
        if (index === -1) {
          this.installed.push(t);
        }
      }
    });
  }

  listAvailable(): Toolchain[] {
    return this.compiler.toolchains().filter(t => t.info.installed === false);
  }

  listInstalled(): Toolchain[] {
    console.log(this.installed.length);
    return this.installed;
  }

  install(t: Toolchain) {
    // assert(this toolchain should not be installed)
    // assert(installed doesn't have t)
    let cmd = t.install();
    let job = new JobToolchain.JobInstall(cmd);
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
    this.installed.push(t);
    console.log(this.installed.length);
  }

  uninstall(t: Toolchain) {
    // assert(this toolchain should be installed)
    // assert(installed has t)
    const index = this.installed.indexOf(t);
    assert(index === -1);
    let cmd = t.uninstall();
    let job = new JobToolchain.JobUninstall(cmd);
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
    this.installed.splice(index, 1);
    console.log(this.installed.length);
  }

  compile(cfg: string, t: Toolchain) {
    const index = this.installed.indexOf(t, 0);
    if (index === -1) {
      throw Error('This toolchain should be installed before the compile job');
    }
    // assert(this toolchain should be installed)
    // assert(installed has t)
    let cmd = this.compiler.compile(cfg);
    let job = new JobConfig(cmd);
    this.clearJobs();
    // TODO: Add sth for the specific version of toolchain
    this.addJob(job);
    this.finishAdd();
    this.build();
  }
};

/**
 * Interface of backend map
 */
interface CompileEnvMap {
  [key: string]: CompileEnv;
}

export let gCompileEnvMap: CompileEnvMap = {};
