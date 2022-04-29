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

import {Compiler} from '../Backend/Compiler';
import {Toolchain} from '../Backend/Toolchain';
import {BuilderJob} from '../Project/BuilderJob';
import {Job} from '../Project/Job';
import {JobConfig} from '../Project/JobConfig';
import {JobInstall} from '../Project/JobInstall';
import {JobInstalled} from '../Project/JobInstalled';
import {JobUninstall} from '../Project/JobUninstall';
import {WorkFlow} from '../Project/WorkFlow';
import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

class Env implements BuilderJob {
  workFlow: WorkFlow;  // our build WorkFlow
  currentWorkspace: string = '';
  prepare: boolean = false;

  constructor(l: Logger) {
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
    console.log('Done building WorkFlow on Env');
    console.log(this.workFlow.jobs);
    this.prepare = true;
  }

  public build() {
    if (this.prepare !== true) {
      throw Error('Env is not yet prepared');
    }

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
class CompileEnv extends Env {
  installed?: Toolchain;
  compiler: Compiler;

  constructor(l: Logger, compiler: Compiler) {
    super(l);
    this.installed = undefined;
    this.compiler = compiler;
    this.init();
  }

  confirmInstalled() {
    this.clearJobs();

    const toolchains = this.compiler.toolchains();
    for (let index = 0; index < toolchains.length; index++) {
      const toolchain = toolchains[index];
      let cmd = toolchain.installed();
      let job = new JobInstalled(cmd);
      job.successCallback = () => {
        this.installed = toolchain;
      };
      this.addJob(job);
    }

    this.finishAdd();
    this.build();
  }

  listAvailable(): Toolchain[] {
    return this.compiler.toolchains();
  }

  listInstalled(): Toolchain|undefined {
    return this.installed;
  }

  install(toolchain: Toolchain) {
    if (this.installed !== undefined) {
      throw Error('Before installing, uninstall toolchain');
    }
    if (this.installed === toolchain) {
      throw Error('The toolchain is already installed');
    }
    let cmd = toolchain.installed();
    let job = new JobInstall(cmd);
    job.successCallback = () => {
      this.installed = toolchain;
    };
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }

  uninstall(toolchain: Toolchain) {
    if (this.installed === undefined) {
      throw Error('Any toolchain is not yet installed');
    }
    if (this.installed !== toolchain) {
      throw Error('The other toolchain is installed');
    }
    let cmd = toolchain.uninstall();
    let job = new JobUninstall(cmd);
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }

  compile(cfg: string, toolchain: Toolchain) {
    if (this.installed === undefined) {
      throw Error('Any toolchain is not yet installed');
    }
    if (this.installed !== toolchain) {
      throw Error('The other toolchain is installed');
    }
    let cmd = this.compiler.compile(cfg);
    let job = new JobConfig(cmd);
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }
};

export {Env, CompileEnv};
