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

import {assert} from 'chai';
import {DeviceSpec, HostPCSpec, TizenDeviceSpec} from '../../Backend/Spec';

import {RealDeviceInstance} from '../../Execute/RealDeviceInstance';

suite('RealDeviceInstance', function() {
  suite('RealDeviceInstance', function() {
    suite('#contructor()', function() {
      const deviceName: string = 'testDeviceInstance';
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new DeviceSpec(hw, sw, undefined);
      const testRealDevice = new RealDeviceInstance(deviceName, testSpec);
      assert.isObject<RealDeviceInstance>(testRealDevice);
      assert.strictEqual(testRealDevice.spec, testSpec);
      assert.strictEqual(testRealDevice.name, deviceName);
    });
  });

  suite('TizenRealTVRealDevice', function() {
    suite('#contructor()', function() {
      const deviceName: string = '127.0.0.1:26101';
      const hw: string = 'armv7l';
      const sw: string = 'Tizen 7.0.0';
      const testSpec = new TizenDeviceSpec(hw, sw);
      const tizenTV = new RealDeviceInstance(deviceName, testSpec);
      assert.isObject<RealDeviceInstance>(tizenTV);
      assert.strictEqual(tizenTV.spec, testSpec);
      assert.strictEqual(tizenTV.name, deviceName);
    });
  });

  suite('HostPCRealDevice', function() {
    suite('#constructor()', function() {
      const deviceName: string = 'hostpc-test-DeskTop';
      const hw: string = 'x86_64';
      const sw: string = 'Ubuntu 18';
      const testSpec = new HostPCSpec(hw, sw);
      const hostPC = new RealDeviceInstance(deviceName, testSpec);
      assert.isObject<RealDeviceInstance>(hostPC);
      assert.strictEqual(hostPC.spec, testSpec);
      assert.strictEqual(hostPC.name, deviceName);
    });
  });
});
