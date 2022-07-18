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
import {Executor, ExecutorBase} from '../../Backend/Executor';
import {DeviceSpec} from '../../Backend/Spec';
import {Device} from '../../Execute/Device';
import {ExecutionManager} from '../../Execute/ExecutionManager';

const dummyDeviceList: Device[] = [
  new Device('dummyDevice1', new DeviceSpec('dummySpecHW1', 'dummySpecSW1', undefined)),
  new Device('dummyDevice2', new DeviceSpec('dummySpecHW1', 'dummySpecSW2', undefined)),
  new Device('dummyDevice3', new DeviceSpec('dummySpecHW2', 'dummySpecSW2', undefined))
];

class DummyExecutor1 extends ExecutorBase {
  name(): string {
    return 'dummyExecutor1';
  }
  require(): DeviceSpec {
    return new DeviceSpec('dummySpecHW1', 'dummySpecSW1', undefined);
  }
}

class DummyExecutor2 extends ExecutorBase {
  name(): string {
    return 'dummyExecutor2';
  }
  require(): DeviceSpec {
    return new DeviceSpec('dummySpecHW2', 'dummySpecSW2', undefined);
  }
}

const dummyExecutorList: Executor[] = [new DummyExecutor1(), new DummyExecutor2()];

suite('ExecutionManager', function() {
  suite('ExecutionManager', function() {
    suite('#construtor()', function() {
      const executionManager = new ExecutionManager(dummyDeviceList, dummyExecutorList);
      assert.isObject<ExecutionManager>(executionManager);
      assert.strictEqual(dummyDeviceList, executionManager.allDevices);
    });
    suite('#findDevice()', function() {
      const executionManager = new ExecutionManager(dummyDeviceList, dummyExecutorList);
      assert.strictEqual(executionManager.findDevice('dummyDevice1'), dummyDeviceList[0]);
      assert.strictEqual(executionManager.findDevice('dummyDevice2'), dummyDeviceList[1]);
      assert.strictEqual(executionManager.findDevice('dummyDevice3'), dummyDeviceList[2]);
    });
  });
});
