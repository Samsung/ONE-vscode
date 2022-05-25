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
import {PackageInfo, ToolchainInfo} from '../../../Backend/Toolchain';
import {DebianArch, DebianRepo, DebianToolchain} from '../../../Backend/ToolchainImpl/DebianToolchain';
import {Version} from '../../../Backend/Version';

// NOTE
// The current ci of ONE-vscode is using the only ubuntu-20.04
// The tests are fitting its env
suite('Backend', function() {
  suite('ToolchainImpl', function() {
    suite('DebianToolchain', function() {
      // for Toolchain
      // Let's use `npm`
      const name = 'npm';
      const desc = 'npm toolchain';
      const version = new Version(6, 14, 4, '+ds-1ubuntu2');
      const info = new ToolchainInfo(name, desc, version);

      suite('#contructor()', function() {
        test('is contructed with values', function() {
          const uri = 'http://archive.ubuntu.com/ubuntu';
          const dist = 'foscal';
          const comp = 'universe';
          const repo = new DebianRepo(uri, dist, comp);
          const arch = DebianArch.amd64;
          let dt = new DebianToolchain(info, repo, arch);
          assert.strictEqual(dt.info, info);
          assert.strictEqual(dt.repo, repo);
          assert.strictEqual(dt.arch, arch);
        });
      });

      suite('#prepare()', function() {
        test('', function() {
          let dt = new DebianToolchain(info);
          dt.prepare();
          assert.strictEqual(dt.ready, true);
        });
      });

      suite('#install()', function() {
        test('', function() {
          let dt = new DebianToolchain(info);
          let cmd = dt.install();
          const expectedStr = `sudo aptitude install ${name}=${version.str()} -q -y`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });

      suite('#uninstall()', function() {
        test('', function() {
          let dt = new DebianToolchain(info);
          let cmd = dt.uninstall();
          const expectedStr = `sudo apt-get purge ${name}=${version.str()} -q -y`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });

      suite('#installed()', function() {
        test('', function() {
          let dt = new DebianToolchain(info);
          let cmd = dt.installed();
          const expectedStr = `dpkg-query --show ${name}=${version.str()} && echo $?`;
          assert.strictEqual(cmd.str(), expectedStr);
        });
      });
    });
  });
});
