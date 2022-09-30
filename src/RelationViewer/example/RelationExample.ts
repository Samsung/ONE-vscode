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
NOTE this is example logic that you can get sample relation data
TODO Replace this sample logic into real logic
*/
export function getRelationData(path: any) {
  const dummyData = {
    'selected': '1',
    'relation-data': [
      {
        'id': '1',
        'parent': '',
        'represent-idx': 0,
        'data-list': [
          {
            'name': 'baseModelTestTflite123123.tflite',
            'path': 'baseModelTestTflite123123.tflite',
            'is-deleted': false
          },
          {'name': 'model.tflite', 'path': 'model.tflite', 'is-deleted': true},
          {'name': 'c.tflite', 'path': 'c.tflite'},
          {'name': 'd.tflite', 'path': 'd.tflite', 'is-deleted': false}
        ]
      },  // TODO: id, parentid: hashId
      {
        'id': '2',
        'parent': '1',
        'represent-idx': 0,
        'data-list': [{
          'name': 'test1.circle',
          'path': 'src/hello/test1.circle',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '3',
        'parent': '2',
        'represent-idx': 0,
        'data-list': [{
          'name': 'test2.circle',
          'path': 'src/trudiv/model/test2.circle',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '4',
        'parent': '1',
        'represent-idx': 0,
        'data-list': [{
          'name': 'test1.log',
          'path': 'test1.log',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '5',
        'parent': '2',
        'represent-idx': 0,
        'data-list': [{
          'name': 'test2.log',
          'path': 'test2.log',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '6',
        'parent': '4',
        'represent-idx': 0,
        'data-list': [{
          'name': 'baseModelTestCircle.circle',
          'path': 'baseModelTestCircle.circle',
          'is-deleted': false
        }]
      },
      {
        'id': '7',
        'parent': '6',
        'represent-idx': 0,
        'data-list': [{
          'name': 'model.q8.circle',
          'path': 'model.q8.circle',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '8',
        'parent': '6',
        'represent-idx': 0,
        'data-list': [{
          'name': 'pbTestCircle1.log',
          'path': 'pbTestCircle1.log',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '9',
        'parent': '7',
        'represent-idx': 0,
        'data-list': [{
          'name': 'test_onnx.circle',
          'path': 'hello/test_onnx.circle',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '10',
        'parent': '7',
        'represent-idx': 0,
        'data-list': [{
          'name': 'while_000.circle',
          'path': 'while/while_000.circle',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '11',
        'parent': '8',
        'represent-idx': 0,
        'data-list': [{
          'name': 'e1.log',
          'path': 'e1.circle',
          'onecc-version': '1.0.0',
          'toolchain-version': '1.0.0',
          'is-deleted': false
        }]
      },
      {
        'id': '12',
        'parent': '8',
        'represent-idx': 0,
        'data-list': [
          {
            'name': 'e2.log',
            'path': 'e2.circle',
            'onecc-version': '1.0.0',
            'toolchain-version': '1.0.0',
            'is-deleted': true
          },
          {
            'name': 'e3.circle',
            'path': 'e3.circle',
            'onecc-version': '1.2.0',
            'toolchain-version': '1.0.0',
            'is-deleted': false
          }
        ]
      }
    ]
  } as any;

  for (const key in dummyData) {
    if (key === 'relation-data') {
      for (const idx in dummyData['relation-data']) {
        for (const key2 in dummyData['relation-data'][idx]) {
          if (key2 === 'data-list') {
            for (let index = 0; index < dummyData['relation-data'][idx]['data-list'].length;
                 index++) {
              const element = dummyData['relation-data'][idx]['data-list'][index];
              for (const key3 in element) {
                if (key3 === 'path') {
                  if (element['path'] === path) {
                    dummyData['relation-data'][idx]['represent-idx'] = index;
                    dummyData['selected'] = dummyData['relation-data'][idx]['id'];
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return dummyData;
}
