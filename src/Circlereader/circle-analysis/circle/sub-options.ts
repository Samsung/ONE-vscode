/*
 * Copyright (c) 2021 Samsung Electronics Co., Ltd. All Rights Reserved
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
// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import {ActivationFunctionType} from '../circle/activation-function-type';


export class SubOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): SubOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsSubOptions(bb: flatbuffers.ByteBuffer, obj?: SubOptions): SubOptions {
    return (obj || new SubOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsSubOptions(bb: flatbuffers.ByteBuffer, obj?: SubOptions): SubOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new SubOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  fusedActivationFunction(): ActivationFunctionType {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readInt8(this.bb_pos + offset) : ActivationFunctionType.NONE;
  }

  static startSubOptions(builder: flatbuffers.Builder) {
    builder.startObject(1);
  }

  static addFusedActivationFunction(
      builder: flatbuffers.Builder, fusedActivationFunction: ActivationFunctionType) {
    builder.addFieldInt8(0, fusedActivationFunction, ActivationFunctionType.NONE);
  }

  static endSubOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createSubOptions(
      builder: flatbuffers.Builder,
      fusedActivationFunction: ActivationFunctionType): flatbuffers.Offset {
    SubOptions.startSubOptions(builder);
    SubOptions.addFusedActivationFunction(builder, fusedActivationFunction);
    return SubOptions.endSubOptions(builder);
  }
}
