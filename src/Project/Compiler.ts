import * as fs from 'fs';
import * as cp from 'child_process';
import {Logger} from '../Utils/Logger';
import { CommentThreadCollapsibleState } from 'vscode';

const path = require('path');
const which = require('which');

export class DockerInfo {
  name: string;
  tag: string;

  constructor(name: string, tag: string) {
    this.name = name;
    this.tag = tag;
  }
}

export namespace Toolchain {

  export const enum Backend {
    tUndefined = 0,
    tTriv2 = 1,
    tTriv24 = 2,
    tOnert = 3,
  }

  export const enum Type {
    tUndefined = 0,
    tBinary = 1,
    tDockerImage = 2,
    }

}

export class Toolchain {
  backend: Toolchain.Backend = Toolchain.Backend.tUndefined;
  version: string = "";
  oneversion: string = "";
  official: boolean = true;
  installedDate: string = "";
  type: Toolchain.Type = Toolchain.Type.tUndefined;
}

export class Compiler {
  logger: Logger;
  toolchainList: Toolchain[] = new Array();

  constructor(l: Logger) {
    this.logger = l;
  }

  private searchLocalToolchain(): string|undefined {
    let oneccPath = which.sync('onecc', {nothrow: true});
    if (oneccPath === null) {
      // Use fixed installation path
      oneccPath = '/usr/share/one/bin/onecc';
    }
    console.log('onecc path: ', oneccPath);
    // check if onecc exist
    if (!fs.existsSync(oneccPath)) {
      console.log('Failed to find onecc file');
      return undefined;
    }
    // onecc maybe symbolic link: use fs.realpathSync to convert to real path
    let oneccRealPath = fs.realpathSync(oneccPath);
    console.log('onecc real path: ', oneccRealPath);
    // check if this onecc exist
    if (!fs.existsSync(oneccRealPath)) {
      console.log('Failed to find onecc file');
      return undefined;
    }
    return oneccRealPath;
  }

  public refresh(): void {
    console.log("Compiler: refresh()");

    // search local toolchain
    const toolchainPath = this.searchLocalToolchain();
    if (toolchainPath === undefined) {
      return;
    }

    // get package information from bash command
    console.log("get package informaton");
    let oneVersion  = "";
    let queryResult = cp.execSync("dpkg-query -S " + toolchainPath).toString();
    if (queryResult !== null) {
      let pkgName = queryResult.split(":")[0];
      let listResult = cp.execSync("dpkg --list | grep " + pkgName).toString();
      if (listResult !== null) {
        oneVersion = listResult.split(/\s+/)[2];
      }
    }

    let toolchainName = "triv2-toolchain";
    let toolchainVersion = "";
    let toolchainResult = cp.execSync(`dpkg --list | grep ${toolchainName}`).toString();
    if (toolchainResult !== null) {
      toolchainVersion = toolchainResult.split(/\s+/)[2];
    }

    console.log("oneversion: " + oneVersion);
    console.log("toolchainversion: " + toolchainVersion);
    if (oneVersion === '' || toolchainVersion === '') {
      console.log("Failed to get package version");
      return;
    }

    let toolchain = new Toolchain();

    if (toolchainName.includes("triv2")) {
      toolchain.backend = Toolchain.Backend.tTriv2;
    }
    toolchain.oneversion = oneVersion;
    toolchain.version = toolchainVersion;
    if (toolchainName.includes("latest")) {
      toolchain.official = false;
    }

    this.toolchainList.push(toolchain);

    // update list

    // show list
  }
}