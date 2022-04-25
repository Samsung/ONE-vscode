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
      // Let's use `gcc-9`
      const name = 'gcc-9';
      const desc = 'gcc toolchain';
      const version = new Version(9, 3, 0);
      const info = new ToolchainInfo(name, desc, version);

      // for DebianToolchain
      const uri = 'http://archive.ubuntu.com/ubuntu';
      const dist = 'foscal';
      const comp = 'universe';
      const repo = new DebianRepo(uri, dist, comp);
      const arch = DebianArch.amd64;

      suite('#contructor()', function() {
        test('is contructed with values', function() {
          let dt = new DebianToolchain(info, repo, arch);
          assert.strictEqual(dt.info, info);
          assert.strictEqual(dt.repo, repo);
          assert.strictEqual(dt.arch, arch);
        });
      });

      suite('#prepare()', function() {
        test('', function() {
          let dt = new DebianToolchain(info, repo, arch);
          dt.prepare();
          assert.strictEqual(dt.ready, true);
        });
      });

      suite('#install()', function() {
        test('', function() {
          let dt = new DebianToolchain(info, repo, arch);
          let cmd = dt.install();
        });
      });

      suite('#uninstall()', function() {
        test('', function() {
          let dt = new DebianToolchain(info, repo, arch);
          let cmd = dt.uninstall();
        });
      });

      suite('#installed()', function() {
        test('', function() {
          let dt = new DebianToolchain(info, repo, arch);
          let cmd = dt.installed();
        });
      });
    });
  });
});
