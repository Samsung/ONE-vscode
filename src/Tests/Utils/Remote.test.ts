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

import {resolveCliPathFromVSCodeExecutablePath} from '@vscode/test-electron';
import {assert} from 'chai';
import {readFileSync} from 'fs';
import * as ssh2 from 'ssh2';
import * as ssh2streams from 'ssh2-streams';  // for SFTPWrapper
import {Remote} from '../../Utils/Remote';

suite('Utils', function() {
  // user's PublicKey should be registered on 'authorized_keys' of the host
  // user's 'known_hosts' have the host
  suite('Remote', function() {
    // dpkg: check the package is installed, get info, install, ...
    // tar files -> scp -> untar
    suite('Client', function() {
      const hostAddress: string =
          (process.env.HOST_ADDRESS !== undefined) ? process.env.HOST_ADDRESS : 'localhost';
      const hostPort: number =
          (process.env.HOST_PORT !== undefined) ? parseInt(process.env.HOST_PORT) : 22;
      const userName: string =
          (process.env.USER_NAME !== undefined) ? process.env.USER_NAME : 'dragon';
      const userPrivateKey: string = (process.env.PRIVATE_KEY !== undefined) ?
          process.env.PRIVATE_KEY :
          `/home/${process.env.USER}/.ssh/id_rsa`;

      const connConfig: ssh2.ConnectConfig = {
        host: hostAddress,
        port: hostPort,
        username: userName,
        privateKey: readFileSync(userPrivateKey),
        debug: (information: string) => {
          // for debug
          // console.debug(information);
        }
      };

      test('example', function(done) {
        const conn = new ssh2.Client();
        conn.on('ready',
                () => {
                  conn.exec('ls -lh', (err, stream) => {
                    if (err) {
                      done(err);
                    }
                    console.log('exec: ' + stream);
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
                              console.log('data: ' + data);
                            })
                        .stderr.on('data', (data) => {
                          conn.end();
                          console.error('data: ' + data);
                          done(new Error(data));
                        });
                  });
                })
            .on('banner',
                (message: string) => {
                  console.log('banner: ' + message);
                })
            .on('error',
                (err: Error) => {
                  conn.end();
                  console.error(err);
                })
            .connect(connConfig);
      });  // test(example)

      test('example2', function(done) {
        const remote = new Remote(hostAddress, hostPort, userName, userPrivateKey);
        remote.connect()
            .then((remote: Remote) => {
              console.log('then0');
              assert.strictEqual(remote.ready, true);
              return remote;
            })
            .then((remote: Remote) => {
              console.log('then1');
              assert.strictEqual(remote.ready, true);
              return remote;
            })
            .then((remote: Remote) => {
              console.log('then2');
              assert.strictEqual(remote.ready, true);
              return remote.disconnect();
            })
            .then((remote: Remote) => {
              console.log('then3');
              assert.strictEqual(remote.ready, false);
              done();
            })
            .catch((error) => {
              console.log('catch');
              remote.disconnect();
              done(error);
            });
      });  // test(example2)

      test('example3', function(done) {
        const remote = new Remote(hostAddress, hostPort, userName, userPrivateKey);
        remote.connect()
            .then((remote: Remote) => {
              console.log('then0');
              assert.strictEqual(remote.ready, true);
              return remote;
            })
            .then((remote: Remote) => {
              console.log('then1');
              return remote.checkPackage('gcc');
            })
            .then((result: boolean) => {
              console.log('then2');
              assert.strictEqual(result, true);
              return remote.checkPackage('gccx');
            })
            .then((result: boolean) => {
              console.log('then3');
              assert.strictEqual(result, false);
              return remote.disconnect();
            })
            .then((remote: Remote) => {
              console.log('then4');
              assert.strictEqual(remote.ready, false);
              done();
            })
            .catch((error) => {
              console.log('catch');
              remote.disconnect();
              done(error);
            });
      });  // test(example3)

      test('example4', function(done) {
        const remote = new Remote(hostAddress, hostPort, userName, userPrivateKey);
        remote.connect()
            .then((remote: Remote) => {
              console.log('then0');
              assert.strictEqual(remote.ready, true);
              return remote;
            })
            .then((remote: Remote) => {
              console.log('then1');
              let dir = `/home/${process.env.USER}`;
              return remote.listWorkspace(dir);
            })
            .then((result: ssh2streams.FileEntry[]) => {
              console.log('then2');
              console.dir(result);
              return remote.disconnect();
            })
            .then((remote: Remote) => {
              console.log('then3');
              assert.strictEqual(remote.ready, false);
              done();
            })
            .catch((error) => {
              console.log('catch');
              remote.disconnect();
              done(error);
            });
      });  // test(example4)
    });
  });
});
