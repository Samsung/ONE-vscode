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

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {obtainWorkspaceRoot} from '../Utils/Helpers';

export class TestBuilder {
  static testCount = 0;

  static tempDir: string = `${os.tmpdir()}/.one-vscode.test`;
  static workspaceDir: string = `${obtainWorkspaceRoot()}/.one-vscode.test`;
  dirInTemp: string;
  dirInWorkspace: string;

  testLabel: string;
  fileList: string[] = [];

  constructor(suite: Mocha.Suite) {
    TestBuilder.testCount++;

    const suiteName = suite.fullTitle().replace(' ', '/');
    this.testLabel = `${suiteName}/${TestBuilder.testCount}`;
    this.dirInTemp = `${TestBuilder.tempDir}/${suiteName}/${TestBuilder.testCount}`;
    this.dirInWorkspace = `${TestBuilder.workspaceDir}/${suiteName}/${TestBuilder.testCount}`;
  }

  setUp() {
    try {
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInTemp, {recursive: true});
      }

      if (fs.existsSync(this.dirInWorkspace)) {
        fs.rmdirSync(this.dirInWorkspace, {recursive: true});
      }

      fs.mkdirSync(this.dirInTemp, {recursive: true});
      fs.mkdirSync(this.dirInWorkspace, {recursive: true});
      console.log(`Test ${this.testLabel} - Start`);
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  getPath(fileName: string, tempOrWorkspace: string = 'temp') {
    if (tempOrWorkspace === 'temp') {
      return `${this.dirInTemp}/${fileName}`;
    } else if (tempOrWorkspace === 'workspace') {
      return `${this.dirInWorkspace}/${fileName}`;
    } else {
      throw Error('Invalid parameter');
    }
  }

  writeFileSync(fileName: string, content: string, tempOrWorkspace: string = 'temp') {
    const filePath = this.getPath(fileName, tempOrWorkspace);

    try {
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Test file is created (${filePath})`);
    } catch (e) {
      console.error('Cannot create temporal files for the test');
      throw e;
    }
  }

  tearDown() {
    try {
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInTemp, {recursive: true});
      }
      if (fs.existsSync(this.dirInTemp)) {
        fs.rmdirSync(this.dirInWorkspace, {recursive: true});
      }

    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot remove the test directory');
    } finally {
      console.log(`Test ${this.testLabel} - Done`);
    }
  }

  static setUp() {
    try {
      if (fs.existsSync(TestBuilder.tempDir)) {
        fs.rmdirSync(TestBuilder.tempDir, {recursive: true});
      }
      if (fs.existsSync(TestBuilder.workspaceDir)) {
        fs.rmdirSync(TestBuilder.workspaceDir, {recursive: true});
      }

      fs.mkdirSync(TestBuilder.tempDir, {recursive: true});
      fs.mkdirSync(TestBuilder.workspaceDir, {recursive: true});
    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot create temporal directory for the test');
    }
  }

  static tearDown() {
    try {
      fs.rmdirSync(TestBuilder.tempDir, {recursive: true});
      console.log(`Test directory is removed successfully. (${TestBuilder.tempDir})`);
      fs.rmdirSync(TestBuilder.workspaceDir, {recursive: true});
      console.log(
          `Test directory in worksp is removed successfully. (${TestBuilder.workspaceDir})`);
    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot remove the test directory');
    }
  }
}
