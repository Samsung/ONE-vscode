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

export class SplitVOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): SplitVOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsSplitVOptions(bb: flatbuffers.ByteBuffer, obj?: SplitVOptions): SplitVOptions {
    return (obj || new SplitVOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsSplitVOptions(bb: flatbuffers.ByteBuffer, obj?: SplitVOptions):
      SplitVOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new SplitVOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  numSplits(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  static startSplitVOptions(builder: flatbuffers.Builder) {
    builder.startObject(1);
  }

  static addNumSplits(builder: flatbuffers.Builder, numSplits: number) {
    builder.addFieldInt32(0, numSplits, 0);
  }

  static endSplitVOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createSplitVOptions(builder: flatbuffers.Builder, numSplits: number): flatbuffers.Offset {
    SplitVOptions.startSplitVOptions(builder);
    SplitVOptions.addNumSplits(builder, numSplits);
    return SplitVOptions.endSplitVOptions(builder);
  }
}
