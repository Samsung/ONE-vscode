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

import * as assert from 'assert';
import {readFileSync} from 'fs';
import * as ssh2 from 'ssh2';
import * as ssh2streams from 'ssh2-streams';  // for SFTPWrapper

// a wrapper for ssh2.Client
// How to use?
// remote = new Remote(addr, port, user, pkPath);
// remote.connect();
// ...
// remote.disconnect();
export class Remote {
  client: ssh2.Client;
  config: ssh2.ConnectConfig;
  ready: boolean;

  constructor(hostAddress: string, hostPort: number, userName: string, pkPath: string) {
    this.client = new ssh2.Client();
    this.config = {
      host: hostAddress,
      port: hostPort,
      username: userName,
      privateKey: readFileSync(pkPath) /*,
       debug: (information: string) => {
         // for debug
         console.debug(information);
       }*/
    };
    this.ready = false;

    this.client
        .on('connect',
            () => {
              console.debug('[connect]');
            })
        .on('close',
            (hadError: boolean) => {
              console.debug('[close]');
              this.ready = false;
            })
        // etc.
        .on('banner',
            (message: string) => {
              console.debug('[banner]: ' + message);
            })
        .on('continue', () => {
          console.debug('[continue] Not yet supported');
        });
  }

  // events: "connect" -> "ready"
  public connect() {
    return new Promise<Remote>((resolve, reject) => {
      this.ready = false;
      this.client
          // channel event
          .on('ready',
              () => {
                console.debug('[ready]');
                this.ready = true;
                resolve(this);
              })
          .on('error',
              (messerr: Error) => {
                console.debug('[error]: ' + messerr);
                reject(messerr);
              })
          // socket event
          .on('timeout', () => {
            console.debug('[timeout]');
            reject('timeout');
          });
      this.client.connect(this.config);
    });
  }

  // events: "end" -> "close"
  public disconnect() {
    return new Promise<Remote>((resolve, reject) => {
      this.client
          .on('end',
              () => {
                console.debug('[end]');
                this.ready = false;
                resolve(this);
              })
          .on('error',
              (messerr: Error) => {
                console.debug('[error]: ' + messerr);
                reject(messerr);
              })
          .on('timeout', () => {
            console.debug('[timeout]');
            reject('timeout');
          });
      this.client.end();
    });
  }

  // checkPackage
  public checkPackage(packageName: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.client.exec(`dpkg -s ${packageName}`, (err, channel) => {
        if (err) {
          reject(err);
        }
        channel
            .on('close',
                (code: number, signal: string) => {
                  // package is there
                  if (code === 0) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                })
            // 'data' event should be handled to get right close code
            .on('data',
                (data: any) => {
                    // do nothing
                });
      });
    });
  }
  // infoPackage
  // installPackage
  // uninstallPackage

  // prepareWorkspace: workspace is a empty tmp dir
  // listWorkspace
  public listWorkspace(workspacePath: string) {
    return new Promise<ssh2streams.FileEntry[]>((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          sftp.end();
          reject(err);
        }

        sftp.readdir(workspacePath, (err, list) => {
          if (err) {
            sftp.end();
            reject(err);
          }
          resolve(list);
        });
      });
    });
  }
  // copyWorkspace from local to remote
  // removeWorkspace
};
