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

import * as Circle from '../../CircleEditor/circle_schema_generated';
import {AttributeEditor, TensorEditor} from '../../CircleEditor/Editor';

suite('CircleEditor', function() {
  suite('Editor', function() {
    suite('#constructor()', function() {
      test('is contructed with Circle.ModelT', function() {
        let model = new Circle.ModelT;
        let attrEditor = new AttributeEditor(model);
        assert.equal(attrEditor.operatorIndex, -1);
        assert.equal(attrEditor.subgraphIndex, -1);

        let tensorEditor = new TensorEditor(model);
        assert.equal(tensorEditor.subgraphIndex, -1);
      });
    });
  });
});

suite('CircleEditor', function() {
  suite('Editor', function() {
    suite('#edit()', function() {
      test('edits attributes of given Circle.ModelT', function() {
        let operator = new Circle.OperatorT();
        operator.builtinOptions = new Circle.AddOptionsT;
        operator.builtinOptionsType = Circle.BuiltinOptions.AddOptions;

        let subgraph = new Circle.SubGraphT;
        subgraph.operators.push(operator);

        let model = new Circle.ModelT;
        model.subgraphs.push(subgraph);
        let attrEditor = new AttributeEditor(model);

        attrEditor.subgraphIndex = 0;
        attrEditor.operatorIndex = 0;
        assert.equal(attrEditor.operatorIndex, 0);
        assert.equal(attrEditor.subgraphIndex, 0);

        let attr = {
          name: 'fused_activation_function',
          _type: 'ActivationFunctionType',
          _value: 'RELU_N1_TO_1'
        };

        attrEditor.edit('ADD', attr);
        let builtin: any = model.subgraphs[0].operators[0].builtinOptions;
        assert.equal(
            builtin['fusedActivationFunction'], Circle.ActivationFunctionType.RELU_N1_TO_1);
      });
    });
  });
});
