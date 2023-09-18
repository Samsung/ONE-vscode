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

import { assert } from "chai";
import { Executor, ExecutorBase } from "../../Backend/Executor";
import { DeviceSpec } from "../../Backend/Spec";
import { Device } from "../../Executor/Device";
import { DeviceManager } from "../../Executor/DeviceManager";

const dummyDeviceList: Device[] = [
  new Device(
    "dummyDevice1",
    new DeviceSpec("dummySpecHW1", "dummySpecSW1", undefined)
  ),
  new Device(
    "dummyDevice2",
    new DeviceSpec("dummySpecHW1", "dummySpecSW2", undefined)
  ),
  new Device(
    "dummyDevice3",
    new DeviceSpec("dummySpecHW2", "dummySpecSW2", undefined)
  ),
];

class DummyExecutor1 extends ExecutorBase {
  name(): string {
    return "dummyExecutor1";
  }
  require(): DeviceSpec {
    return new DeviceSpec("dummySpecHW1", "dummySpecSW1", undefined);
  }
}

class DummyExecutor2 extends ExecutorBase {
  name(): string {
    return "dummyExecutor2";
  }
  require(): DeviceSpec {
    return new DeviceSpec("dummySpecHW2", "dummySpecSW2", undefined);
  }
}

const dummyExecutorList: Executor[] = [
  new DummyExecutor1(),
  new DummyExecutor2(),
];

suite("DeviceManager", function () {
  suite("DeviceManager", function () {
    suite("#construtor()", function () {
      const deviceManager = new DeviceManager(
        dummyDeviceList,
        dummyExecutorList
      );
      assert.isObject<DeviceManager>(deviceManager);
      assert.strictEqual(dummyDeviceList, deviceManager.allDevices);
      assert.isTrue(
        deviceManager.allDevices[0].availableExecutors.has(dummyExecutorList[0])
      );
      assert.isTrue(
        deviceManager.allDevices[2].availableExecutors.has(dummyExecutorList[1])
      );
    });
    suite("#findDevice()", function () {
      const deviceManager = new DeviceManager(
        dummyDeviceList,
        dummyExecutorList
      );
      assert.strictEqual(
        deviceManager.findDevice("dummyDevice1"),
        dummyDeviceList[0]
      );
      assert.strictEqual(
        deviceManager.findDevice("dummyDevice2"),
        dummyDeviceList[1]
      );
      assert.strictEqual(
        deviceManager.findDevice("dummyDevice3"),
        dummyDeviceList[2]
      );
    });
  });
});
