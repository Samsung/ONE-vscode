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
import toolsAttr from './json/tools_attr.json';

export class HoverProvider implements vscode.HoverProvider {
  provideHover(
      _doc:
          {getWordRangeAtPosition: (arg0: any, arg1: RegExp) => any; getText: (arg0: any) => any;},
      _position: any, _token: any) {
    let markdownString = new vscode.MarkdownString();
    const range = _doc.getWordRangeAtPosition(_position, new RegExp(/(.+)/g));
    if (range === undefined) {
      console.log('getWordRangeAtPosition return undefined');
      return new vscode.Hover(markdownString);
    }
    const word = _doc.getText(range);

    toolsAttr.forEach((item) => {
      if (item.name === word) {
        markdownString.appendMarkdown(`### ${item.name}\n`);
        markdownString.appendMarkdown(`${item.description}\n`);
        if (item.body.length) {
          markdownString.appendMarkdown(`\n --- \n Option List\n\n`);
        }
        item.body.forEach((content) => {
          markdownString.appendMarkdown(`- ${content.attr_name} : ${content.attr_desc}\n`);

          if (content.options) {
            content.options.forEach((option) => {
              markdownString.appendMarkdown('\t');
              if (option.option_desc) {
                markdownString.appendMarkdown(`- ${option.option_name} : ${option.option_desc}\n`);
              } else {
                markdownString.appendMarkdown(`- ${option.option_name}\n`);
              }
            });
          }
        });
      }
    });

    return new vscode.Hover(markdownString);
  }
}
