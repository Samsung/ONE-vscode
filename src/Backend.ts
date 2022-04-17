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

import {Backend} from './Backend/API';
import {DummyBackend} from './BackendDummy/BackendDummy';

// List of backend extensions registered
let globalBackends: Backend[] = [];

function backendRegistrationApi() {
  let registrationAPI = {
    registerBackend(backend: Backend) {
      globalBackends.push(backend);

      console.log(`Backend ${backend.name()} was registered into ONE-vscode.`);
    }
  };

  // dummy
  registrationAPI.registerBackend(new DummyBackend());

  return registrationAPI;
}

export {globalBackends, backendRegistrationApi};
