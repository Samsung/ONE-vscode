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

import * as vscode from "vscode";

// NOTE
//
//   u+0000-u+001f: control ascii codes,    ascii (ALLOWED) *
//   u+0020-u+007f: printable ascii codes,  ascii (ALLOWED)
//   u+0080-u+00ff: extended ascii codes,   extended ascii (NOT ALLOWED) **
//
// *By experience, Linux os takes all extended ascii characters(u+0000-u+00ff) for passwords, even
// controll asciis, whereas 'eslint' recommends not to use the regex which includes any control
// ascii. Therefore, we allow users to put control ascii codes.
//
// **By experience, the passwords including extended ascii characters are not working when loging in
// to remote vscode. Therefore, here we allow only 'ascii characters'(0x00-0x7f).
function containsNonAscii(str: string): boolean {
  // eslint-disable-next-line no-control-regex
  return !/^[\u0000-\u007f]*$/.test(str);
}

/* istanbul ignore next */
async function showPasswordQuickInput(): Promise<string | undefined> {
  return await vscode.window.showInputBox({
    title: "Enter password",
    password: true,
    validateInput: validateInputIsAscii,
  });

  async function validateInputIsAscii(
    input: string
  ): Promise<string | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return containsNonAscii(input)
      ? "Password contains non-ASCII characters"
      : undefined;
  }
}

export { showPasswordQuickInput, containsNonAscii };
