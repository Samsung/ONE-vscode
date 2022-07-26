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
import * as fs from 'fs';
import * as vscode from 'vscode';
import {OneNode, _getCfgList} from '../../OneExplorer/OneExplorer';

class TestBuilder {
  static testCount = 0;
  static testDirRoot: string = '/tmp/one-vscode.test/ConfigObject';
  testLabel: string|null = null;
  testDir: string|null = null;
  fileList: string[] = [];

  constructor(suiteName: string) {
    TestBuilder.testCount++;
    this.testLabel = `${suiteName}/${TestBuilder.testCount}`;
    this.testDir = `${TestBuilder.testDirRoot}/${suiteName}/${TestBuilder.testCount}`;
  }

  setUp() {
    try {
      if (fs.existsSync(this.testDir!)) {
        fs.rmdirSync(this.testDir!, {recursive: true});
      }

      fs.mkdirSync(this.testDir!, {recursive: true});
      console.log(`Test ${this.testLabel} - Start`);
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  getPath(fileName: string) {
    return `${this.testDir}/${fileName}`;
  }

  writeFileSync(fileName: string, content: string) : string {
    const filePath = `${this.testDir}/${fileName}`;

    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Test file is created (${filePath})`);
    } catch (e) {
      console.error('Cannot create temporal files for the test');
      throw e;
    }

    return filePath;
  }

  tearDown() {
    try {
      fs.rmdirSync(this.testDir!, {recursive: true});
      console.log(`Test directory is removed successfully. (${this.testDir})`);
    } catch (e) {
      console.error('Cannot remove the test directory');
      throw e;
    } finally {
      console.log(`Test ${this.testLabel} - Done`);
    }
  }
};

suite('OneExplorer', function() {
  suite('OneExplorer', function() {
    suite('#getCfgList', function() {
      test('Create cfg lists', function() {
        const testBuilder = new TestBuilder(`${this.title}`);
        
        testBuilder.writeFileSync("example1.cfg", "no content");
        testBuilder.writeFileSync("example2.cfg", "no content");

        _getCfgList(testBuilder.getPath(''));
      });
    });
    suite('#OneNode constructor()', function() {
      test('Create OneNode', function() {
        const oneNode = new OneNode("label", vscode.TreeItemCollapsibleState.Collapsed, );

      });
    });
  });
});
