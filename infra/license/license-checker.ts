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

const VerificationResultType = {
  pass: 'No license issue found',

  warnJudgedAsWarn: 'Additional manual verification is needed',
  warnNeverChecked: 'Never checked license is detected',
  warnUnknownLicense: 'License is not found',

  failForbiddenLicense: 'Forbidden license is found',
  failForbiddenPackage: 'Forbidden package is used'
};
type VerificationResultTypeKeys = keyof typeof VerificationResultType;

type VerificationResult = {
  pkgName: string; pkgLicense: string; verificationResult: VerificationResultTypeKeys;
};

class VerificationResultSet {
  private results: VerificationResult[];

  constructor() {
    this.results = [] as VerificationResult[];
  };

  public add(result: VerificationResult) {
    this.results.push(result);
  };

  public warnCount(): number {
    let count = 0;
    this.results.forEach((result) => {
      if (result.verificationResult.startsWith('warn')) count++;
    });
    return count;
  };

  public failCount(): number {
    let count = 0;
    this.results.forEach((result) => {
      if (result.verificationResult.startsWith('fail')) count++;
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
      for (const vtype in VerificationResultType) {
        if (vtype.startsWith('warn'))
          body += this.createDetailedComment(vtype as VerificationResultTypeKeys);
      }
    }
    if (this.failCount() > 0) {
      body += (':no_entry: **Failure** :no_entry:' + EOL);
      for (const vtype in VerificationResultType) {
        if (vtype.startsWith('fail'))
          body += this.createDetailedComment(vtype as VerificationResultTypeKeys);
      }
    }

    return title + body;
  };

  private createDetailedComment(vtype: VerificationResultTypeKeys): string {
    let title = '';
    let body = '';

    this.results.forEach((result) => {
      if (result.verificationResult === vtype) {
        title = '- ' + VerificationResultType[vtype] + EOL;
        body += ('    - ' + result.pkgName + ' : ' + result.pkgLicense + EOL);
      }
    });

    return title + body;
  };
};

function verify(pkgName: string, pkgLicense: string): VerificationResultTypeKeys {
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
        return 'warnJudgedAsWarn';
      case 'no':
        return 'failForbiddenLicense';
      default:
        throw new Error('Not implemented permitted type');
    }
  }

  if (pkgLicense === 'UNKNOWN') return 'warnUnknownLicense';

  return 'warnNeverChecked';
};

/**
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

let resultSet = new VerificationResultSet();
for (const pkgName in usedLicenseList) {
  const pkgLicense = usedLicenseList[pkgName].licenses;
  resultSet.add(
      {pkgName: pkgName, pkgLicense: pkgLicense, verificationResult: verify(pkgName, pkgLicense)});
};

let resultZip = {
  'resultComment': resultSet.createComment(),
  'warnCount': resultSet.warnCount(),
  'failCount': resultSet.failCount()
};

writeFileSync(verificationTag + '.json', JSON.stringify(resultZip));
