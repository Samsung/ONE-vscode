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

import * as licenseJudgment from './license-judgment.json';
import * as packageJudgment from './package-judgment.json';


/**
 * Argument List
 *  - Input path for list of used licenses
 *  - Name of OS.
 *    Currently, latest version of Winodws, Ubuntu, MacOS are used.
 */
var args = process.argv.slice(2)
const inputPathOfLicenseList = args[0];
const verificationTag = args[1];

/**
 * - WarningCount : The total number of warnings
 *
 * - WarnnedLicenseUsed
 *   - Licenses which are classified as WARN in license-judgment.json
 * - NeverChecked
 *   - Licenses which are not found in license-judgment.json
 * - UnknownLicense
 *   - Licenses which package are not found.
 */
var warningList = {
  'WarningCount': 0,

  'WarnedLicenseUsed': [] as string[],
  'NeverChecked': [] as string[],
  'UnknownLicense': [] as string[]
};

/**
 * - DeniedCount : The total number of denials
 *
 * - ONEForbidden
 *   - Licenses which are classified as not permitted at ONE in package-judgment.json
 * - DeniedLicenseUsed
 *   - Licenses which are denied by license-judgment.json
 */
var deniedList = {
  'DeniedCount': 0,

  'ONEForbidden': [] as string[],
  'DeniedLicenseUsed': [] as string[]
};

/**
 * License Verification start
 *
 * NOTE : "inputPathOfLicenseList" includes following JSON content,
 *        which is result of 'license-checker'
 * {
 *   "one-vscode@0.0.1": {
 *     "licenses": "UNKNOWN",
 *     "repository": "https://github.com/Samsung/ONE-vscode",
 *     "dependencyPath": "/path/to/ONE-vscode/",
 *     "path": "/path/to/ONE-vscode/",
 *     "licenseFile": "ONE-vscode/LICENSE"
 *   },
 *   "one-vscode@0.0.2": {
 *   ...
 * }
 */
const usedLicenseList = JSON.parse(readFileSync(inputPathOfLicenseList, 'utf-8'));
for (const pkg in usedLicenseList) {
  var pkgInfo = usedLicenseList[pkg];
  if (packageJudgment.hasOwnProperty(pkg)) {
    const pkgKey = pkg as keyof typeof packageJudgment;

    if (packageJudgment[pkgKey].permitted === 'no') {
      deniedList.DeniedCount++;
      deniedList.ONEForbidden.push(pkg + EOL);
    } else if (packageJudgment[pkgKey].permitted === 'yes') {
      // Verification PASS, do nothing
    } else if (packageJudgment[pkgKey].permitted === 'conditional') {
      // Verification PASS, check manually when release
    } else {
      throw new Error('Not implemented permitted type');
    }
  } else if (licenseJudgment.Denied.includes(pkgInfo.licenses)) {
    deniedList.DeniedCount++;
    deniedList.DeniedLicenseUsed.push(pkg + ' : ' + pkgInfo.licenses + EOL);
  } else if (licenseJudgment.Warning.includes(pkgInfo.licenses)) {
    warningList.WarningCount++;
    warningList.WarnedLicenseUsed.push(pkg + ' : ' + pkgInfo.licenses + EOL);
  } else if (licenseJudgment.Allowed.includes(pkgInfo.licenses)) {
    // Verification PASS, do nothing
  } else if (pkgInfo.licenses === 'UNKNOWN') {
    warningList.WarningCount++;
    warningList.UnknownLicense.push(pkg + EOL);
  } else {
    warningList.WarningCount++;
    warningList.NeverChecked.push(pkg + ' : ' + pkgInfo.licenses + EOL);
  }
}

/**
 * Create result comment
 */
var resultComment = '#### ' + verificationTag + EOL + EOL;
var issueFound = false;

if (warningList.WarningCount > 0) {
  issueFound = true;
  resultComment += (':warning: **Warning** :warning:' + EOL);

  if (warningList.NeverChecked.length > 0) {
    resultComment += ('- Following licenses are never checked' + EOL);
    warningList.NeverChecked.forEach(msg => {
      resultComment += ('    - ' + msg);
    });
  }
  if (warningList.WarnedLicenseUsed.length > 0) {
    resultComment += ('- Further verification is needed for following licenses' + EOL);
    warningList.WarnedLicenseUsed.forEach(msg => {
      resultComment += ('    - ' + msg);
    });
  }
  if (warningList.UnknownLicense.length > 0) {
    resultComment += ('- License is not found for following packages' + EOL);
    warningList.UnknownLicense.forEach(msg => {
      resultComment += ('    - ' + msg);
    });
  }

  resultComment += EOL;
}

if (deniedList.DeniedCount > 0) {
  issueFound = true;
  resultComment += (':no_entry: **Denied** :no_entry:' + EOL);

  if (deniedList.ONEForbidden.length > 0) {
    resultComment += ('- Following packages are forbidden in ONE' + EOL);
    deniedList.ONEForbidden.forEach(msg => {
      resultComment += ('    - ' + msg);
    });
  }
  if (deniedList.DeniedLicenseUsed.length > 0) {
    resultComment += ('- Following packages use denied licenses' + EOL);
    deniedList.DeniedLicenseUsed.forEach(msg => {
      resultComment += ('    - ' + msg);
    });
  }

  resultComment += EOL;
}

if (issueFound === false) {
  resultComment += (':heavy_check_mark: No license issue found' + EOL);
}

var resultZip = {
  'resultComment': resultComment,
  'warnCount': warningList.WarningCount.toString(),
  'failCount': deniedList.DeniedCount.toString()
};

writeFileSync(verificationTag + '.json', JSON.stringify(resultZip));
