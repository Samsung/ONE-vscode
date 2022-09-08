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

import {Device} from '../../Execute/Device';

suite('Device', function() {
  suite('#Device', function() {
    test('Basic constructor', function() {
      const deviceName: string = 'testDevice';
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new DeviceSpec(hw, sw, undefined);
      const testDevice = new Device(deviceName, testSpec);
      assert.isObject<Device>(testDevice);
      assert.strictEqual(testDevice.spec, testSpec);
      assert.strictEqual(testDevice.name, deviceName);
    });
    test('NEG: Empty name basic device create', function() {
      const deviceName: string = '';
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new DeviceSpec(hw, sw, undefined);
      try {
        new Device(deviceName, testSpec);
      } catch (err: any) {
        assert.strictEqual(err.message, 'empty name device cannot be created.');
      }
    });
  });

  suite('#TizenTVDevice', function() {
    test('Tizen constructor', function() {
      const deviceName: string = '127.0.0.1:26101';
      const hw: string = 'armv7l';
      const sw: string = 'Tizen 7.0.0';
      const testSpec = new TizenDeviceSpec(hw, sw);
      const tizenTV = new Device(deviceName, testSpec);
      assert.isObject<Device>(tizenTV);
      assert.strictEqual(tizenTV.spec, testSpec);
      assert.strictEqual(tizenTV.name, deviceName);
    });
    test('NEG: Empty name tizen device create', function() {
      const deviceName: string = '';
      const hw: string = 'armv7l';
      const sw: string = 'Tizen 7.0.0';
      const testSpec = new TizenDeviceSpec(hw, sw);
      try {
        new Device(deviceName, testSpec);
      } catch (err: any) {
        assert.strictEqual(err.message, 'empty name device cannot be created.');
      }
    });
  });

  suite('#HostPCDevice', function() {
    test('x86 PC constructor', function() {
      const deviceName: string = 'hostPC-test-DeskTop';
      const hw: string = 'x86_64';
      const sw: string = 'Ubuntu 18';
      const testSpec = new HostPCSpec(hw, sw);
      const hostPC = new Device(deviceName, testSpec);
      assert.isObject<Device>(hostPC);
      assert.strictEqual(hostPC.spec, testSpec);
      assert.strictEqual(hostPC.name, deviceName);
    });
    test('NEG: Empty name x86 PC device create', function() {
      const deviceName: string = '';
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new HostPCSpec(hw, sw);
      try {
        new Device(deviceName, testSpec);
      } catch (err: any) {
        assert.strictEqual(err.message, 'empty name device cannot be created.');
      }
    });
  });
});
