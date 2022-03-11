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

import {readFileSync, writeFileSync} from 'fs';
import {EOL} from 'os';

/**
 * Argument List
 *  - Input paths for each of license verification results
 */
const args = process.argv.slice(2);
const resultPaths = args;

let commentBody = [] as string[];
let totalWarnCount = 0;
let totalDenialCount = 0;
for (let i = 0; i < resultPaths.length; ++i) {
  const result = JSON.parse(readFileSync(resultPaths[i], 'utf-8'));

  commentBody.push(result['resultComment']);
  totalWarnCount += Number(result['warnCount']);
  totalDenialCount += Number(result['denialCount']);
}

let resultComment = '### License Verification' + EOL + EOL;
if (totalWarnCount + totalDenialCount > 0) {
  resultComment += ':warning: Total ' + totalWarnCount.toString() + ' Warnings Found' + EOL;
  resultComment += ':no_entry: Total ' + totalDenialCount.toString() + ' Denials Found' + EOL;
} else {
  resultComment += ':heavy_check_mark: No License Issues Found' + EOL;
}
resultComment += '<details><summary>Detailed Result</summary>' + EOL;
commentBody.forEach((comment) => {
  resultComment += EOL + '---' + EOL;
  resultComment += comment + EOL;
})
resultComment += '</details>';

writeFileSync('license_check_result.md', resultComment);
