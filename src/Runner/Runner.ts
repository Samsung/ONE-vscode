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

import {EventEmitter} from 'events';
import * as vscode from 'vscode';

import {Balloon} from '../Utils/Balloon';
import * as helpers from '../Utils/Helpers';
import {Logger} from '../Utils/Logger';

const K_MODEL_SELECT: string = 'model-select'

export type modelExt = 'pb'|'tflite'|'onnx';

export class Runner extends EventEmitter implements helpers.FileSelector {
  logger: Logger;
  modelType: modelExt;
  modelPath: string = '';

  constructor(l: Logger, _modelType: modelExt) {
    super();
    this.logger = l;
    this.modelType = _modelType;

    this.on(K_MODEL_SELECT, () => {
      console.log('Runner Constructor');
      this.runModel()
    })
  }

  loadModel(): void {
    helpers.getModelFilepath(this, this.modelType);
  }

  runModel(): void {
    console.log('Runner.runModel()');
  }

  // helpers.FileSelector implements
  public onFileSelected(fileUri: vscode.Uri|undefined): void {
    if (fileUri === undefined) {
      Balloon.error('Invalid file selection');
      return;
    }
    console.log('Selected file: ' + fileUri.fsPath);

    this.modelPath = fileUri.fsPath;
    this.emit(K_MODEL_SELECT);
  }
}
