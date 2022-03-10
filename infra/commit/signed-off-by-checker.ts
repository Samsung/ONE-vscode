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

/**
 * Argument List
 *  - Path for Commit Message File
 */
var args = process.argv.slice(2)
const commitMsgFilePath = args[0];

// "ONE-vscode-DCO-1.0-Signed-off-by" should be found at least once.
var hasSignedOffBy = false;
var messages = readFileSync(commitMsgFilePath, 'utf-8').split(/\r\n|\r|\n/);
for (let lineNum = 0; lineNum < messages.length; ++lineNum) {
  if (messages[lineNum].includes('ONE-vscode-DCO-1.0-Signed-off-by')) {
    hasSignedOffBy = true;
    break;
  }
}

// If Signed-off-by is not found, create failure log file.
if (hasSignedOffBy == false) {
  var logMessage = 'Signed-off-by is missing or invalid. ';
  logMessage += 'For detailed information, please refer to ';
  logMessage +=
      'https://github.com/Samsung/ONE-vscode/wiki/ONE-vscode-Developer\'s-Certificate-of-Origin';

  writeFileSync('signed_off_by_checker.fail', logMessage);
}
