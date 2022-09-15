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

import * as vscode from 'vscode';

import {Toolchain} from '../Backend/Toolchain';
import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';
import {InputStep, MultiStepInput} from '../Utils/MultiStepInput';

/* istanbul ignore next */
async function shouldResume() {
  // Could show a notification with the option to resume.
  return new Promise<boolean>(
      () => {
          // noop
      });
}

class InnerButton implements vscode.QuickInputButton {
  constructor(public iconPath: vscode.ThemeIcon, public tooltip: string) {}
}

enum InstallQuickInputStep {
  unset = 0,
  pickBackend = 1,
  pickType = 2,
  pickVersion = 3
}

interface InstallQuickInputState {
  selectedItem: vscode.QuickPickItem|InnerButton;
  current: InstallQuickInputStep;
}

class InstallQuickInput {
  readonly logtag = 'InstallQuickInput';
  readonly title: string = 'Choose Compiler Toolchain';

  toolchainEnv: ToolchainEnv|undefined = undefined;
  toolchainType: string|undefined = undefined;
  toolchain: Toolchain|undefined = undefined;
  version: string|undefined = undefined;
  error: string|undefined = undefined;

  isUpdateBackend: boolean = false;

  public getToolchainEnv(): ToolchainEnv {
    if (this.error !== undefined || this.toolchainEnv === undefined) {
      throw new Error('wrong calling');
    }
    return this.toolchainEnv;
  }

  public getToolchainType(): string {
    if (this.error !== undefined || this.toolchainType === undefined) {
      throw new Error('wrong calling');
    }
    return this.toolchainType;
  }

  public getToolchain(): Toolchain {
    if (this.error !== undefined || this.toolchain === undefined) {
      throw new Error('wrong calling');
    }
    return this.toolchain;
  }

  public getVersion(): string {
    if (this.error !== undefined || this.version === undefined) {
      throw new Error('wrong calling');
    }
    return this.version;
  }

  public getError(): string|undefined {
    return this.error;
  }

  public getQuickPickItems(items: string[]): vscode.QuickPickItem[] {
    return items.map(label => ({label}));
  }

  public getAllToolchainEnvNames(): string[] {
    return Object.keys(gToolchainEnvMap);
  }

  public getToolchainEnvFromGlobal(key: string): ToolchainEnv {
    return gToolchainEnvMap[key];
  }

  public getToolchainTypes(): string[] {
    return this.getToolchainEnv().getToolchainTypes();
  }

  public getVersions(toolchains: Toolchain[]): string[] {
    return toolchains.map(
        (value) => value.info.version !== undefined ? value.info.version.str() : '');
  }

  public changeCurrentStepBefore(stepName: string, state: InstallQuickInputState) {
    switch (stepName) {
      case this.pickBackend.name: {
        state.current = InstallQuickInputStep.unset;
        break;
      }
      case this.pickType.name: {
        state.current = InstallQuickInputStep.pickBackend;
        break;
      }
      case this.pickVersion.name: {
        state.current = InstallQuickInputStep.pickType;
        break;
      }
      default: {
        throw Error('wrong stepName: ' + stepName);
      }
    }
  }

  public changeCurrentStepAfter(stepName: string, state: InstallQuickInputState) {
    switch (stepName) {
      case this.pickBackend.name: {
        state.current = InstallQuickInputStep.pickBackend;
        break;
      }
      case this.pickType.name: {
        state.current = InstallQuickInputStep.pickType;
        break;
      }
      case this.pickVersion.name: {
        state.current = InstallQuickInputStep.pickVersion;
        break;
      }
      default: {
        throw Error('wrong stepName: ' + stepName);
      }
    }
  }

  /* istanbul ignore next */
  public async pickBackend(input: MultiStepInput, state: Partial<InstallQuickInputState>) {
    this.changeCurrentStepBefore(this.pickBackend.name, state as InstallQuickInputState);

    const backendGroups = this.getQuickPickItems(this.getAllToolchainEnvNames());
    state.selectedItem = await input.showQuickPick({
      title: this.title,
      step: InstallQuickInputStep.pickBackend,
      totalSteps: InstallQuickInputStep.pickVersion,
      placeholder: 'Pick toolchain backend',
      items: backendGroups,
      shouldResume: shouldResume
    });
    this.toolchainEnv = this.getToolchainEnvFromGlobal(state.selectedItem.label);

    this.changeCurrentStepAfter(this.pickBackend.name, state as InstallQuickInputState);
  }

  /* istanbul ignore next */
  public async pickType(input: MultiStepInput, state: Partial<InstallQuickInputState>) {
    this.changeCurrentStepBefore(this.pickType.name, state as InstallQuickInputState);

    if (this.toolchainEnv === undefined) {
      this.error = 'Backend is undefined';
      throw Error('Backend is undefined');
    }

    const types = this.getToolchainTypes();
    if (types.length === 0) {
      this.error = 'Backend is undefined';
      throw Error('Backend is undefined');
    }

    if (types.length === 1) {
      this.toolchainType = types[0];
      state.selectedItem = undefined;
    } else {
      const typeGroups = this.getQuickPickItems(types);
      state.selectedItem = await input.showQuickPick({
        title: this.title,
        step: InstallQuickInputStep.pickType,
        totalSteps: InstallQuickInputStep.pickVersion,
        placeholder: 'Pick toolchain type',
        items: typeGroups,
        shouldResume: shouldResume
      });
      this.toolchainType = state.selectedItem.label;
    }

    this.changeCurrentStepAfter(this.pickType.name, state as InstallQuickInputState);
  }

