import * as vscode from 'vscode';

import {gToolchainEnvMap, ToolchainEnv} from '../Toolchain/ToolchainEnv';
import {Logger} from '../Utils/Logger';

import {Backend} from './Backend';

interface BackendMap {
  [key: string]: Backend
}

export class BackendManager extends vscode.Disposable {
  private backendMap: BackendMap;
  constructor() {
    super(() => {
      console.log('BackendManager: exited');
    });
    this.backendMap = {};
  }

  // Replace registerBackend
  public register(name: string, backend: Backend): void {
    if (this.backendMap[name]) {
      throw Error(`Backend(${name}) is already registered!`);
    }
    this.backendMap[name] = backend;

    const compiler = backend.compiler();
    if (compiler) {
      gToolchainEnvMap[backend.name()] = new ToolchainEnv(compiler);
    }

    // TODO: Revisit here after struss's pr
    const executor = backend.executor();
    if (executor) {
      // globalExecutorArray.push(executor);
    }
  }

  public getBackendNames(): string[] {
    return Object.keys(this.backendMap);
  }

  public getBackend(key: string): Backend {
    if (!this.backendMap[key]) {
      Logger.error('BackendManager', 'Backend name not registered!');
    }

    return this.backendMap[key];
  }
}
