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
import * as path from 'path';
import * as vscode from 'vscode';

import {_unit_test_BaseModelNode as BaseModelNode, _unit_test_ConfigNode as ConfigNode, _unit_test_DirectoryNode as DirectoryNode, _unit_test_NodeFactory as NodeFactory, _unit_test_NodeType as NodeType, _unit_test_OneNode as OneNode, _unit_test_ProductNode as ProductNode, OneTreeDataProvider} from '../../OneExplorer/OneExplorer';
import {obtainWorkspaceRoot} from '../../Utils/Helpers';


class TestBuilder {
  static testCount = 0;

  static rootInTemp: string = '/tmp/one-vscode.test/OneExplorer';
  static rootInWorkspace: string = `${obtainWorkspaceRoot()}/.one-vscode.test/OneExplorer`;
  dirInTemp: string;
  dirInWorkspace: string;

  testLabel: string;
  fileList: string[] = [];

  constructor(suiteName: string) {
    TestBuilder.testCount++;
    this.testLabel = `${suiteName}/${TestBuilder.testCount}`;
    this.dirInTemp = `${TestBuilder.rootInTemp}/${suiteName}/${TestBuilder.testCount}`;
    this.dirInWorkspace = `${TestBuilder.rootInWorkspace}/${suiteName}/${TestBuilder.testCount}`;
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
      if (fs.existsSync(TestBuilder.rootInTemp)) {
        fs.rmdirSync(TestBuilder.rootInTemp, {recursive: true});
      }
      if (fs.existsSync(TestBuilder.rootInWorkspace)) {
        fs.rmdirSync(TestBuilder.rootInWorkspace, {recursive: true});
      }

      fs.mkdirSync(TestBuilder.rootInTemp, {recursive: true});
      fs.mkdirSync(TestBuilder.rootInWorkspace, {recursive: true});
    } catch (e) {
      console.error('Cannot create temporal directory for the test');
      throw e;
    }
  }

  static tearDown() {
    try {
      fs.rmdirSync(TestBuilder.rootInTemp, {recursive: true});
      console.log(`Test directory is removed successfully. (${TestBuilder.rootInTemp})`);
      fs.rmdirSync(TestBuilder.rootInWorkspace, {recursive: true});
      console.log(
          `Test directory in worksp is removed successfully. (${TestBuilder.rootInWorkspace})`);
    } catch (e) {
      // Do not throw to proceed the test
      console.error('Cannot remove the test directory');
    } finally {
      console.log(`Removed ${TestBuilder.rootInTemp} and ${TestBuilder.rootInTemp}.`);
    }
  }
};

