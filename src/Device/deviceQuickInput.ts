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
import {globalDeviceTypeMap} from '../Backend/Backend';

import {MultiStepInput} from '../Utils/external/MultiStepInput';
import {Connection, LocalConnect} from './Device';
import {DeviceType} from './DeviceType';


export async function runDeviceQuickInput(context: vscode.ExtensionContext) {
  interface State {
    deviceType: DeviceType;
    connectionType: Connection;
    name: string;
    selectedItem: vscode.QuickPickItem;
    textInputItem: string;
  }

  async function collectInputs() {
    const state = {} as Partial<State>;
    await MultiStepInput.run(input => pickDeviceType(input, state));
    return state as State;
  }

  async function pickDeviceType(input: MultiStepInput, state: Partial<State>) {
    const deviceTypes: vscode.QuickPickItem[] =
        Object.keys(globalDeviceTypeMap).map(label => ({label}));
    state.selectedItem = await input.showQuickPick({
      title: 'Connect Target Device',
      step: 1,
      totalSteps: 3,
      placeholder: 'Select a DeviceType',
      items: deviceTypes,
      shouldResume: shouldResume
    });
    state.deviceType = globalDeviceTypeMap[state.selectedItem.label];
    return (input: MultiStepInput) => selectConnectType(input, state);
  }

  async function selectConnectType(input: MultiStepInput, state: Partial<State>) {
    const connectType: vscode.QuickPickItem[] = ['local', 'remote'].map(label => ({label}));
    state.selectedItem = await input.showQuickPick({
      title: 'Connect Target Device',
      step: 2,
      totalSteps: 3,
      placeholder: 'Select location where Device connect',
      items: connectType,
      shouldResume: shouldResume
    });
    switch (state.selectedItem.label) {
      case 'local':
        state.connectionType = new LocalConnect();
        return (input: MultiStepInput) => showConnectableDevice(input, state);
        break;
      case 'remote':
        throw Error('NYI about remote connection host');
        break;
      default:
        throw Error('Undefined QuickPick Item');
    }
    // continue on phase
    // 1-2 on #580
  }

  async function showConnectableDevice(input: MultiStepInput, state: Partial<State>) {
    let registerType = state.connectionType;
    let deviceType = state.deviceType;
    if (registerType && deviceType) {
      const connectType: vscode.QuickPickItem[] =
          deviceType.getConnectableDevices(registerType).map(label => ({label}));
      state.selectedItem = await input.showQuickPick({
        title: 'Connect Target Device',
        step: 3,
        totalSteps: 3,
        placeholder: 'Select Device to connect',
        items: connectType,
        shouldResume: shouldResume
      });
    } else {
      throw Error('Undefined State Variable Error.');
    }
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }
  const state = await collectInputs();
  console.log(state);
  console.log('NYI: Save Device on local configuration!');
}