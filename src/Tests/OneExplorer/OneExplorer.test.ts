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

import {_unit_test_BaseModelNode as BaseModelNode, _unit_test_ConfigNode as ConfigNode, _unit_test_NodeFactory as NodeFactory, _unit_test_NodeType as NodeType, _unit_test_OneNode as OneNode, _unit_test_ProductNode as ProductNode} from '../../OneExplorer/OneExplorer';
import {TestBuilder} from '../TestBuilder';

suite('OneExplorer', function() {
  suite('OneExplorer', function() {
    let testBuilder: TestBuilder;
    setup(() => {
      testBuilder = new TestBuilder(this);
      testBuilder.setUp();
    });

    teardown(() => {
      testBuilder.tearDown();
    });


    suite('#NodeFactory', function() {
      test('NEG: create a directory node with attributes', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.directory, '', undefined, {ext: '.directory'});
        }, 'Directory nodes cannot have attributes');
      });

      test('NEG: create a config node with attributes', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.config, '', undefined, {ext: '.cfg'});
        }, 'Config nodes cannot have attributes');
      });

      test('NEG: create a directory node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.directory, 'path/not/exist', undefined);
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
          const dirNode = NodeFactory.create(NodeType.directory, dirPath, undefined);
          assert.strictEqual(dirNode.getChildren().length, 1);
          assert.strictEqual(dirNode.getChildren()[0].path, baseModelPath);
        }
      });

      test('NEG: create a base model node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.baseModel, 'path/not/exist', undefined);
        });
      });

      test('create a base model node outside workspace', function() {
        const baseModelName = 'test.tflite';
        const configName = `test.cfg`;

        testBuilder.writeFileSync(baseModelName, '');
        const baseModelPath = testBuilder.getPath(baseModelName);         // in /tmp
        const configPath = testBuilder.getPath(configName, 'workspace');  // in workspace

        // Find a base model outside workspace by locating its absolute path
        testBuilder.writeFileSync(
            configName, `
[one-import-tflite]
input_path=${baseModelPath}
        `,
            'workspace');


        // Validation
        {
          const baseModelNode = NodeFactory.create(NodeType.baseModel, baseModelPath, undefined);

          assert.strictEqual(baseModelNode.openViewType, BaseModelNode.defaultOpenViewType);
          assert.strictEqual(baseModelNode.icon, BaseModelNode.defaultIcon);
          assert.strictEqual(baseModelNode.canHide, BaseModelNode.defaultCanHide);

          assert.strictEqual(baseModelNode.getChildren().length, 1);
          assert.strictEqual(baseModelNode.getChildren()[0].type, NodeType.config);
          assert.strictEqual(baseModelNode.getChildren()[0].path, configPath);
        }
      });

      test('NEG: create a config node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.config, 'path/not/exist', undefined);
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
          const configNode = NodeFactory.create(NodeType.config, configPath, undefined);
          assert.strictEqual(configNode.openViewType, ConfigNode.defaultOpenViewType);
          assert.strictEqual(configNode.icon, ConfigNode.defaultIcon);
          assert.strictEqual(configNode.canHide, ConfigNode.defaultCanHide);
          assert.strictEqual(configNode.getChildren().length, 0);
        }
      });

      test('NEG: create a product node with not existing path', function() {
        assert.throw(() => {
          NodeFactory.create(NodeType.product, 'path/not/exist', undefined);
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
          const productNode = NodeFactory.create(NodeType.product, productPath, undefined);
          assert.strictEqual(productNode.openViewType, ProductNode.defaultOpenViewType);
          assert.strictEqual(productNode.icon, ProductNode.defaultIcon);
          assert.strictEqual(productNode.canHide, ProductNode.defaultCanHide);
          assert.strictEqual(productNode.getChildren().length, 0);
        }
      });

      test('create a node with parent', function() {
        const directoryName = 'test.directory';
        const productName = 'test.directory/test.model';

        // Write a file inside temp directory
        testBuilder.writeFileSync(productName, '');

        // Get file paths inside the temp directory
        const directoryPath = testBuilder.getPath(directoryName);
        const productPath = testBuilder.getPath(productName);


        const directoryNode = NodeFactory.create(NodeType.directory, directoryPath, undefined);
        const productNode = NodeFactory.create(NodeType.product, productPath, directoryNode);

        assert.strictEqual(productNode.parent, directoryNode);
      });

      test('NEG: get an empty parent', function() {
        const productName = 'test.model';

        // Write a file inside temp directory
        testBuilder.writeFileSync(productName, '');

        // Get file paths inside the temp directory
        const productPath = testBuilder.getPath(productName);

        const productNode = NodeFactory.create(NodeType.product, productPath, undefined);

        assert.strictEqual(productNode.parent, undefined);
      });
    });

    suite('#OneNode', function() {
      test('constructor', function() {
        const directoryPath = testBuilder.getPath('');
        const directoryNode = NodeFactory.create(NodeType.directory, directoryPath, undefined);
        const oneNode = new OneNode(vscode.TreeItemCollapsibleState.Collapsed, directoryNode);
        { assert.strictEqual(oneNode.contextValue, 'directory'); }
      });
    });
  });
});
