// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class SelectOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): SelectOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsSelectOptions(bb: flatbuffers.ByteBuffer, obj?: SelectOptions): SelectOptions {
    return (obj || new SelectOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsSelectOptions(bb: flatbuffers.ByteBuffer, obj?: SelectOptions):
      SelectOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new SelectOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static startSelectOptions(builder: flatbuffers.Builder) {
    builder.startObject(0);
  }

  static endSelectOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createSelectOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    SelectOptions.startSelectOptions(builder);
    return SelectOptions.endSelectOptions(builder);
  }
}
