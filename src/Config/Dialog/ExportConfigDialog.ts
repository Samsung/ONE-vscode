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
import {Balloon} from '../../Utils/Balloon';

export function exportConfig(payLoad: any): void {
  const oneToolList = payLoad.oneToolList;
  const fileName = payLoad.fileName;
  const configPareser = require('configparser');
  const config = new configPareser();

  config.addSection('one-build');

  for (let i = 0; i < oneToolList.length; i++) {
    config.set('one-build', oneToolList[i].type, oneToolList[i].use ? 'True' : 'False');
    if (oneToolList[i].use === false) {
      continue;
    }
    config.addSection(oneToolList[i].type);
    for (let j = 0; j < oneToolList[i].options.length; j++) {
      let optionValue = oneToolList[i].options[j].optionValue;
      if (optionValue === false || optionValue === '') {
        continue;
      }
      if (typeof optionValue === 'boolean') {
        optionValue = 'True';
      }
      config.set(oneToolList[i].type, oneToolList[i].options[j].optionName, optionValue);
    }
  }

  const optionsForExportDialog: vscode.SaveDialogOptions = {
    defaultUri: vscode.Uri.file(fileName + '.cfg'),
    filters: {
      /* eslint-disable-next-line @typescript-eslint/naming-convention */
      'ONE .cfg Files': ['cfg'],
    },
  };
  vscode.window.showSaveDialog(optionsForExportDialog).then((fileUri) => {
    if (fileUri) {
      let filePath = fileUri.fsPath;
      try {
        config.write(filePath);
        Balloon.info('Your configuration file is successfully generated!');
        vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(doc => {
          vscode.window.showTextDocument(doc);
        });
      } catch (error) {
        Balloon.error('Invalid file path');
      }
    }
  });
}
