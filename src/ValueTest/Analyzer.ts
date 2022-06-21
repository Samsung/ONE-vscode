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

import * as fs from 'fs';
import * as vscode from 'vscode';

import {Logger} from '../Utils/Logger';


const hdf5 = require('jsfive');

let testH5 = './dataset.h5';

export interface AnalyzerOption {
  peir?: boolean;

  actualExpectedMap?: boolean;

  channelMap?: boolean;
}

export class Analyzer {
  private logTag = this.constructor.name;

  public async run(expectedUri: vscode.Uri, actualUri: vscode.Uri, option: AnalyzerOption) {
    // read two files
    let buf = fs.readFileSync(testH5);
    let f = new hdf5.File(buf.buffer);
    Logger.debug(this.logTag, f.keys);

    let k0 = f.keys;
    for (let token0 of k0) {
      let g1 = f.get(token0);
      let k1 = g1.keys;
      Logger.debug(this.logTag, '\tk1', k1);  // ['1', '2', '3', '4', '5', '6'. '7'. '8'. '9']
      let v1 = g1.value;
      Logger.debug(this.logTag, '\tv1', v1);  // undefined
      let a1 = g1.attrs;
      Logger.debug(this.logTag, '\ta1', a1);
      let s1 = g1.shape;
      Logger.debug(this.logTag, '\ts1', s1);
      let dt1 = g1.dtype;
      Logger.debug(this.logTag, '\tdt1', dt1);

      for (let token1 of k1) {
        let g2 = f.get(`${token0}/${token1}`);
        let k2 = g2.keys;  // ['0', '1']
        Logger.debug(this.logTag, '\tk2', k2);
        let v2 = g2.value;
        Logger.debug(this.logTag, '\tv2', v2);  // undefined, meaning that it is a group
        let a2 = g2.attrs;
        Logger.debug(this.logTag, '\ta2', a2);
        let s2 = g2.shape;
        Logger.debug(this.logTag, '\ts2', s2);
        let dt2 = g2.dtype;
        Logger.debug(this.logTag, '\tdt2', dt2);

        for (let token2 of k2) {
          let g3 = f.get(`${token0}/${token1}/${token2}`);
          let k3 = g3.keys;  // function keys()
          Logger.debug(this.logTag, '\tk3', k3);
          let v3 = g3.value;
          Logger.debug(this.logTag, '\tv3', v3);
          let a3 = g3.attrs;
          Logger.debug(this.logTag, '\ta3', a3);
          let s3 = g3.shape;
          Logger.debug(this.logTag, '\ts3', s3);  // [1,1,1,32]  <-- Array<Number>
          let dt3 = g3.dtype;
          Logger.debug(this.logTag, '\tdt3', dt3);  // '<f4'  <-- string. having `<` seems weird
        }
      }
    }

    Logger.debug(this.logTag, `let's print some values`);

    {
      let d = f.get('/value/0/0');
      Logger.debug(this.logTag, '4. value,,.', d.value);
    }
  }
}
