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

import {Version} from '../../Backend/Version';
import {gToolchainEnvMap, ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {InstallQuickInput, showInstallQuickInput} from '../../View/InstallQuickInput';
import {MockCompiler} from '../MockCompiler';


suite('View', function() {
  // NOTE: InstallQuickInput has a role for QuickInput
  // However, we cannot test the ui until now
  // Therefore, we focus on testing things not ui
  suite('InstallQuickInput', function() {
    const compiler = new MockCompiler();
    const toolchainEnv = new ToolchainEnv(compiler);
    const toolchainType = toolchainEnv.getToolchainTypes()[0];
    const toolchain = toolchainEnv.listAvailable(toolchainType, 0, 1)[0];
    const version = new Version(1, 0, 0).str();
    const backendName = 'testBackend';

    setup(function() {
      gToolchainEnvMap[backendName] = toolchainEnv;
    });

    teardown(function() {
      if (gToolchainEnvMap[backendName] !== undefined) {
        delete gToolchainEnvMap[backendName];
      }
    });

    suite('#constructor()', function() {
      test('is constructed', function() {
        let quickInput = new InstallQuickInput();
        assert.instanceOf(quickInput, InstallQuickInput);
      });
    });

    suite('#getToolchainEnv()', function() {
      test('gets ToolchainEnv', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        assert.strictEqual(quickInput.getToolchainEnv(), toolchainEnv);
      });

      test('NEG: throw error when ToolchainEnv is undefined', function() {
        let quickInput = new InstallQuickInput();
        assert.throw(() => {
          quickInput.getToolchainEnv();
        });
      });
    });

    suite('#getToolchainType()', function() {
      test('gets ToolchainType', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainType = toolchainType;
        assert.strictEqual(quickInput.getToolchainType(), toolchainType);
      });

      test('NEG: throw error when ToolchainType is undefined', function() {
        let quickInput = new InstallQuickInput();
        assert.throw(() => {
          quickInput.getToolchainType();
        });
      });
    });

    suite('#getToolchain()', function() {
      test('gets Toolchain', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchain = toolchain;
        assert.strictEqual(quickInput.getToolchain(), toolchain);
      });

      test('NEG: throw error when Toolchain is undefined', function() {
        let quickInput = new InstallQuickInput();
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
    });

    suite('#getVersion()', function() {
      test('gets Version', function() {
        let quickInput = new InstallQuickInput();
        quickInput.version = version;
        assert.strictEqual(quickInput.getVersion(), version);
      });

      test('NEG: throw error when Version is undefined', function() {
        let quickInput = new InstallQuickInput();
        assert.throw(() => {
          quickInput.getVersion();
        });
      });
    });

    suite('#getError()', function() {
      test('gets error', function() {
        let quickInput = new InstallQuickInput();
        assert.strictEqual(quickInput.getError(), undefined);
      });
    });

    suite('#getAllToolchainEnvNames()', function() {
      test('gets all toolchain env names from global toolchain env', function() {
        let quickInput = new InstallQuickInput();
        let envs = quickInput.getAllToolchainEnvNames();
        assert.strictEqual(envs.length, 1);
        assert.strictEqual(envs[0], backendName);
      });
    });

    suite('#getQuickPickItems()', function() {
      test('gets quick pick items', function() {
        let quickInput = new InstallQuickInput();
        let names = ['item0', 'item1'];
        let items = quickInput.getQuickPickItems(names);
        items.forEach((value, index) => {
          assert.strictEqual(value.label, names[index]);
        });
      });
    });

    suite('#getToolchainEnvFromGlobal()', function() {
      test('gets toolchain env from Global', function() {
        let quickInput = new InstallQuickInput();
        assert.strictEqual(quickInput.getToolchainEnvFromGlobal(backendName), toolchainEnv);
      });
    });

    suite('#getToolchainTypes()', function() {
      test('gets toolchain types', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        assert.strictEqual(
            quickInput.getToolchainTypes().length, toolchainEnv.getToolchainTypes().length);
      });
    });

    suite('#getVersions()', function() {
      test('gets versions', function() {
        let quickInput = new InstallQuickInput();
        let version = quickInput.getVersions([toolchain]);
        assert.strictEqual(version.length, 1);
      });
    });
  });
});
