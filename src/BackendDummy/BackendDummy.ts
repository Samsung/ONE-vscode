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

import {Backend} from '../Backend/API';
import {Compiler, CompilerBase} from '../Backend/Compiler';
import {Executor, ExecutorBase} from '../Backend/Executor';


class DummyCompiler extends CompilerBase {};

class DummyExecutor extends ExecutorBase {};

class DummyBackend implements Backend {
  _compiler: Compiler;
  _executor: Executor;

  constructor() {
    console.log('DUMMY: constructed');
    this._compiler = new DummyCompiler();
    this._executor = new DummyExecutor();
  }

  public name() {
    return 'Dummy';
  }

  public compiler(): Compiler {
    return this._compiler;
  }

  public executor(): Executor {
    return this._executor;
  }
};

export {DummyBackend};
