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

import {Backend} from '../../Backend/API';
import {backendRegistrationApi, globalBackendMap} from '../../Backend/Backend';
import {Command} from '../../Backend/Command';
import {Compiler, CompilerBase} from '../../Backend/Compiler';
import {Executor, ExecutorBase} from '../../Backend/Executor';
import {DeviceSpec} from '../../Backend/Spec';
import {Toolchains} from '../../Backend/Toolchain';
import {InferenceQuickInput} from '../../Execute/InferenceQuickInput';
import {gToolchainEnvMap} from '../../Toolchain/ToolchainEnv';

// TODO: Move it to Mockup
const backendName = 'Mockup';
const exts = ['ext0', 'ext1', 'ext2'];
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
        return exts;
      }
      toolchains(): Toolchains {
        throw new Error('Method not implemented.');
      }
      runInference(_modelPath: string, _options?: string[]|undefined): Command {
        throw new Error('Method not implemented.');
      }
      require(): DeviceSpec {
        return new DeviceSpec('MockupHW', 'MockSW', undefined);
      }
    };
    return new MockupExecutor();
  }
};

suite('Execute', function() {
  // NOTE: InferenceQuickInput has a role for QuickInput
  // However, we cannot test the ui until now
  // Therefore, we focus on testing things not ui
  suite('InferenceQuickInput', function() {
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
      test('is constructed', function() {
        let quickInput = new InferenceQuickInput();
        assert.instanceOf(quickInput, InferenceQuickInput);
      });
    });

    suite('#getBackend()', function() {
      test('gets Backend', function() {
        let quickInput = new InferenceQuickInput();
        quickInput.backend = backend;
        assert.strictEqual(quickInput.getBackend(), backend);
      });

      test('throw error when backend is undefined', function() {
        let quickInput = new InferenceQuickInput();
        assert.throw(() => {
          quickInput.getBackend();
        });
      });
    });

    suite('#getModelPath()', function() {
      test('gets ModelPath', function() {
        let quickInput = new InferenceQuickInput();
        quickInput.modelPath = modelPath;
        assert.strictEqual(quickInput.getModelPath(), modelPath);
      });

      test('throw error when modelPath is undefined', function() {
        let quickInput = new InferenceQuickInput();
        assert.throw(() => {
          quickInput.getModelPath();
        });
      });
    });

    suite('#getInputSpec()', function() {
      test('gets InputSpec', function() {
        let quickInput = new InferenceQuickInput();
        quickInput.inputSpec = inputSpec;
        assert.strictEqual(quickInput.getInputSpec(), inputSpec);
      });

      test('throw error when inputSpec is undefined', function() {
        let quickInput = new InferenceQuickInput();
        assert.throw(() => {
          quickInput.getInputSpec();
        });
      });
    });

    suite('#getError()', function() {
      test('gets error', function() {
        let quickInput = new InferenceQuickInput();
        assert.strictEqual(quickInput.getError(), undefined);
      });
    });

    suite('#getAllBackendNames()', function() {
      test('gets all backend names from global backends', function() {
        let quickInput = new InferenceQuickInput();
        let backends = quickInput.getAllBackendNames();
        assert.strictEqual(backends.length, 1);
        assert.strictEqual(backends[0], backend.name());
      });
    });

    suite('#getQuickPickItems()', function() {
      test('gets quick pick items', function() {
        let quickInput = new InferenceQuickInput();
        let names = ['item0', 'item1'];
        let items = quickInput.getQuickPickItems(names);
        items.forEach((value, index) => {
          assert.strictEqual(value.label, names[index]);
        });
      });
    });

    suite('#getBackendFromGlobal()', function() {
      test('gets Backend from Global', function() {
        let quickInput = new InferenceQuickInput();
        assert.strictEqual(quickInput.getBackendFromGlobal(backend.name()), backend);
      });
    });

    suite('#getFilter()', function() {
      test('gets filter', function() {
        let quickInput = new InferenceQuickInput();
        quickInput.backend = backend;
        const expected = exts;
        let filter = quickInput.getFilter();
        assert.strictEqual(filter.backendName.length, expected.length);
        filter.backendName.forEach((value, index) => {
          assert.strictEqual(value, expected[index]);
        });
      });
    });

    suite('#getInputSpecKeys()', function() {
      test('gets inputSpecKeys', function() {
        let quickInput = new InferenceQuickInput();
        const actual = quickInput.getInputSpecKeys();
        const expected = ['any', 'non-zero', 'positive'];
        assert.strictEqual(actual.length, expected.length);
        actual.forEach((value, index) => {
          assert.strictEqual(value, expected[index]);
        });
      });
    });
  });
});