suite('OneExplorer', function() {
  setup(() => TestBuilder.setUp());
  teardown(() => TestBuilder.tearDown());
  suite('OneExplorer', function() {
    let testBuilder: TestBuilder;
    setup(() => {
      testBuilder = new TestBuilder(`${this.title}`);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });


    suite('#getCfgList()', function() {
      test('NEG: get empty cfg list', function() {
        OneTreeDataProvider.resetCfgList();
        const cfgList = OneTreeDataProvider.getCfgList(testBuilder.getPath(''));
        { assert.strictEqual(cfgList.length, 0); }
      });

      test('NEG: get cfg list on not existing path', function() {
        OneTreeDataProvider.resetCfgList();
        const cfgList = OneTreeDataProvider.getCfgList(testBuilder.getPath(''));
        { assert.strictEqual(cfgList.length, 0); }
      });

      test('get cfg list', function() {
        const configName1 = 'test1.cfg';
        const configName2 = 'test2.cfg';

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName1, '');
        testBuilder.writeFileSync(configName2, '');

        // Get file paths inside the temp directory
        const configPath1 = testBuilder.getPath(configName1);
        const configPath2 = testBuilder.getPath(configName2);

        OneTreeDataProvider.resetCfgList();
        const cfgList = OneTreeDataProvider.getCfgList(testBuilder.getPath(''));
        {
          assert.isTrue(cfgList.includes(configPath1));
          assert.isTrue(cfgList.includes(configPath2));
        }
      });

      test('get cfg list recursively', function() {
        const configName1 = 'test1/test1.cfg';
        const configName21 = 'test2/test2.1.cfg';
        const configName22 = 'test2/test2.2.cfg';

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName1, '');
        testBuilder.writeFileSync(configName21, '');
        testBuilder.writeFileSync(configName22, '');

        // Get file paths inside the temp directory
        const configPath1 = testBuilder.getPath(configName1);
        const configPath21 = testBuilder.getPath(configName21);
        const configPath22 = testBuilder.getPath(configName22);

        OneTreeDataProvider.resetCfgList();
        const cfgList = OneTreeDataProvider.getCfgList(testBuilder.getPath(''));
        {
          assert.isTrue(cfgList.includes(configPath1));
          assert.isTrue(cfgList.includes(configPath21));
          assert.isTrue(cfgList.includes(configPath22));
        }
      });
    });


    suite('#NodeFactory', function() {
      test('NEG: create a directory node with attributes', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.directory, '', {ext: '.directory'});
        }, 'Directory nodes cannot have attributes');
      });

      test('NEG: create a config node with attributes', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.config, '', {ext: '.cfg'});
        }, 'Config nodes cannot have attributes');
      });

      test('NEG: create a directory node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.directory, 'path/not/exist');
        });
      });

      test('create a directory node with one base model node', function() {
        const dirName = 'test';
        const baseModelName = `${dirName}/test.tflite`;

        // Write a file inside temp directory
        testBuilder.writeFileSync(baseModelName, '');

        // Get file paths inside the temp directory
        const dirPath = testBuilder.getPath(dirName);
        const baseModelPath = testBuilder.getPath(baseModelName);

        // Validation
        {
          const dirNode = NodeFactory.create(NodeType.directory, dirPath);
          assert.strictEqual(dirNode.childNodes.length, 1);
          assert.strictEqual(dirNode.childNodes[0].path, baseModelPath);
        }
      });

      test('NEG: create a base model node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.baseModel, 'path/not/exist');
        });
      });

      test('create a base model node with cfg', function() {
        const baseModelName = 'test.tflite';
        const configName = `test.cfg`;

        // Write a file inside temp directory
        // and get file paths inside the temp directory
        testBuilder.writeFileSync(baseModelName, '');
        const baseModelPath = testBuilder.getPath(baseModelName);

        testBuilder.writeFileSync(
            configName, `
[one-import-tflite]
input_file=${baseModelPath}
        `,
            'workspace');

        const configPath = testBuilder.getPath(configName, 'workspace');

        // Validation
        {
          const baseModelNode = NodeFactory.create(NodeType.baseModel, baseModelPath);

          assert.strictEqual(baseModelNode.openViewType, BaseModelNode.defaultOpenViewType);
          assert.strictEqual(baseModelNode.icon, BaseModelNode.defaultIcon);
          assert.strictEqual(baseModelNode.canHide, BaseModelNode.defaultCanHide);

          assert.strictEqual(baseModelNode.childNodes.length, 1);
          assert.strictEqual(baseModelNode.childNodes[0].type, NodeType.config);
          assert.strictEqual(baseModelNode.childNodes[0].path, configPath);
        }
      });

      test('NEG: create a config node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.config, 'path/not/exist');
        });
      });

      test('create a config node', function() {
        const configName = 'test.cfg';

        // Write a file inside temp directory
        testBuilder.writeFileSync(configName, '');

        // Get file paths inside the temp directory
        const configPath = testBuilder.getPath(configName);

        // Validation
        {
          const configNode = NodeFactory.create(NodeType.config, configPath);
          assert.strictEqual(configNode.openViewType, ConfigNode.defaultOpenViewType);
          assert.strictEqual(configNode.icon, ConfigNode.defaultIcon);
          assert.strictEqual(configNode.canHide, ConfigNode.defaultCanHide);
          assert.strictEqual(configNode.childNodes.length, 0);
        }
      });

      test('NEG: create a product node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.product, 'path/not/exist');
        });
      });

      test('create a product node', function() {
        const productName = 'test.model';

        // Write a file inside temp directory
        testBuilder.writeFileSync(productName, '');

        // Get file paths inside the temp directory
        const productPath = testBuilder.getPath(productName);

        // Validation
        {
          const productNode = NodeFactory.create(NodeType.product, productPath);
          assert.strictEqual(productNode.openViewType, ProductNode.defaultOpenViewType);
          assert.strictEqual(productNode.icon, ProductNode.defaultIcon);
          assert.strictEqual(productNode.canHide, ProductNode.defaultCanHide);
          assert.strictEqual(productNode.childNodes.length, 0);
        }
      });
    });

    suite('#OneNode', function() {
      test('constructor', function() {
        const directoryPath = testBuilder.getPath('');
        const directoryNode = NodeFactory.create(NodeType.directory, directoryPath);
        const oneNode =
            new OneNode('label', vscode.TreeItemCollapsibleState.Collapsed, directoryNode);
        { assert.strictEqual(oneNode.contextValue, 'directory'); }
      });
    });
  });
});
