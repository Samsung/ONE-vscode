/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as vscode from 'vscode';

import {Builder} from './Builder';
import {BuilderListener} from './BuilderListener';
import {Job} from './Job';
import {JobBase} from './JobBase';
import {JobCodegen} from './JobCodegen';
import {JobImportBCQ} from './JobImportBCQ';
import {JobImportONNX} from './JobImportONNX';
import {JobImportTF} from './JobImportTF';
import {JobImportTFLite} from './JobImportTFLite';
import {JobOptimize, OptimizeId} from './JobOptimize';
import {JobPack} from './JobPack';
import {JobQuantize} from './JobQuantize';
import {acceptJob, JobVisitor} from './JobVisitor';

enum TreeItemType {
  tItemUndefined = 0,
  tItemJob = 1,
  tItemAttr = 2,
  tItemOptimization = 3,
  tItemOptOption = 4,
}

class TreeItemCommand implements vscode.Command {
  title: string;
  command: string;
  arguments: any[];

  constructor(title: string, command: string) {
    this.title = title;
    this.command = command;
    this.arguments = [];
  }
}

/**
 * @note TreeItem has 2/3 levels where first is for Job
 *       and the second is for the Job attributes.
 *       For Optimization, third is the option.
 */
class TreeItem extends vscode.TreeItem {
  job: Job|undefined;
  optId: OptimizeId|undefined;
  children: TreeItem[];

  constructor(
      label: string, type: TreeItemType, job: Job|undefined = undefined,
      optId: OptimizeId|undefined = undefined) {
    let expandable = (type === TreeItemType.tItemJob || type === TreeItemType.tItemOptimization);
    let state = expandable ? vscode.TreeItemCollapsibleState.Expanded :
                             vscode.TreeItemCollapsibleState.None;
    super(label, state);

    this.job = job;
    this.optId = optId;
    this.children = [];

    if (optId) {
      this.contextValue = 'checkbox';
      this.command = new TreeItemCommand('toggle', 'onevscode.viewProject.editEntry');
      if (this.command.arguments) {
        this.command.arguments.push(this);
      }
    }
  }

  addAttr(item: TreeItem) {
    this.children.push(item);
  }
}

class Resource {
  iconJob: vscode.ThemeIcon;
  iconTool: vscode.ThemeIcon;
  iconSrc: vscode.ThemeIcon;  // input source file
  iconDst: vscode.ThemeIcon;  // output destination file
  iconInp: vscode.ThemeIcon;  // something input
  iconOut: vscode.ThemeIcon;  // something output
  iconOpt: vscode.ThemeIcon;  // option
  iconChk: vscode.ThemeIcon;  // checked
  iconUck: vscode.ThemeIcon;  // unchecked

  constructor() {
    this.iconJob = new vscode.ThemeIcon('symbol-function');
    this.iconTool = new vscode.ThemeIcon('tools');
    this.iconSrc = new vscode.ThemeIcon('log-in');
    this.iconDst = new vscode.ThemeIcon('log-out');
    this.iconInp = new vscode.ThemeIcon('debug-step-into');
    this.iconOut = new vscode.ThemeIcon('debug-step-out');
    this.iconOpt = new vscode.ThemeIcon('extensions');
    this.iconChk = new vscode.ThemeIcon('pass');
    this.iconUck = new vscode.ThemeIcon('circle-large-outline');
  }
}

class AddJobAttributes extends JobVisitor {
  res: Resource;
  item: TreeItem;

  constructor(item: TreeItem, res: Resource) {
    super();
    this.res = res;
    this.item = item;
  }

  private handleBase(job: JobBase): void {
    let ti = new TreeItem('Source: ' + job.inputPath, TreeItemType.tItemAttr);
    ti.iconPath = this.res.iconSrc;
    this.item.addAttr(ti);

    ti = new TreeItem('Target: ' + job.outputPath, TreeItemType.tItemAttr);
    ti.iconPath = this.res.iconDst;
    this.item.addAttr(ti);
  }

  public visitCodegen(job: JobCodegen): any {
    this.handleBase(job);
  }

  public visitImportBCQ(job: JobImportBCQ): any {
    this.handleBase(job);
  }

