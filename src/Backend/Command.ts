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

class Command extends Array<string> {
  root: boolean;
  constructor(cmd: string, options?: string[]) {
    super();
    this.push(cmd);
    if (options !== undefined) {
      options.forEach(option => {
        this.push(option);
      });
    }
    this.root = false;
  }

  setRoot(): Command {
    this.root = true;
    return this;
  }

  strs(): string[] {
    return this;
  }

  str(): string {
    return (this.root ? 'sudo ' : '') + this.strs().join(' ');
  }
};

export {Command};
