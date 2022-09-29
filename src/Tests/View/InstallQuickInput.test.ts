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

import {assert, expect} from 'chai';
import * as vscode from 'vscode';

import {Version} from '../../Backend/Version';
import {gToolchainEnvMap, ToolchainEnv} from '../../Toolchain/ToolchainEnv';
import {InnerButton, InstallQuickInput, InstallQuickInputState, InstallQuickInputStep} from '../../View/InstallQuickInput';
import {MockCompiler} from '../MockCompiler';

suite('View', function() {
  suite('InnerButton', function() {
    suite('#constructor()', function() {
      test('is constructed with InnerButton', function() {
        const innerButton = new InnerButton(new vscode.ThemeIcon('refresh'), 'Refresh');
        assert.instanceOf(innerButton, InnerButton);
      });
    });
  });

  // NOTE: InstallQuickInput has a role for QuickInput
  // However, we cannot test the ui until now
  // Therefore, we focus on testing things not ui
  suite('InstallQuickInput', function() {
    const oneBackendName = 'ONE';
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

      test(
          'NEG: throw error when ToolchainEnv is undefined, but toolchainType defined', function() {
            let quickInput = new InstallQuickInput();
            quickInput.toolchainType = toolchainType;
            assert.throw(() => {
              quickInput.getToolchainEnv();
            });
          });
      test('NEG: throw error when ToolchainEnv is undefined, but toolchain defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchain = toolchain;
        assert.throw(() => {
          quickInput.getToolchainEnv();
        });
      });
      test('NEG: throw error when ToolchainEnv is undefined, but version defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.version = version;
        assert.throw(() => {
          quickInput.getToolchainEnv();
        });
      });
      test('NEG: throw error when ToolchainEnv is undefined, but error defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchainEnv();
        });
      });
      test('NEG: throw error when ToolchainEnv is undefined, but all others defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when all members are defined including ToolchainEnv', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when both ToolchainEnv and error are defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
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

      test(
          'NEG: throw error when ToolchainType is undefined, but toolchainEnv defined', function() {
            let quickInput = new InstallQuickInput();
            quickInput.toolchainEnv = toolchainEnv;
            assert.throw(() => {
              quickInput.getToolchainType();
            });
          });
      test('NEG: throw error when ToolchainType is undefined, but toolchain defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchain = toolchain;
        assert.throw(() => {
          quickInput.getToolchainType();
        });
      });
      test('NEG: throw error when ToolchainType is undefined, but version defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.version = version;
        assert.throw(() => {
          quickInput.getToolchainType();
        });
      });
      test('NEG: throw error when ToolchainType is undefined, but error defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchainType();
        });
      });
      test('NEG: throw error when ToolchainType is undefined, but all others defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when all members are defined including ToolchainType', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when both ToolchainType and error are defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainType = toolchainType;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
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

      test('NEG: throw error when Toolchain is undefined, but toolchainEnv defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when Toolchain is undefined, but toolchainType defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainType = toolchainType;
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when Toolchain is undefined, but version defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.version = version;
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when Toolchain is undefined, but error defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when Toolchain is undefined, but all others defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when all members are defined including Toolchain', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when both Toolchain and error are defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchain = toolchain;
        quickInput.error = 'some error';
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

      test('NEG: throw error when Version is undefined, but toolchainEnv defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        assert.throw(() => {
          quickInput.getVersion();
        });
      });
      test('NEG: throw error when Version is undefined, but toolchainType defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainType = toolchainType;
        assert.throw(() => {
          quickInput.getVersion();
        });
      });
      test('NEG: throw error when Version is undefined, but toolchain defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchain = toolchain;
        assert.throw(() => {
          quickInput.getVersion();
        });
      });
      test('NEG: throw error when Version is undefined, but error defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getVersion();
        });
      });
      test('NEG: throw error when Version is undefined, but all others defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when all members are defined including Version', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        quickInput.toolchainType = toolchainType;
        quickInput.toolchain = toolchain;
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
        });
      });
      test('NEG: throw error when both Version and error are defined', function() {
        let quickInput = new InstallQuickInput();
        quickInput.version = version;
        quickInput.error = 'some error';
        assert.throw(() => {
          quickInput.getToolchain();
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
        assert.strictEqual(envs.length, 2);
        assert.strictEqual(envs[0], oneBackendName);
        assert.strictEqual(envs[1], backendName);
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
      test('NEG: gets invalid toolchain env from Global', function() {
        let quickInput = new InstallQuickInput();
        assert.strictEqual(quickInput.getToolchainEnvFromGlobal('invalid'), undefined);
      });
    });

    suite('#getToolchainTypes()', function() {
      test('gets toolchain types', function() {
        let quickInput = new InstallQuickInput();
        quickInput.toolchainEnv = toolchainEnv;
        assert.strictEqual(
            quickInput.getToolchainTypes().length, toolchainEnv.getToolchainTypes().length);
      });

      test('NEG: throw error when ToolchainEnv is undefined during getToolchainTypes', function() {
        let quickInput = new InstallQuickInput();
        assert.throw(() => {
          quickInput.getToolchainTypes();
        });
      });

      test(
          'NEG: throw error by getToolchainEnv when ToolchainEnv is undefined, but toolchainType defined',
          function() {
            let quickInput = new InstallQuickInput();
            quickInput.toolchainType = toolchainType;
            assert.throw(() => {
              quickInput.getToolchainTypes();
            });
          });
      test(
          'NEG: throw error by getToolchainEnv when ToolchainEnv is undefined, but toolchain defined',
          function() {
            let quickInput = new InstallQuickInput();
            quickInput.toolchain = toolchain;
            assert.throw(() => {
              quickInput.getToolchainTypes();
            });
          });
      test(
          'NEG: throw error by getToolchainEnv when ToolchainEnv is undefined, but version defined',
          function() {
            let quickInput = new InstallQuickInput();
            quickInput.version = version;
            assert.throw(() => {
              quickInput.getToolchainTypes();
            });
          });
      test(
          'NEG: throw error by getToolchainEnv when ToolchainEnv is undefined, but error defined',
          function() {
            let quickInput = new InstallQuickInput();
            quickInput.error = 'some error';
            assert.throw(() => {
              quickInput.getToolchainTypes();
            });
          });
      test(
          'NEG: throw error by getToolchainEnv when ToolchainEnv is undefined, but all others defined',
          function() {
            let quickInput = new InstallQuickInput();
            quickInput.toolchainType = toolchainType;
            quickInput.toolchain = toolchain;
            quickInput.version = version;
            quickInput.error = 'some error';
            assert.throw(() => {
              quickInput.getToolchainTypes();
            });
          });
    });

    suite('#getVersions()', function() {
      test('gets versions', function() {
        let quickInput = new InstallQuickInput();
        let version = quickInput.getVersions([toolchain]);
        assert.strictEqual(version.length, 1);
      });
    });

    suite('#changeCurrentStepBefore()', function() {
      test('changes from pickBackend step to previous step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickBackend];
        quickInput.changeCurrentStepBefore(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.unset);
      });
      test('changes from pickType step to previous step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickType];
        quickInput.changeCurrentStepBefore(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.pickBackend);
      });
      test('changes from pickVersion step to previous step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickVersion];
        quickInput.changeCurrentStepBefore(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.pickType);
      });
      test(
          'NEG: changes to previous step with invalid step name using changeCurrentStepBefore',
          function() {
            const quickInput = new InstallQuickInput();
            const names = ['item0'];
            const items = quickInput.getQuickPickItems(names);
            assert.strictEqual(items.length, 1);
            const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
                InstallQuickInputState;
            const invalidStepName = 'abcde';
            expect(function() {
              quickInput.changeCurrentStepBefore(invalidStepName, state);
            }).to.throw(`wrong stepName: ${invalidStepName}`);
          });
      test(
          'NEG: changes to previous step with almost legal step name using changeCurrentStepBefore',
          function() {
            const quickInput = new InstallQuickInput();
            const names = ['item0'];
            const items = quickInput.getQuickPickItems(names);
            assert.strictEqual(items.length, 1);
            const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
                InstallQuickInputState;
            const invalidStepName = InstallQuickInputStep[InstallQuickInputStep.pickVersion] + 'A';
            expect(function() {
              quickInput.changeCurrentStepBefore(invalidStepName, state);
            }).to.throw(`wrong stepName: ${invalidStepName}`);
          });
    });

    suite('#changeCurrentStepAfter()', function() {
      test('changes from pickBackend step to next step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickBackend];
        quickInput.changeCurrentStepAfter(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.pickBackend);
      });
      test('changes from pickType step to next step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickType];
        quickInput.changeCurrentStepAfter(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.pickType);
      });
      test('changes from pickVersion step to next step', function() {
        const quickInput = new InstallQuickInput();
        const names = ['item0'];
        const items = quickInput.getQuickPickItems(names);
        assert.strictEqual(items.length, 1);
        const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
            InstallQuickInputState;
        const enumName = InstallQuickInputStep[InstallQuickInputStep.pickVersion];
        quickInput.changeCurrentStepAfter(enumName, state);
        assert.strictEqual(state.current, InstallQuickInputStep.pickVersion);
      });
      test(
          'NEG: changes to previous step with invalid step name using changeCurrentStepAfter',
          function() {
            const quickInput = new InstallQuickInput();
            const names = ['item0'];
            const items = quickInput.getQuickPickItems(names);
            assert.strictEqual(items.length, 1);
            const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
                InstallQuickInputState;
            const invalidStepName = 'abcde';
            expect(function() {
              quickInput.changeCurrentStepAfter(invalidStepName, state);
            }).to.throw(`wrong stepName: ${invalidStepName}`);
          });
      test(
          'NEG: changes to previous step with almost legal step name using changeCurrentStepAfter',
          function() {
            const quickInput = new InstallQuickInput();
            const names = ['item0'];
            const items = quickInput.getQuickPickItems(names);
            assert.strictEqual(items.length, 1);
            const state = {selectedItem: items[0], current: InstallQuickInputStep.unset} as
                InstallQuickInputState;
            const invalidStepName = InstallQuickInputStep[InstallQuickInputStep.pickVersion] + 'A';
            expect(function() {
              quickInput.changeCurrentStepAfter(invalidStepName, state);
            }).to.throw(`wrong stepName: ${invalidStepName}`);
          });
    });

    suite('#getMultiSteps()', function() {
      test('gets MultiSteps in unset state', function() {
        const quickInput = new InstallQuickInput();
        const state = {selectedItem: undefined, current: InstallQuickInputStep.unset} as
            Partial<InstallQuickInputState>;
        const inputSteps = quickInput.getMultiSteps(state);
        assert.strictEqual(inputSteps.length, 1);
      });
      test('gets MultiSteps in pickBackend state', function() {
        const quickInput = new InstallQuickInput();
        const state = {selectedItem: undefined, current: InstallQuickInputStep.pickBackend} as
            Partial<InstallQuickInputState>;
        const inputSteps = quickInput.getMultiSteps(state);
        assert.strictEqual(inputSteps.length, 2);
      });
      test('gets MultiSteps in pickType state', function() {
        const quickInput = new InstallQuickInput();
        const state = {selectedItem: undefined, current: InstallQuickInputStep.pickType} as
            Partial<InstallQuickInputState>;
        const inputSteps = quickInput.getMultiSteps(state);
        assert.strictEqual(inputSteps.length, 3);
      });
      test('NEG: gets MultiSteps using undefine current state', function() {
        const quickInput = new InstallQuickInput();
        const invalidState = {selectedItem: undefined, current: undefined} as
            Partial<InstallQuickInputState>;
        expect(function() {
          quickInput.getMultiSteps(invalidState);
        }).to.throw(`state is wrong: ` + String(invalidState.current));
      });
      test('NEG: gets MultiSteps using invalid pickVersion state', function() {
        const quickInput = new InstallQuickInput();
        const invalidState = {
          selectedItem: undefined,
          current: InstallQuickInputStep.pickVersion
        } as Partial<InstallQuickInputState>;
        expect(function() {
          quickInput.getMultiSteps(invalidState);
        }).to.throw(`state is wrong: ` + String(invalidState.current));
      });
    });
  });
});
