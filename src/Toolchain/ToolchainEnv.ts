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

import { strict as assert } from "assert";
import * as path from "path";

import { Compiler } from "../Backend/Compiler";
import { Toolchain } from "../Backend/Toolchain";
import { BuilderJob } from "../Job/BuilderJob";
import { Job } from "../Job/Job";
import { WorkFlow } from "../Job/WorkFlow";
import { Logger } from "../Utils/Logger";
import { showPasswordQuickInput } from "../View/PasswordQuickInput";

import { JobConfig } from "./JobConfig";
import { JobInstall } from "./JobInstall";
import { JobPrerequisites } from "./JobPrerequisites";
import { JobUninstall } from "./JobUninstall";

class Env implements BuilderJob {
  logTag = "Env";
  workFlow: WorkFlow; // our build WorkFlow
  currentWorkspace: string = "";
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
    Logger.info(
      this.logTag,
      "Done building WorkFlow on Env:",
      this.workFlow.jobs
    );
    this.isPrepared = true;
  }

  public build() {
    if (this.isPrepared !== true) {
      throw Error("Env is not yet prepared");
    }

    const rootJobs = this.workFlow.jobs.filter((j) => j.root === true);
    if (rootJobs.length > 0) {
      Logger.info(this.logTag, "Showing password prompt");
      const helpMsg: string = "Enter password for sudo authentication";
      /* istanbul ignore next */
      showPasswordQuickInput(helpMsg).then((password) => {
        if (password === undefined) {
          Logger.info(this.logTag, "Password dialog canceled");
          return;
        }
        Logger.info(this.logTag, "Got password response");
        process.env.userp = password;
        this.workFlow.start();
      });
    } else {
      this.workFlow.start();
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

  public getToolchainTypes(): string[] {
    return this.compiler.getToolchainTypes();
  }

  public listAvailable(
    type: string,
    start: number,
    count: number
  ): Toolchain[] {
    return this.compiler.getToolchains(type, start, count);
  }

  public listInstalled(): Toolchain[] {
    return this.compiler
      .getToolchainTypes()
      .map((type) => this.compiler.getInstalledToolchains(type))
      .reduce((r, a) => {
        return r.concat(a);
      });
  }

  private executeEnv(jobs: Array<Job>) {
    this.clearJobs();
    jobs.forEach((job) => {
      this.addJob(job);
    });
    this.finishAdd();
    this.build();
  }

  public request(jobs: Array<Job>): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      jobs.forEach((job) => {
        job.failureCallback = () => reject();
      });
      jobs[jobs.length - 1].successCallback = () => resolve(true);
      this.executeEnv(jobs);
    });
  }

  public prerequisites(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const jobs: Array<Job> = [];
      const job = new JobPrerequisites(
        this.compiler.prerequisitesForGetToolchains()
      );
      job.successCallback = () => resolve(true);
      // NOTE(jyoung)
      // Even though this job is failed, it still shows the version quick input.
      // The error message will be shown in JobRunner code to user. So here,
      // only the log is output and it goes to the `resolve` so that quick input
      // can be seen normally.
      job.failureCallback = () => resolve(false);
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public install(toolchain: Toolchain): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobInstall(toolchain.tool.install());
      job.successCallback = () => resolve(true);
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public uninstall(toolchain: Toolchain): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobUninstall(toolchain.tool.uninstall());
      job.successCallback = () => resolve(true);
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public run(cfg: string, toolchain: Toolchain): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobConfig(toolchain.run(cfg));
      job.notiTitle = `Running ${toolchain.info.name}`;
      job.workDir = path.dirname(cfg);
      job.successCallback = () => resolve(true);
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public infer(
    toolchain: Toolchain,
    model: string,
    options?: Map<string, string>
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobConfig(toolchain.runInference(model, options));
      job.workDir = path.dirname(model);
      job.successCallback = () => resolve(job.result ? job.result : "");
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public profile(
    toolchain: Toolchain,
    model: string,
    options?: Map<string, string>
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobConfig(toolchain.runProfile(model, options));
      job.workDir = path.dirname(model);
      job.successCallback = () => resolve(true);
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }

  public getModelInfo(
    toolchain: Toolchain,
    model: string,
    type: string
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const jobs: Array<Job> = [];
      const job = new JobConfig(toolchain.runShow(model, type));
      job.workDir = path.dirname(model);
      job.successCallback = () => resolve(job.result ? job.result : "");
      job.failureCallback = () => reject();
      jobs.push(job);
      this.executeEnv(jobs);
    });
  }
}

/**
 * Interface of backend map
 * - Use Obejct class to use the only string key
 */
interface ToolchainEnvMap {
  [key: string]: ToolchainEnv;
}

// List of compile environments
let gToolchainEnvMap: ToolchainEnvMap = {};

export { Env, ToolchainEnv, gToolchainEnvMap };
