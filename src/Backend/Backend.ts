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

const assert = require('assert');
import {Backend} from './API';

/**
 * Interface of backend map
 * - Use Object class to use the only string key
 */
interface BackendMap {
  [key: string]: Backend;
}

// List of backend extensions registered
let globalBackendMap: BackendMap = {};

function backendRegistrationApi() {
  let registrationAPI = {
    registerBackend(backend: Backend) {
      const backendName = backend.name();
      assert(backendName.length > 0);
      globalBackendMap[backendName] = backend;
      console.log(`Backend ${backendName} was registered into ONE-vscode.`);
    }
  };

  return registrationAPI;
}

export {globalBackendMap, backendRegistrationApi};
