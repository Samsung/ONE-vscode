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
import * as ini from 'ini';

import {CfgData} from '../../CfgEditor/CfgData';

// NOTE
// sampleCfgText and sampleCfgText2 are the same
// but sampleCfgText3 is different from them.
const sampleCfgText = `
[onecc]
one-import-tf=False
one-import-tflite=True
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=True

[one-import-tflite]
input_path=./inception_v3.tflite
output_path=./inception_v3_tflite.circle

[one-quantize]
input_path=./inception_v3_tflite.circle
output_path=./inception_v3_tflite.q8.circle
granularity=channel

[one-codegen]
backend=dummy
command=-o inception_v3_tflite.bin ./inception_v3_tflite.q8.circle
`;

const sampleCfgText2 = `
[onecc]
one-import-tf=False
one-import-tflite=True
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=True

[one-import-tflite]
input_path=./inception_v3.tflite
output_path=./inception_v3_tflite.circle

[one-codegen]
backend=dummy
command=-o inception_v3_tflite.bin ./inception_v3_tflite.q8.circle

[one-quantize]
input_path=./inception_v3_tflite.circle
output_path=./inception_v3_tflite.q8.circle
granularity=channel
`;

const sampleCfgText3 = `
[onecc]
one-import-tf=True
one-import-tflite=False
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=True

[one-import-tf]
input_path=./inception_v3.pb
output_path=./inception_v3_pb.circle

[one-quantize]
input_path=./inception_v3_pb.circle
output_path=./inception_v3_pb.q8.circle
granularity=channel

[one-codegen]
backend=dummy
command=-o inception_v3_pb.bin ./inception_v3_pb.q8.circle
`;

suite('CfgEditor', function() {
  suite('CfgData', function() {
    suite('#constructor()', function() {
      test('is constructed', function() {
        const data = new CfgData();
        assert.instanceOf(data, CfgData);
      });
    });

    suite('#updateWithParsedConfig()', function() {
      test('updates with parsed config param', function() {
        let data = new CfgData();
        const cfg = ini.parse(sampleCfgText);
        data.updateWithParsedConfig(cfg);
        const dataCfg = data.getOneConfig();
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#updateWithStringifiedText()', function() {
      test('updates with stringified text param', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        const dataCfg = data.getOneConfig();
        const cfg = ini.parse(sampleCfgText);
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#getOneConfig()', function() {
      test('gets OneConfig instance', function() {
        let data = new CfgData();
        const cfg = ini.parse(sampleCfgText);
        data.updateWithParsedConfig(cfg);
        const dataCfg = data.getOneConfig();
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#getStringfied()', function() {
      test('gets string stringfied', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        const cfg1 = data.getOneConfig();

        const stringfied = data.getStringfied();
        let data2 = new CfgData();
        data2.updateWithStringifiedText(stringfied);
        const cfg2 = data2.getOneConfig();

        assert.strictEqual(cfg1['onecc']['one-import-tf'], cfg2['onecc']['one-import-tf']);
        assert.strictEqual(
            cfg1['one-import-tflite']['input_path'], cfg2['one-import-tflite']['input_path']);
        assert.strictEqual(
            cfg1['one-quantize']['granularity'], cfg2['one-quantize']['granularity']);
      });
    });

    suite('#setParam()', function() {
      test('sets config with param', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        data.setParam('onecc', 'one-pack', 'True');
        const cfg = data.getOneConfig();
        assert.strictEqual(cfg['onecc']['one-pack'], 'True');
      });
    });

    suite('#setSection()', function() {
      test('sets section', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        const stringified: string = `
input_path=./inception_v3.pb
output_path=./inception_v3_pb.circle
        `;
        data.setSection('one-import-tf', stringified);
        const cfg = data.getOneConfig();
        assert.strictEqual(cfg['one-import-tf']['input_path'], './inception_v3.pb');
      });
    });

    suite('#isSame()', function() {
      test('is same to stringified', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        const isSame: boolean = data.isSame(sampleCfgText2);
        assert.isTrue(isSame);
      });
      test('is not same to stringified', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        const isSame: boolean = data.isSame(sampleCfgText3);
        assert.isNotTrue(isSame);
      });
    });

    suite('#getSorted()', function() {
      test('gets sorted config', function() {
        let data = new CfgData();
        data.updateWithStringifiedText(sampleCfgText);
        data.sort();
        const isSame: boolean = data.isSame(sampleCfgText2);
        assert.isTrue(isSame);
      });
    });
  });
});
