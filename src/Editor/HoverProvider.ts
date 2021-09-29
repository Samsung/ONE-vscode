/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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

import * as vscode from 'vscode';

export class HoverProvider implements vscode.HoverProvider {
  provideHover(
      _doc:
          {getWordRangeAtPosition: (arg0: any, arg1: RegExp) => any; getText: (arg0: any) => any;},
      _position: any, _token: any) {
    let mdfile = new vscode.MarkdownString();
    const range = _doc.getWordRangeAtPosition(_position, new RegExp(/(.+)/g));
    const word = _doc.getText(range);
    // TODO Add more

    return new vscode.Hover(mdfile);
  }
}
