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
// sampleCfgText and sampleCfgText2 are the same.
// But others are different.
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

const sampleCfgText4 = `
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

[one-profile]
backend=dummy
command=command
`;

const deprecatedSampleCfgText = `
[one-build]
one-import-tf=False
one-import-tflite=False
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=False

[one-quantize]
input_path=./inception_v3_tflite.circle
output_path=./inception_v3_tflite.q8.circle
input_dtype=uint8
`;

const resolvedSampleCfgText = `
[onecc]
one-import-tf=False
one-import-tflite=False
one-import-bcq=False
one-import-onnx=False
one-optimize=False
one-quantize=True
one-pack=False
one-codegen=False

[one-quantize]
input_path=./inception_v3_tflite.circle
output_path=./inception_v3_tflite.q8.circle
input_model_dtype=uint8
`;

suite('CfgEditor', function() {
  suite('CfgData', function() {
    suite('#constructor()', function() {
      test('is constructed', function() {
        const data = new CfgData();
        assert.instanceOf(data, CfgData);
      });
    });

    suite('#setWithConfig()', function() {
      test('sets with decoded/parsed config param', function() {
        let data = new CfgData();
        const cfg = ini.parse(sampleCfgText);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#setWithString()', function() {
      test('sets with encoded/stringified text param', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const dataCfg = data.getAsConfig();
        const cfg = ini.parse(sampleCfgText);
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#getAsConfig()', function() {
      test('gets OneConfig decoded/parsed', function() {
        let data = new CfgData();
        const cfg = ini.parse(sampleCfgText);
        data.setWithConfig(cfg);
        const dataCfg = data.getAsConfig();
        assert.strictEqual(dataCfg['onecc']['one-import-tf'], cfg['onecc']['one-import-tf']);
        assert.strictEqual(
            dataCfg['one-import-tflite']['input_path'], cfg['one-import-tflite']['input_path']);
        assert.strictEqual(
            dataCfg['one-quantize']['granularity'], cfg['one-quantize']['granularity']);
      });
    });

    suite('#getAsString()', function() {
      test('gets string encoded/stringified', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const cfg1 = data.getAsConfig();

        const stringfied = data.getAsString();
        let data2 = new CfgData();
        data2.setWithString(stringfied);
        const cfg2 = data2.getAsConfig();

        assert.strictEqual(cfg1['onecc']['one-import-tf'], cfg2['onecc']['one-import-tf']);
        assert.strictEqual(
            cfg1['one-import-tflite']['input_path'], cfg2['one-import-tflite']['input_path']);
        assert.strictEqual(
            cfg1['one-quantize']['granularity'], cfg2['one-quantize']['granularity']);
      });
    });

    suite('#resolveDeprecated()', function() {
      test('resolve deprecated keys', function() {
        let data = new CfgData();
        data.setWithString(deprecatedSampleCfgText);
        const isSame: boolean = data.isSame(resolvedSampleCfgText);
        assert.isTrue(isSame);
      });
    });

    suite('#updateSectionWithKeyValue()', function() {
      test('update key of section which already exists', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        data.updateSectionWithKeyValue('onecc', 'one-pack', 'True');
        const cfg = data.getAsConfig();
        assert.strictEqual(cfg['onecc']['one-pack'], 'True');
      });
      test('update section which is not written', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        data.updateSectionWithKeyValue('one-profile', 'backend', 'dummy');
        const cfg = data.getAsConfig();
        assert.strictEqual(cfg['one-profile']['backend'], 'dummy');
      });
      test('update key which is not written', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        data.updateSectionWithKeyValue('one-quantize', 'input_model_dtype', 'uint8');
        const cfg = data.getAsConfig();
        assert.strictEqual(cfg['one-quantize']['input_model_dtype'], 'uint8');
      });
    });

    suite('#updateSectionWithValue()', function() {
      test('update section of config with value encoded/stringified', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const stringified: string = `
input_path=./inception_v3.pb
output_path=./inception_v3_pb.circle
        `;
        data.updateSectionWithValue('one-import-tf', stringified);
        const cfg = data.getAsConfig();
        assert.strictEqual(cfg['one-import-tf']['input_path'], './inception_v3.pb');
      });
    });

    suite('#isSame()', function() {
      test('is same to string encoded/stringified', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const isSame: boolean = data.isSame(sampleCfgText2);
        assert.isTrue(isSame);
      });
      test('is not same to string encoded/stringified', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const isSame: boolean = data.isSame(sampleCfgText3);
        assert.isNotTrue(isSame);
      });
      test('is not same to string encoded/stringified - 2', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        const isSame: boolean = data.isSame(sampleCfgText4);
        assert.isNotTrue(isSame);
      });
    });

    suite('#sorted()', function() {
      test('sorts config', function() {
        let data = new CfgData();
        data.setWithString(sampleCfgText);
        data.sort();
        const isSame: boolean = data.isSame(sampleCfgText2);
        assert.isTrue(isSame);
      });
    });
  });
});
