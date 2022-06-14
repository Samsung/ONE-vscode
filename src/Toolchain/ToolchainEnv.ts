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

import {strict as assert} from 'assert';

import {Compiler} from '../Backend/Compiler';
import {Toolchain, Toolchains} from '../Backend/Toolchain';
import {BuilderJob} from '../Project/BuilderJob';
import {Job, JobCallback} from '../Project/Job';
import {JobConfig} from '../Project/JobConfig';
import {JobInstall} from '../Project/JobInstall';
import {JobPrerequisites} from '../Project/JobPrerequisites';
import {JobUninstall} from '../Project/JobUninstall';
import {WorkFlow} from '../Project/WorkFlow';
import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';
import {showPasswordQuickInput} from '../View/PasswordQuickInput';

class Env implements BuilderJob {
  logTag = 'Env';
  workFlow: WorkFlow;  // our build WorkFlow
  currentWorkspace: string = '';
  isPrepared: boolean = false;

  constructor() {
    this.workFlow = new WorkFlow();
  }

  public init() {
    this.workFlow.clearJobs();
  }

  public addJob(job: Job): void {
    assert(this.isPrepared === false);
    this.workFlow.addJob(job);
  }

  public clearJobs(): void {
    this.workFlow.clearJobs();
    this.isPrepared = false;
  }

  public finishAdd(): void {
    Logger.info(this.logTag, 'Done building WorkFlow on Env:', this.workFlow.jobs);
    this.isPrepared = true;
  }

  public build() {
    if (this.isPrepared !== true) {
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

    const rootJobs = this.workFlow.jobs.filter(j => j.root === true);
    if (rootJobs.length > 0) {
      Logger.info(this.logTag, 'Showing password prompt');
      showPasswordQuickInput().then(password => {
        if (password === undefined) {
          Logger.info(this.logTag, 'Password dialog canceled');
          return;
        }
        Logger.info(this.logTag, 'Got password response');
        process.env.userp = password;
        this.workFlow.start(this.currentWorkspace);
      });
    } else {
      this.workFlow.start(this.currentWorkspace);
    }
  }
}

class ToolchainEnv extends Env {
  // TODO(jyoung): Support multiple installed toolchains
  compiler: Compiler;

  constructor(compiler: Compiler) {
    super();
    this.compiler = compiler;
    this.init();
  }

  getToolchainTypes(): string[] {
    return this.compiler.getToolchainTypes();
  }

  listAvailable(type: string, start: number, count: number): Toolchain[] {
    return this.compiler.getToolchains(type, start, count);
  }

  listInstalled(): Toolchain[] {
    return this.compiler.getToolchainTypes()
        .map((type) => this.compiler.getInstalledToolchains(type))
        .reduce((r, a) => {
          return r.concat(a);
        });
  }

  request(jobs: Array<Job>) {
    this.clearJobs();
    jobs.forEach((job) => {
      this.addJob(job);
    });
    this.finishAdd();
    this.build();
  }

  prerequisitesAsync(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.prerequisites(() => resolve(true), () => {
        // NOTE(jyoung)
        // Even though this job is failed, it still shows the version quick input.
        // The error message will be shown in JobRunner code to user. So here,
        // only the log is output and it goes to the `resolve` so that quick input
        // can be seen normally.
        resolve(false);
      });
    });
  }

  prerequisites(successCallback?: JobCallback, failedCallback?: JobCallback) {
    let cmd = this.compiler.prerequisitesForGetToolchains();
    let job = new JobPrerequisites(cmd);
    job.successCallback = successCallback;
    job.failureCallback = failedCallback;
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }

  install(toolchain: Toolchain, successCallback?: JobCallback, failedCallback?: JobCallback) {
    let cmd = toolchain.install();
    let job = new JobInstall(cmd);
    job.successCallback = successCallback;
    job.failureCallback = failedCallback;
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }

  uninstall(toolchain: Toolchain, successCallback?: JobCallback, failedCallback?: JobCallback) {
    let cmd = toolchain.uninstall();
    let job = new JobUninstall(cmd);
    job.successCallback = successCallback;
    job.failureCallback = failedCallback;
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }

  compile(
      cfg: string, toolchain: Toolchain, successCallback?: JobCallback,
      failedCallback?: JobCallback) {
    let cmd = this.compiler.compile(cfg);
    let job = new JobConfig(cmd);
    job.successCallback = successCallback;
    job.failureCallback = failedCallback;
    this.clearJobs();
    this.addJob(job);
    this.finishAdd();
    this.build();
  }
};

/**
 * Interface of backend map
 * - Use Obejct class to use the only string key
 */
interface ToolchainEnvMap {
  [key: string]: ToolchainEnv;
}

// List of compile environments
let gToolchainEnvMap: ToolchainEnvMap = {};

export {Env, ToolchainEnv, gToolchainEnvMap};
