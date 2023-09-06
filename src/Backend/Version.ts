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

class Version {
  major: number;
  minor: number | undefined;
  patch: number | undefined;
  option: string;

  constructor(
    major: number,
    minor: number | undefined,
    patch?: number | undefined,
    option: string = ""
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.option = option;
  }

  str(): string {
    let ret: string = `${this.major}`;
    if (this.minor !== undefined) {
      ret += `.${this.minor}`;
      if (this.patch !== undefined) {
        ret += `.${this.patch}`;
      }
    }
    ret += `${this.option}`;
    return ret;
  }

  equals(ver: Version): boolean {
    return (
      this.major === ver.major &&
      this.minor === ver.minor &&
      this.patch === ver.patch &&
      this.option === ver.option
    );
  }

  // TODO: Add operator <, <=, >, >=
}

export { Version };
