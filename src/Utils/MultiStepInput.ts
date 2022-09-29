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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/*
This file refers to
https://github.com/microsoft/vscode-extension-samples/blob/2556c82cb333cf65d372bd01ac30c35ea1898a0e/quickinput-sample/src/multiStepInput.ts#L131-L306
*/
import {Disposable, QuickInput, QuickInputButton, QuickInputButtons, QuickPickItem, window} from 'vscode';

/* istanbul ignore next */
class InputFlowAction {
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
  static resume = new InputFlowAction();
}

type InputStep = (input: MultiStepInput) => Thenable<InputStep|void>;

interface QuickPickParameters<T extends QuickPickItem> {
  title: string;
  step: number;
  totalSteps: number;
  items: T[];
  activeItem?: T;
  placeholder: string;
  buttons?: QuickInputButton[];
  shouldResume: () => Thenable<boolean>;
}

interface InputBoxParameters {
  title: string;
  step: number;
  totalSteps: number;
  value: string;
  prompt: string;
  password?: boolean;
  validate: (value: string) => Promise<string|undefined>;
  buttons?: QuickInputButton[];
  shouldResume: () => Thenable<boolean>;
}

/* istanbul ignore next */
class MultiStepInput {
  // eslint-disable-next-line no-unused-vars
  static async run<T>(start: InputStep) {
    const input = new MultiStepInput();
    return input.stepThrough(start);
  }

  // eslint-disable-next-line no-unused-vars
  static async runSteps<T>(steps: InputStep[]) {
    if (steps.length === 0) {
      throw new Error('not enough steps');
    }
    const input = new MultiStepInput();
    input.steps = steps;
    let start = input.steps.pop();
    return input.stepThrough(start!);
  }

  private current?: QuickInput;

  // NOTE(jyoung)
  // When a new quick input is shown in the progress of using MultiStepInput, it is
  // automatically added to this steps variable. To remove unintended quick input,
  // this variable sets to public.
  public steps: InputStep[] = [];

  // eslint-disable-next-line no-unused-vars
  private async stepThrough<T>(start: InputStep) {
    let step: InputStep|void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.resume) {
          step = this.steps.pop();
        } else if (err === InputFlowAction.cancel) {
          step = undefined;
        } else {
          throw err;
        }
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

  async showQuickPick<T extends QuickPickItem, P extends QuickPickParameters<T>>(
      {title, step, totalSteps, items, activeItem, placeholder, buttons, shouldResume}: P) {
    const disposables: Disposable[] = [];
    try {
      return await new Promise<T|(P extends {buttons: (infer I)[]} ? I : never)>(
          (resolve, reject) => {
            const input = window.createQuickPick<T>();
            input.title = title;
            input.step = step;
            input.totalSteps = totalSteps;
            input.placeholder = placeholder;
            input.items = items;
            if (activeItem) {
              input.activeItems = [activeItem];
            }
            input.buttons =
                [...(this.steps.length > 1 ? [QuickInputButtons.Back] : []), ...(buttons || [])];
            disposables.push(
                input.onDidTriggerButton(item => {
                  if (item === QuickInputButtons.Back) {
                    reject(InputFlowAction.back);
                  } else {
                    resolve(<any>item);
                  }
                }),
                input.onDidChangeSelection(items => resolve(items[0])), input.onDidHide(() => {
                  (async () => {
                    reject(
                        shouldResume && await shouldResume() ? InputFlowAction.resume :
                                                               InputFlowAction.cancel);
                  })().catch(reject);
                }),
                input.onDidHide(item => {
                  reject(<any>item);
                }));
            if (this.current) {
              this.current.dispose();
            }
            this.current = input;
            this.current.show();
          });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }

  async showInputBox<P extends InputBoxParameters>(
      {title, step, totalSteps, value, prompt, password, validate, buttons, shouldResume}: P) {
    const disposables: Disposable[] = [];
    try {
      return await new Promise<string|(P extends {buttons: (infer I)[]} ? I : never)>(
          (resolve, reject) => {
            const input = window.createInputBox();
            input.title = title;
            input.step = step;
            input.totalSteps = totalSteps;
            input.value = value || '';
            input.prompt = prompt;
            if (password) {
              input.password = password;
            }
            input.buttons =
                [...(this.steps.length > 1 ? [QuickInputButtons.Back] : []), ...(buttons || [])];
            let validating = validate('');
            disposables.push(
                input.onDidTriggerButton(item => {
                  if (item === QuickInputButtons.Back) {
                    reject(InputFlowAction.back);
                  } else {
                    resolve(<any>item);
                  }
                }),
                input.onDidAccept(async () => {
                  const value = input.value;
                  input.enabled = false;
                  input.busy = true;
                  if (!(await validate(value))) {
                    resolve(value);
                  }
                  input.enabled = true;
                  input.busy = false;
                }),
                input.onDidChangeValue(async text => {
                  const current = validate(text);
                  validating = current;
                  const validationMessage = await current;
                  if (current === validating) {
                    input.validationMessage = validationMessage;
                  }
                }),
                input.onDidHide(() => {
                  (async () => {
                    reject(
                        shouldResume && await shouldResume() ? InputFlowAction.resume :
                                                               InputFlowAction.cancel);
                  })().catch(reject);
                }));
            if (this.current) {
              this.current.dispose();
            }
            this.current = input;
            this.current.show();
          });
    } finally {
      disposables.forEach(d => d.dispose());
    }
  }
}

export {MultiStepInput, InputStep};
