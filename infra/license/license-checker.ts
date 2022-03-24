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

namespace Verification {

const resultTypeDescription = {
  pass: 'No license issue found',

  warnConditionalLicense: 'Additional manual verification is needed',
  warnNeverChecked: 'Never checked license is detected',
  warnUnknownLicense: 'License is not found',

  failForbiddenLicense: 'Forbidden license is found',
  failForbiddenPackage: 'Forbidden package is used'
} as const ;

type ResultType = keyof typeof resultTypeDescription;

type Result = {
  pkgName: string; pkgLicense: string; resultType: ResultType;
};

export class ResultSet {
  private results: Result[];

  constructor() {
    this.results = [] as Result[];
  };

  public add(result: Result) {
    this.results.push(result);
  };

  public warnCount(): number {
    let count = 0;
    this.results.forEach((result) => {
      if (result.resultType.startsWith('warn')) {
        count++;
      }
    });
    return count;
  };

  public failCount(): number {
    let count = 0;
    this.results.forEach((result) => {
      if (result.resultType.startsWith('fail')) {
        count++;
      }
    });
    return count;
  };

  public createComment(): string {
    const title = '#### ' + verificationTag + EOL + EOL;

    let body = '';
    if (this.warnCount() + this.failCount() === 0) {
      body += (':heavy_check_mark: No license issue found' + EOL);
    }
    if (this.warnCount() > 0) {
      body += (':warning: **Warning** :warning:' + EOL);
      for (const rtype in resultTypeDescription) {
        if (rtype.startsWith('warn')) {
          body += this.createDetailedComment(rtype as ResultType);
        }
      }
    }
    if (this.failCount() > 0) {
      body += (':no_entry: **Failure** :no_entry:' + EOL);
      for (const rtype in resultTypeDescription) {
        if (rtype.startsWith('fail')) {
          body += this.createDetailedComment(rtype as ResultType);
        }
      }
    }

    return title + body;
  };

  private createDetailedComment(rtype: ResultType): string {
    let title = '';
    let body = '';

    this.results.forEach((result) => {
      if (result.resultType === rtype) {
        title = '- ' + resultTypeDescription[rtype] + EOL;
        body += ('    - ' + result.pkgName + ' : ' + result.pkgLicense + EOL);
      }
    });

    return title + body;
  };
};

export function verify(pkgName: string, pkgLicense: string): ResultType {
  if (packageJudgment.hasOwnProperty(pkgName)) {
    switch (packageJudgment[pkgName as keyof typeof packageJudgment].permitted) {
      case 'yes':
        return 'pass';
      case 'conditional':
        return 'pass';
      case 'no':
        return 'failForbiddenPackage';
      default:
        throw new Error('Not implemented permitted type');
    }
  }

  if (licenseJudgment.hasOwnProperty(pkgLicense)) {
    switch (licenseJudgment[pkgLicense as keyof typeof licenseJudgment].permitted) {
      case 'yes':
        return 'pass';
      case 'conditional':
        return 'warnConditionalLicense';
      case 'no':
        return 'failForbiddenLicense';
      default:
        throw new Error('Not implemented permitted type');
    }
  }

  if (pkgLicense === 'UNKNOWN') {
    return 'warnUnknownLicense';
  }

  return 'warnNeverChecked';
};

}  // namespace Verification

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
  } else if (licenseJudgment.hasOwnProperty(pkgInfo.licenses)) {
    const licenseKey = pkgInfo.licenses as keyof typeof licenseJudgment;
    if (licenseJudgment[licenseKey].permitted === 'no') {
      deniedList.DeniedCount++;
      deniedList.DeniedLicenseUsed.push(pkg + ' : ' + pkgInfo.licenses + EOL);
    } else if (licenseJudgment[licenseKey].permitted === 'conditional') {
      warningList.WarningCount++;
      warningList.WarnedLicenseUsed.push(pkg + ' : ' + pkgInfo.licenses + EOL);
    } else if (licenseJudgment[licenseKey].permitted === 'yes') {
      // Verification PASS, do nothing
    } else {
      throw new Error('Not implemented permitted type');
    }
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

let resultSet = new Verification.ResultSet();
for (const pkgName in usedLicenseList) {
  const pkgLicense = usedLicenseList[pkgName].licenses;
  let result = Verification.verify(pkgName, pkgLicense);
  resultSet.add({pkgName: pkgName, pkgLicense: pkgLicense, resultType: result});
};

let resultZip = {
  'resultComment': resultSet.createComment(),
  'warnCount': resultSet.warnCount(),
  'failCount': resultSet.failCount()
};

writeFileSync(verificationTag + '.json', JSON.stringify(resultZip));
