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
import * as vscode from 'vscode';

import {Backend} from '../../Backend/Backend';
import {backendRegistrationApi, globalBackendMap} from '../../Backend/API';
import {Command} from '../../Backend/Command';
import {Compiler, CompilerBase} from '../../Backend/Compiler';
import {Executor, ExecutorBase} from '../../Backend/Executor';
import {DeviceSpec} from '../../Backend/Spec';
import {Toolchains} from '../../Backend/Toolchain';
import {InferenceRunner} from '../../Execute/InferenceRunner';
import {gToolchainEnvMap} from '../../Toolchain/ToolchainEnv';

// TODO: Move it to Mockup
const backendName = 'Mockup';
const inferenceRunner = 'inferenceRunner';
class BackendMockup implements Backend {
  name(): string {
    return backendName;
  }
  compiler(): Compiler|undefined {
    return new CompilerBase();
  }

  executor(): Executor|undefined {
    class MockupExecutor implements Executor {
      name(): string {
        return backendName;
      }
      getExecutableExt(): string[] {
        throw new Error('Method not implemented.');
      }
      toolchains(): Toolchains {
        throw new Error('Method not implemented.');
      }
      runInference(_modelPath: string, _options?: string[]|undefined): Command {
        let args = [_modelPath].concat(_options as string[]);
        let cmd = new Command(inferenceRunner, args);
        return cmd;
      }
      require(): DeviceSpec {
        return new DeviceSpec('MockupHW', 'MockSW', undefined);
      }
    };
    return new MockupExecutor();
  }
};

suite('Execute', function() {
  // NOTE: InferenceRunner has two roles for running inference and showing ui
  // However, we cannot test the ui until now
  // Therefore, we focus on testing things not ui
  suite('InferenceRunner', function() {
    const backend = new BackendMockup();
    const modelPath = vscode.Uri.parse('file:///model.path');
    const inputSpec = 'any';


    setup(function() {
      let registrationAPI = backendRegistrationApi();
      registrationAPI.registerBackend(backend);
    });

    teardown(function() {
      if (globalBackendMap[backendName] !== undefined) {
        delete globalBackendMap[backendName];
      }
      if (gToolchainEnvMap[backendName] !== undefined) {
        delete gToolchainEnvMap[backendName];
      }
    });

    suite('#constructor()', function() {
      test('is constructed with params', function() {
        let runner = new InferenceRunner(backend, modelPath, inputSpec);
        assert.strictEqual(runner.backend, backend);
        assert.strictEqual(runner.modelPath, modelPath);
        assert.strictEqual(runner.inputSpec, inputSpec);
      });
    });

    suite('#getInferenceCmd()', function() {
      test('gets inference command', function() {
        let runner = new InferenceRunner(backend, modelPath, inputSpec);
        let cmd = runner.getInferenceCmd();
        let expected = `${inferenceRunner} ${modelPath.path} --input-spec ${inputSpec}`;
        assert.strictEqual(cmd.str(), expected);
      });
    });

    suite('#getOutFileName()', function() {
      test('gets outfile name', function() {
        let runner = new InferenceRunner(backend, modelPath, inputSpec);
        let expected = `${modelPath.path}.infer.log`;
        assert.strictEqual(runner.getOutFileName(), expected);
      });
    });
  });
});