  /* istanbul ignore next */
  public async pickVersion(input: MultiStepInput, state: Partial<InstallQuickInputState>) {
    this.changeCurrentStepBefore(this.pickVersion.name, state as InstallQuickInputState);

    if (this.toolchainEnv === undefined || this.toolchainType === undefined) {
      this.error = 'toolchainenv is undefined.';
      throw Error('toolchainenv is undefined.');
    }

    let toolchainEnv = this.getToolchainEnv();

    // TODO(jyoung): Support page UI
    let toolchains: Toolchain[];
    try {
      toolchains = this.toolchainEnv.listAvailable(this.toolchainType, 0, 10);
    } catch (err) {
      const answer = await vscode.window.showWarningMessage(
          'Prerequisites has not been set yet. Do you want to set it up now?', 'Yes', 'No');

      let finished = true;
      if (answer === 'Yes') {
        if (await toolchainEnv.prerequisites()) {
          finished = false;
        }
      }

      if (finished) {
        // Let's end this step
        this.changeCurrentStepAfter(this.pickVersion.name, state as InstallQuickInputState);
      }
      return;
    }

    const versions = this.getVersions(toolchains);
    const versionGroups = this.getQuickPickItems(versions);
    const updateButton = new InnerButton(new vscode.ThemeIcon('refresh'), 'Update version list');

    let placeholder = 'Pick toolchain version';
    if (versions.length === 0) {
      placeholder = 'No available toolchain version';
    }

    state.selectedItem = await input.showQuickPick({
      title: this.title,
      step: InstallQuickInputStep.pickVersion,
      totalSteps: InstallQuickInputStep.pickVersion,
      placeholder: placeholder,
      items: versionGroups,
      buttons: [updateButton],
      shouldResume: shouldResume
    });

    if (state.selectedItem instanceof InnerButton) {
      Logger.info(this.logtag, 'press the refresh button');
      this.isUpdateBackend = true;
      return;
    }

    this.version = state.selectedItem.label;
    this.toolchain = toolchains[versions.indexOf(this.version)];

    this.changeCurrentStepAfter(this.pickVersion.name, state as InstallQuickInputState);
  }

  /* istanbul ignore next */
  public async updateBackend(input: MultiStepInput, _state: Partial<InstallQuickInputState>) {
    if (this.toolchainEnv === undefined || this.toolchainType === undefined) {
      this.error = 'toolchainenv is undefined.';
      throw Error('toolchainenv is undefined.');
    }

    await this.toolchainEnv.prerequisites();

    // NOTE(jyoung)
    // Prerequisites request shows the password quick input and this input is
    // automatically added to MultiStepInput's steps. If the user clicks
    // 'back' button on quick input, the previous step is shown, and the password
    // input is show at this time, so it must be removed directly from the steps.
    input.steps.pop();

    this.isUpdateBackend = false;
  }

  public getMultiSteps(state: Partial<InstallQuickInputState>): InputStep[] {
    if (state.current === undefined || state.current === InstallQuickInputStep.pickVersion) {
      throw Error('state is wrong: ' + String(state.current));
    }

    // pickBackend -> pickType -> pickVersion
    const steps: InputStep[] = [
      (input => this.pickBackend(input, state)), (input => this.pickType(input, state)),
      (input => this.pickVersion(input, state))
    ];
    // stepPickBackend = steps.slice(0, 1);
    // stepPickType = steps.slice(0, 2);
    // stepPickVersion = steps.slice(0, 3);
    return steps.slice(0, state.current + 1);
  }

  /* istanbul ignore next */
  public async collectInputs() {
    const state = {selectedItem: undefined, current: InstallQuickInputStep.unset} as
        Partial<InstallQuickInputState>;
    while (state.current! < InstallQuickInputStep.pickVersion) {
      await MultiStepInput.runSteps(this.getMultiSteps(state));
      if (this.isUpdateBackend) {
        await MultiStepInput.run(input => this.updateBackend(input, state));
      }
    }
  }
}

/* istanbul ignore next */
async function showInstallQuickInput(): Promise<[ToolchainEnv, Toolchain]> {
  const quickInput = new InstallQuickInput();
  await quickInput.collectInputs();

  const error = quickInput.getError();
  if (error !== undefined) {
    vscode.window.showErrorMessage(error);
    throw Error(error);
  }

  return [quickInput.getToolchainEnv(), quickInput.getToolchain()];
}

export {
  InstallQuickInput,
  InstallQuickInputStep,
  InstallQuickInputState,
  showInstallQuickInput,
  InnerButton
};
