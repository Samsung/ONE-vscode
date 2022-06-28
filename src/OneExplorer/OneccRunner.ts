import * as path from 'path';
import * as vscode from 'vscode';
import {EventEmitter} from 'events';
import {ToolArgs} from '../Project/ToolArgs';
import {SuccessResult, ToolRunner} from '../Project/ToolRunner';

export class OneccRunner extends EventEmitter {
  private startRunningOnecc: string = 'START_RUNNING_ONECC';
  private finishedRunningOnecc: string = 'FINISHED_RUNNING_ONECC';

  private toolRunner: ToolRunner;

  constructor(private cfgUri: vscode.Uri) {
    super();
    this.toolRunner = new ToolRunner();
  }

  /**
   * Function called when one.explorer.runCfg is called (when user clicks 'Run' on cfg file).
   */
  public run() {
    this.on(this.startRunningOnecc, this.onStartRunningOnecc);
    this.on(this.finishedRunningOnecc, this.onFinishedRunningOnecc);

    const toolArgs = new ToolArgs('-C', this.cfgUri.fsPath);
    const cwd = path.dirname(this.cfgUri.fsPath);
    let oneccPath = this.toolRunner.getOneccPath();
    if (oneccPath === undefined) {
      throw new Error('Cannot find installed onecc');
    }

    const runnerPromise = this.toolRunner.getRunner('onecc', oneccPath, toolArgs, cwd);
    this.emit(this.startRunningOnecc, runnerPromise);
  }

  private onStartRunningOnecc(runnerPromise: Promise<SuccessResult>) {
    const progressOption: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `Running: 'onecc --config ${this.cfgUri.fsPath}'`,
      cancellable: true
    };

    // Show progress UI
    vscode.window.withProgress(progressOption, (progress, token) => {
      token.onCancellationRequested(() => {
        this.toolRunner.kill();
      });

      const p = new Promise<void>((resolve, reject) => {
        runnerPromise
            .then((value: SuccessResult) => {
              resolve();
              this.emit(this.finishedRunningOnecc, value);
            })
            .catch(value => {
              vscode.window.showErrorMessage(
                  `Error occured while running: 'onecc --config ${this.cfgUri.fsPath}'`);
              reject();
            });
      });

      return p;
    });
  }

  private onFinishedRunningOnecc(val: SuccessResult) {
    if (val.exitCode !== undefined && val.exitCode === 0) {
      vscode.window.showInformationMessage(`Successfully completed.`);
    } else if (val.intentionallyKilled !== undefined && val.intentionallyKilled === true) {
      vscode.window.showInformationMessage(`The job was cancelled.`);
    } else {
      throw Error('unexpected value onFinishedRunningOnecc');
    }
  }
}
