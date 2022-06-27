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

import {assert, should} from 'chai';

import {BridgeSpec, DeviceSpec, HostPCSpec, sdbSpec, TizenDeviceSpec} from '../../Backend/Spec';

suite('Spec', function() {
  suite('DeviceSpec', function() {
    suite('#contructor()', function() {
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new DeviceSpec(hw, sw, undefined);
      assert.isObject<DeviceSpec>(testSpec);
      assert.strictEqual(testSpec.hw, hw);
      assert.strictEqual(testSpec.sw, sw);
      assert.strictEqual(testSpec.bridge, undefined);
    });
    suite('#satisfied()', function() {
      const executorSpec = new DeviceSpec('arm', 'Tizen', undefined);
      const dummySpec1 = new TizenDeviceSpec('armv7l', 'Tizen 7.0.0 (Tizen7/TV)');
      const dummySpec2 = new HostPCSpec('x86_64', 'Ubuntu 20.04.4 LTS');
      assert.isTrue(executorSpec.satisfied(dummySpec1));
      assert.isFalse(executorSpec.satisfied(dummySpec2));
    });
  });
  suite('TizenDeviceSpec', function() {
    suite('#contructor()', function() {
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new TizenDeviceSpec(hw, sw);
      assert.isObject<TizenDeviceSpec>(testSpec);
      assert.strictEqual(testSpec.hw, hw);
      assert.strictEqual(testSpec.sw, sw);
      assert.strictEqual(testSpec.bridge, sdbSpec);
    });
  });
  suite('HostPCSpec', function() {
    suite('#contructor()', function() {
      const hw: string = 'TestHW';
      const sw: string = 'TestOS';
      const testSpec = new HostPCSpec(hw, sw);
      assert.isObject<HostPCSpec>(testSpec);
      assert.strictEqual(testSpec.hw, hw);
      assert.strictEqual(testSpec.sw, sw);
      assert.strictEqual(testSpec.bridge, undefined);
    });
  });
  suite('BridgeSpec', function() {
    suite('#constructor()', function() {
      const dummyDeviceList = 'testDeiveList';
      const dummyShell = 'bash';
      const testBridgeSpec = new BridgeSpec('test', dummyDeviceList, dummyShell);
      assert.isObject<BridgeSpec>(testBridgeSpec);
      assert.strictEqual(testBridgeSpec.name, 'test');
      assert.strictEqual(testBridgeSpec.deviceListCmd.str(), dummyDeviceList);
      assert.strictEqual(testBridgeSpec.shellCmd.str(), dummyShell);
    });
  });
  suite('sdbSpec', function() {
    assert.isObject<BridgeSpec>(sdbSpec);
    assert.strictEqual(sdbSpec.name, 'sdb');
    assert.strictEqual(
        sdbSpec.deviceListCmd.str(),
        'sdb devices | grep -v devices | grep device | awk \'{print $1}\'');
    assert.strictEqual(sdbSpec.shellCmd.str(), 'sdb shell');
  });
});
