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

import {DeviceSpec} from '../Backend/Spec';

// What is `RealDeviceInstance` class?
// Suppose a case that some tizen tvs are. dtv0, dtv1, ... dtvn_1
// the dtv's spec can be just only one
// However, each dtv should be handled one by one
// At the time, this class expresses an instance for a real device
class DeviceInstance {
  name: string;
  spec: DeviceSpec;
  constructor(name: string, spec: DeviceSpec) {
    this.name = name;
    this.spec = spec;
  }
};

export {DeviceInstance};
