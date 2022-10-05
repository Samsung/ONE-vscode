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

/*
NOTE this is example logic that you can get sample MetaData
TODO Replace this sample logic into real logic
*/
export function getMetadata(_path: any) {
  return {
    'test.log': {
      'file-extension': 'log',
      'created-time': new Date().toLocaleString(),
      'modified-time': new Date().toLocaleString(),
      'is-deleted': false,

      'toolchain-version': 'toolchain v1.3.0',
      'onecc-version': '1.20.0',
      'operations': {'op-total': 50, 'ops': ['conv2d', 'relu', 'conv', 'spp']},
      'cfg-settings': {
        'onecc': {
          'one-import-tf': true,
          'one-import-tflite': false,
          'one-import-onnx': false,
          'one-quantize': true
        },
        'one-import-tf': {
          'converter-version': 'v2',
          'input-array': 'a',
          'output-array': 'a',
          'input-shapes': '1,299,299'
        },
        'one-quantize': {
          'quantized-dtype': 'int16',
          'input-data-format': 'list',
          'min-percentile': '11',
          'max-percentile': '100',
          'mode': 'movingAvg',
        }
      }
    }
  };
}
