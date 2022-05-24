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
import {platform} from 'os';
import {Command} from '../../Backend/Command';
import {ExecutorBase} from '../../Backend/Executor';
import {Toolchains} from '../../Backend/Toolchain';
import {SWExecutionEnv} from '../../Execute/ExecutionEnv';

class MockExecutor extends ExecutorBase {
  getExecutableExt(): string[] {
    return ['tflite', 'onnx', 'pb'];
  }
  runInference(_modelPath: string, _options?: Array<string>|undefined): Command {
    let cmd: string = '/usr/share/one/bin/one-infer';
    let STRIDE_PATH = _modelPath.split('.');
    let opt: Array<string> = ['-b ', STRIDE_PATH[STRIDE_PATH.length - 1], _modelPath];
    if (_options) {
      for (let index = 0; index < _options.length; index++) {
        const element = _options[index];
        opt.push(element);
      }
    }
    let command: Command = new Command(cmd, opt);
    return command;
  }
}

suite('ExecutionEnv', function() {
  const executor = new MockExecutor();

  suite('#constructor()', function() {
    test('is constructed with params', function() {
      let env = new SWExecutionEnv('mock-up', executor);
      assert.equal(env.envName, 'mock-up');
      assert.strictEqual(env.executor, executor);
    });
  });

  suite('#getHost()', function() {
    test('get host type', function() {
      let env = new SWExecutionEnv('mock-up', executor);
      const host = env.host();
      assert.equal(platform(), host);
    });
  });

  //   isAvailable() need toolchain or backend about MockExecutor
  //   getEnableEnvList() need toolchain or backend about MockExecutor
  suite('#listExecutableExt()', function() {
    test('get Executable suffix', function() {
      let env = new SWExecutionEnv('mock-up', executor);
      const ext = env.getListExecutableExt();
      assert.deepEqual(ext, executor.getExecutableExt());
    });
  });

  suite('#getInferenceCmd()', function() {
    test('get Inference command for certain model', function() {
      let env = new SWExecutionEnv('mock-up', executor);
      const cmd = env.getInferenceCmd('test.tflite');
      assert.deepEqual(cmd, executor.runInference('test.tflite'));
    });
  });
});
