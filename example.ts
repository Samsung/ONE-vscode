import { Command } from "./src/Backend/Command";

// main branch's Executor class
interface Executor {
  // exetensions of executable files
  getExecutableExt(): string[];

  // defined/available toolchains
  toolchains(): Toolchains;

  // TODO: use cfg path to run onecc after one-infer landed
  runInference(_modelPath: string, _options?: string[]): Command;

  // NEW
  runValueTest(_modelPath: string, _options?: string[]): Command;
  runProfile(_modelPath: string, _options?: string[]): Command;
}

// ExecutionEnv == Device
// ExecutionEnv has N Executors
interface ExecutionEnv {
  name(): string;
  getExecutors(): Executor[];
  getExecutor(name: string): Executor;
  prepare(): boolean; // check connection
  runInference(modelPath: string, executor: Executor): any; // return: Result
  runValueTest(modelPath: string, executorA: Executor, executorB: Executor): any; // return: DiffValue
  runProflie(modelPath: string, executor: Executor): any; // return: ProfileResult
}

// Example0) Simulator
class NpuSimulatorExecutor implements Executor {

}

class TfLiteExecutor implements Executor {

}

// This env supports running executors on a local pc
class LocalPcEnv implements ExecutionEnv {
  constructor(name: string, executors: Executor[]) {

  }

  prepare(): boolean {
    // check executors: installed? and runner exists?
    return true;
  }

  // ...
  // runInference()
  // runValueTest()
  // runProflie()
}

// Example1) dtv
class NpuDtvExecutor implements Executor {

}

class TfLiteExecutor implements Executor {

}

interface BridgeCmds {
  connect(): Command;
  disconnect(): Command;
  shell(): Command;
  device(): Command;
}

class SdbCmds implements BridgeCmds {
  main: string;
  constructor()
  {
    this.main = 'sdb';
  }
  connect(): Command
  {
    return new Command(this.main, ['connect']);
  }
  disconnect(): Command
  {
    return new Command(this.main, ['disconnect']);
  }
  shell(): Command
  {
    return new Command(this.main, ['shell']);
  }
  device(): Command
  {
    return new Command(this.main, ['device']);
  }
}

class BridgeEnv implements ExecutionEnv {
  constructor(name: string, executors: Executor[], bridgeCmds: BridgeCmds) {

  }
  name(): string;
  getExecutors(): Executor[];
  getExecutor(name: string): Executor;
  prepare(): boolean
  {
    // sdb devices should print own name
  }
  bridgeCmds(): BridgeCmds;
}

// This env supports running executors on a dtv(by tizen/sdb)
// : LocalPc <-> Dtv0(DtvEnv), Dtv1(DtvEnv), Dtv2(DtvEnv), ...
class DtvSdbEnv extends BridgeEnv {
  constructor(name: string, executors: Executor[]) {
    super(name, executors, new SdbCmds());
  }

  prepare(): boolean {
    let bridge = this.bridgeCmds();
    // check sdb: connect? run `bridge.connect()`
    // check executors: installed? and runner exists?
    return true;
  }

  // ...
  // runInference(): Use bridgeCmds's shell
  // runValueTest(): Use bridgeCmds's shell
  // runProflie(): Use bridgeCmds's shell
}

// If envs(a kind of wrapper for multiple envs) are necessary
interface ExecutionEnvs {
  name(): string;
  connect(): boolean;
  disconnect(): boolean;
  getEnvs(): Map<string, ExecutionEnv>;
  getEnv(name: string): ExecutionEnv;
  getExecutors(): Executor[];
  getExecutor(name: string): Executor;
}

// If envs(a kind of wrapper for multiple envs) and connect/disconnect are necessary
class BridgeEnvs implements ExecutionEnvs {
  envs = new Map<string, ExecutionEnv>();
  constructor(name:string, executors: Executor[], bridgeCmds: BridgeCmds) {

  }

  getBridgeCmds(): BridgeCmds;
}

class SdbEnvs extends BridgeEnvs {

  // eg. name: dtv
  constructor(name: string, executors: Executor[]) {
    super(name, executors, new SdbCmds());
  }

  name(): string;

  connect(): boolean
  {
    bridgeCmds = getBridgeCmds();
    // sdb connect: bridgeCmds.connect();
    // sdb devices: envs[device_name] = new ExecutionEnv(device_name, executors)
  }

  disconnect(): boolean
  {
    // sdb disconnect
  }

  getEnvs(): Map<string, ExecutionEnv>;
  getEnv(name: string): ExecutionEnv;
  getExecutors(): Executor[];
  getExecutor(name: string): Executor;
}