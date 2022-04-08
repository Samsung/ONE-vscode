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

import {assert} from 'chai';

import {readFileSync} from 'fs';
import {hostname} from 'os';
import * as ssh2 from 'ssh2';

suite('Utils', function() {
  // user's PublicKey should be registered on 'authorized_keys' of the host
  // user's 'known_hosts' have the host
  suite('Ssh', function() {
    suite('Client', function() {
      const hostAddress: string =
          (process.env.HOST_ADDRESS !== undefined) ? process.env.HOST_ADDRESS : 'localhost';
      const hostPort: number =
          (process.env.HOST_PORT !== undefined) ? parseInt(process.env.HOST_PORT) : 22;
      const userName: string =
          (process.env.USER_NAME !== undefined) ? process.env.USER_NAME : 'dragon';
      const userPrivateKey: Buffer = readFileSync(
          (process.env.PRIVATE_KEY !== undefined) ? process.env.PRIVATE_KEY :
                                                    `/home/${process.env.USER}/.ssh/id_rsa`);
      test('example', function(done) {
        const conn = new ssh2.Client();
        conn.on('ready',
                () => {
                  conn.exec('uptime', (err, stream) => {
                    if (err) {
                      done(err);
                    }
                    console.log(stream);
                    stream
                        .on('close',
                            (code: number, signal: string) => {
                              conn.end();
                              if (code === 0) {
                                done();
                              } else {
                                done(new Error(code.toString()));
                              }
                            })
                        .on('data',
                            (data: any) => {
                              let out: string = data.toString();
                              console.log(out);
                            })
                        .stderr.on('data', (data) => {
                          console.error(data);
                          done(new Error(data));
                        });
                  });
                })
            .on('banner',
                (message: string) => {
                  console.log(message);
                })
            .on('error',
                (err: Error) => {
                  console.error(err);
                })
            .connect({
              host: hostAddress,
              port: hostPort,
              username: userName,
              privateKey: userPrivateKey,
              debug: (information: string) => {
                // for debug
                // console.debug(information);
              }
            });
      });
    });
  });
});