  public visitImportONNX(job: JobImportONNX): any {
    this.handleBase(job);

    if (job.inputArrays) {
      let ti = new TreeItem('Inputs: ' + job.inputArrays, TreeItemType.tItemAttr);
      ti.iconPath = this.res.iconInp;
      this.item.addAttr(ti);
    }
    if (job.outputArrays) {
      let ti = new TreeItem('Outputs: ' + job.outputArrays, TreeItemType.tItemAttr);
      ti.iconPath = this.res.iconOut;
      this.item.addAttr(ti);
    }
    if (job.saveIntermediate) {
      let ti = new TreeItem('saveIntermediate', TreeItemType.tItemAttr);
      this.item.addAttr(ti);
    }
  }
  public visitImportTF(job: JobImportTF): any {
    this.handleBase(job);
  }

  public visitImportTFLite(job: JobImportTFLite): any {
    this.handleBase(job);
  }

  public visitOptimize(job: JobOptimize): any {
    this.handleBase(job);

    let tiOptions = new TreeItem('options', TreeItemType.tItemOptimization);
    tiOptions.iconPath = this.res.iconOpt;
    this.item.addAttr(tiOptions);

    let ti = new TreeItem(
        'convert_nchw_to_nhwc', TreeItemType.tItemOptOption, job, OptimizeId.oConvertNchwToNhwc);
    ti.iconPath = job.oConvertNchwToNhwc ? this.res.iconChk : this.res.iconUck;
    tiOptions.addAttr(ti);
  }

  public visitPack(job: JobPack): any {
    this.handleBase(job);
  }

  public visitQuantize(job: JobQuantize): any {
    this.handleBase(job);
  }
}

class BuilderTreeDataProvider implements vscode.TreeDataProvider<TreeItem>, BuilderListener {
  treeRefreshEventEmitter: vscode.EventEmitter<TreeItem|undefined|null|void> =
      new vscode.EventEmitter<TreeItem|undefined|null|void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem|undefined|null|void> =
      this.treeRefreshEventEmitter.event;

  builder: Builder;
  jobs: TreeItem[];
  res: Resource;

  constructor(builder: Builder) {
    this.builder = builder;
    this.jobs = [new TreeItem('(Empty)', TreeItemType.tItemUndefined)];
    this.res = new Resource();

    this.builder.addListener(this);
  }

  // TreeDataProvider override
  getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
    return element;
  }

  // TreeDataProvider override
  getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      // asking for root, return jobs
      return this.jobs;
    }
    return element.children;
  }

  // BuilderListener override
  builderInit(): void {
    this.jobs = [];
  }

  // BuilderListener override
  builderFinish(): void {
    this.jobs = [];

    let workJobs = this.builder.workFlow.jobs;

    workJobs.forEach((job) => {
      this.addJob(job);
    });

    if (this.treeRefreshEventEmitter) {
      this.treeRefreshEventEmitter.fire();
    }
  }

  addJob(job: Job): void {
    let item = new TreeItem(job.name, TreeItemType.tItemJob, job);
    item.iconPath = this.res.iconJob;
    this.jobs.push(item);
    console.log('TreeItem: ', job.name);

    let tool = new TreeItem(job.tool, TreeItemType.tItemAttr);
    tool.iconPath = this.res.iconTool;
    item.addAttr(tool);

    let adder = new AddJobAttributes(item, this.res);
    acceptJob(job, adder);
  }

  public onClickTreeItem(item: TreeItem): void {
    console.log('!!!! click', item);
    if (item && item.job && item.optId) {
      let jobOptimize = item.job as JobOptimize;
      jobOptimize.oConvertNchwToNhwc = !jobOptimize.oConvertNchwToNhwc;
      item.iconPath = jobOptimize.oConvertNchwToNhwc ? this.res.iconChk : this.res.iconUck;

      console.log(
          '!!! ' + item.job.name + ': ' + item.optId + ': ' + jobOptimize.oConvertNchwToNhwc);

      if (this.treeRefreshEventEmitter) {
        this.treeRefreshEventEmitter.fire(item);
      }
    }
  }
}

export class ViewProject {
  provider: BuilderTreeDataProvider;

  constructor(context: vscode.ExtensionContext, builder: Builder) {
    this.provider = new BuilderTreeDataProvider(builder);

    const disposableViewProject =
        vscode.window.createTreeView('onevscode.viewProject', {treeDataProvider: this.provider});

    context.subscriptions.push(disposableViewProject);

    //
    vscode.commands.registerCommand('onevscode.viewProject.editEntry', (args: TreeItem) => {
      this.provider.onClickTreeItem(args);
    });
  }
}
