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

import {OneCompiler, OneDebianToolchain, OneToolchain} from '../../../Backend/One/OneToolchain';
import {ToolchainInfo} from '../../../Backend/Toolchain';
import {Version} from '../../../Backend/Version';

const oneBackendName = 'ONE';

suite('Backend', function() {
  suite('OneDebianToolchain', function() {
    suite('#run', function() {
      test('returns Commend with cfg', function() {
        const name = 'onecc-docker';
        const desc = 'On-device Neural Engine docker package';
        const version = new Version(0, 1, 0, '-0~202209280519~ubuntu18.04.1');
        const info = new ToolchainInfo(name, desc, version);
        let dt = new OneDebianToolchain(info);
        let cmd = dt.run('file.cfg');
        assert.strictEqual(cmd.length, 3);
        assert.deepStrictEqual(cmd[0], 'onecc-docker');
        assert.deepStrictEqual(cmd[1], '-C');
        assert.deepStrictEqual(cmd[2], 'file.cfg');
      });
    });
  });
});


suite('OneCompiler', function() {
  suite('#constructor()', function() {
    test('Create OneToolchain compiler', function(pass) {
      assert.doesNotThrow(() => new OneCompiler());

      pass();
      assert.ok(true);
    });
  });

  suite('#getToolchainTypes', function() {
    test('returns OneCompiler\'s type', function() {
      const oneCompiler = new OneCompiler();
      const toolchainTypes = oneCompiler.getToolchainTypes();
      assert.deepEqual(toolchainTypes, ['latest']);
    });
  });

  suite('#parseVersion', function() {
    test('returns Version object from string version', function() {
      const oneCompiler = new OneCompiler();
      const version1 = oneCompiler.parseVersion('1.0.2~RC0');
      const version2 = new Version(1, 0, 2, '~RC0');
      assert.deepEqual(version1, version2);
    });
    test('returns Version object from string version only with major', function() {
      const oneCompiler = new OneCompiler();
      const version1 = oneCompiler.parseVersion('1');
      const version2 = new Version(1, 0, 0);
      assert.deepEqual(version1, version2);
    });
    test('returns Version object from string version without patch and option', function() {
      const oneCompiler = new OneCompiler();
      const version1 = oneCompiler.parseVersion('1.0');
      const version2 = new Version(1, 0, 0);
      assert.deepEqual(version1, version2);
    });
    test('returns Version object from string version without option', function() {
      const oneCompiler = new OneCompiler();
      const version1 = oneCompiler.parseVersion('1.0.2');
      const version2 = new Version(1, 0, 2);
      assert.deepEqual(version1, version2);
    });
    test('returns Version object from string version without minor', function() {
      const oneCompiler = new OneCompiler();
      const version1 = oneCompiler.parseVersion('1.0-beta');
      const version2 = new Version(1, 0, 0, '-beta');
      assert.deepEqual(version1, version2);
    });
    test('NEG: check invalid version format without numbers', function() {
      const oneCompiler = new OneCompiler();
      assert.throws(() => oneCompiler.parseVersion('a.b.c'));
    });
    test('NEG: check invalid version format with too many numbers', function() {
      const oneCompiler = new OneCompiler();
      assert.throws(() => oneCompiler.parseVersion('1.2.3.4'));
    });
    test('NEG: check invalid version format with empty string', function() {
      const oneCompiler = new OneCompiler();
      assert.throws(() => oneCompiler.parseVersion(''));
    });
  });

  suite('#getToolchains', function() {
    test('get toolchain list', function() {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      const oneCompiler = new OneCompiler();
      assert.isDefined(oneCompiler.getToolchains);
    });

    test('return empty toolchain array when count is 0', function() {
      const oneCompiler = new OneCompiler();
      const toolchainType = 'latest';
      const start = 0;
      const count = 0;
      assert.deepStrictEqual(oneCompiler.getToolchains(toolchainType, start, count), []);
    });

    test('NEG: request wrong toolchain type', function() {
      const oneCompiler = new OneCompiler();
      const dummyToolchainType = 'dummy';
      const start = 0;
      const count = 1;
      assert.throws(() => oneCompiler.getToolchains(dummyToolchainType, start, count));
    });

    test('NEG: request wrong start number', function() {
      const oneCompiler = new OneCompiler();
      const toolchainType = 'latest';
      const start = -1;
      const count = 1;
      assert.throws(() => oneCompiler.getToolchains(toolchainType, start, count));
    });

    test('NEG: request wrong count number', function() {
      const oneCompiler = new OneCompiler();
      const toolchainType = 'latest';
      const start = 0;
      const count = -1;
      assert.throws(() => oneCompiler.getToolchains(toolchainType, start, count));
    });
  });

  suite('#getInstalledToolchains', function() {
    test('get toolchain list', function() {
      // No positive test for get toolchain list
      // To test this test case, prerequisites() function should be run first.
      // However this function needs root permission so it couldn't be executed.
      const oneCompiler = new OneCompiler();
      assert.isDefined(oneCompiler.getInstalledToolchains);
    });

    test('NEG: request wrong toolchain type', function() {
      const oneCompiler = new OneCompiler();
      const dummyToolchainType = 'dummy';
      assert.throws(() => oneCompiler.getInstalledToolchains(dummyToolchainType));
    });
  });

  suite('#prerequisitesForGetToolchains', function() {
    test('returns a command which executes a shell script for prerequisites', function() {
      const oneCompiler = new OneCompiler();
      const extensionId = 'Samsung.one-vscode';
      const ext = vscode.extensions.getExtension(extensionId) as vscode.Extension<any>;
      const scriptPath =
          vscode.Uri.joinPath(ext!.extensionUri, 'script', 'prerequisitesForGetToolchains.sh')
              .fsPath;
      const cmd = `sudo /bin/sh ${scriptPath}`;
      assert.deepStrictEqual(oneCompiler.prerequisitesForGetToolchains().str(), cmd);
    });
  });

  suite('OneToolchain', function() {
    suite('#constructor()', function() {
      test('Create dummy OneToolchain backend', function(pass) {
        assert.doesNotThrow(() => new OneToolchain());

        pass();
        assert.ok(true);
      });
    });

    suite('#name()', function() {
      test('returns backend name', function() {
        const oneBackend = new OneToolchain();
        assert.strictEqual(oneBackend.name(), oneBackendName);
      });
    });

    suite('#compiler()', function() {
      test('returns oneCompiler', function() {
        const oneBackend = new OneToolchain();
        const oneCompiler = oneBackend.compiler();
        assert.instanceOf(oneCompiler, OneCompiler);
      });
    });

    // TODO
    // Add test case for executor() and executors()
  });
});
