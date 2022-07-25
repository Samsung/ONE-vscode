/*
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
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
 * This file comes from
 * https://github.com/microsoft/vscode-extension-samples/blob/ba9a56e68277b6ba0ae3ee4593b6a864ba158b1f/helloworld-test-sample/src/test/suite/index.ts
 */

import {glob} from 'glob';
import Mocha from 'mocha';
import * as path from 'path';
// NOTE: env[key] causes some error. Use env.key
import {env} from 'process';

export function run(): Promise<void> {
  // FOR DEVELOPERS,
  //
  // To run a selective unit test, add a fgrep option below.
  // Mocha will run the tests containing the string given.
  // Don't forget to run `npm compile` before `npm run unittest`
  // once you have changed 'testFilter'
  // to update the list.
  //
  // EXAMPLE
  //
  // (1) Filter with a test suite name
  // const testFilter = "Backend";
  // const testFilter = "createConfigObj";
  //
  // (2) Filter with a test name
  // const testFilter = "Returns parsed object";
  //
  // TODO: Enable to get string to filter from package.json
  const testFilter = 'OneExplorer';
  let mocha = new Mocha({ui: 'tdd', color: true, fgrep: testFilter});
  const isCoverage: string|undefined = env.isCoverage;
  if (isCoverage !== undefined && isCoverage === 'true') {
    mocha.reporter('mocha-xunit-reporter', {output: 'mocha_result.xml'});
  }
  const isCiTest: string|undefined = env.isCiTest;
  if (isCiTest !== undefined && isCiTest === 'true') {
    mocha.fgrep('@Use-onecc');
    mocha.invert();
  }

  const testsRoot = path.resolve(__dirname, '.');

  // adds hooks first
  const hooks = 'hooks.js';
  mocha.addFile(path.join(testsRoot, hooks));

  return new Promise((c, e) => {
    glob('**/**.test.js', {cwd: testsRoot}, (err: Error|null, files: Array<string>) => {
      if (err) {
        e(err);
      } else {
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          mocha.run(failures => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`));
            } else {
              c();
            }
          });
        } catch (err) {
          console.error(err);
          e(err);
        }
      }
    });
  });
}
