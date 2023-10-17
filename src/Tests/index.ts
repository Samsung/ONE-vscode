/*
 * MIT License
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE
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
// This file referenced
// https://github.com/microsoft/vscode-js-debug/blob/95d772b31e87ed4069e0d9242f424925792e96e9/src/test/testRunner.ts

import * as glob from "glob";
import Mocha from "mocha";
import { join } from "path";
// NOTE: env[key] causes some error. Use env.key
import { env } from "process";

function setupCoverage() {
  const NYC = require("nyc");
  const nyc = new NYC({
    extends: "@istanbuljs/nyc-config-typescript",
    cwd: join(__dirname, "..", ".."),
    exclude: [
      "**/Tests/**",
      "**/external/**",
      "**/CircleEditor/**",
      "**/MetadataViewer/**",
    ],
    include: ["src/**/*.ts", "out/**/*.js"],
    reporter: ["cobertura", "lcov", "html", "text", "text-summary"],
    all: true,
    instrument: true,
    hookRequire: true,
    hookRunInContext: true,
    hookRunInThisContext: true,
    cache: false,
  });

  nyc.reset();
  nyc.wrap();

  return nyc;
}

export async function run(): Promise<void> {
  const nyc = setupCoverage();

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
  const testFilter = "";
  const mochaOpts: Mocha.MochaOptions = {
    ui: "tdd",
    color: true,
    fgrep: testFilter,
    timeout: 10000,
  };

  const runner = new Mocha(mochaOpts);

  if (env.isCoverage === "true") {
    runner.reporter("mocha-xunit-reporter", { output: "mocha_result.xml" });
  }

  if (env.isCiTest === "true") {
    runner.fgrep("@Use-onecc").invert();
  }

  const options = { cwd: __dirname };
  const files = glob.sync("**/**.test.js", options);

  for (const file of files) {
    runner.addFile(join(__dirname, file));
  }

  try {
    await new Promise((resolve, reject) =>
      runner.run((failures) =>
        failures
          ? reject(new Error(`${failures} tests failed`))
          : resolve(undefined)
      )
    );
  } finally {
    if (env.isCoverage === "true") {
      nyc.writeCoverageFile();
      await nyc.report();
    }
  }
}
