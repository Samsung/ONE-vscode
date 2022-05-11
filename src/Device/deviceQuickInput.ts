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

import {exec} from 'child_process';
import {appendFileSync} from 'fs';
import * as vscode from 'vscode';

import {MultiStepInput} from '../Utils/MultiStepInput';

import {DeviceType, globalDeviceTypeMap, LocalRegister, RegisterType, RemoteRegister} from './Device';

export async function runDeviceQuickInput(context: vscode.ExtensionContext) {
  interface State {
    deviceType: DeviceType;
    connectionType: RegisterType;
    name: string;
    selectedItem: vscode.QuickPickItem;
    textInputItem: string;
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
    // continue on phase
    // 1-1 on #580
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
        state.connectionType = new LocalRegister();
        // Move to showConnectableDevice
        break;
      case 'remote':
        state.connectionType = new RemoteRegister();
        // Move to typeRemoteIpInfo or some other for remote connection.
        break;
      default:
        throw Error('Undefined QuickPick Item');
    }
    // continue on phase
    // 1-2 on #580
  }

  async function typeRemoteIpInfo(input: MultiStepInput, state: Partial<State>) {
    state.textInputItem = await input.showInputBox({
      title: 'Connect Target Device',
      step: 2,
      totalSteps: 3,
      value: '',
      prompt: 'Enter IP information on remote.',
      validate: validateIpinfo,
      shouldResume: shouldResume
    });
    // 1-2 on #580, Ip information
  }

  async function typeRemoteIdInfo(input: MultiStepInput, state: Partial<State>) {
    state.textInputItem = await input.showInputBox({
      title: 'Connect Target Device',
      step: 2,
      totalSteps: 3,
      value: '',
      prompt: 'Enter ID on remote ssh connection.',
      validate: validateIpinfo,
      shouldResume: shouldResume,
    });
    // 1-2 on #580, ID information
    // also, need to add port and password.
  }

  async function showConnectableDevice(input: MultiStepInput, state: Partial<State>) {
    let registerType = state.connectionType;
    let deviceType = state.deviceType;
    if (registerType && deviceType) {
      const connectType: vscode.QuickPickItem[] =
          deviceType.getConnectableList(registerType).map(label => ({label}));
      state.selectedItem = await input.showQuickPick({
        title: 'Connect Target Device',
        step: 3,
        totalSteps: 3,
        placeholder: 'Select Device to connect',
        items: connectType,
        shouldResume: shouldResume
      });
    } else {
    }
  }


  async function validateIpinfo(ip: string) {
    const re = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return re.test(ip);
  }

  function shouldResume() {
    // Could show a notification with the option to resume.
    return new Promise<boolean>(
        (resolve, reject) => {
            // noop
        });
  }
}