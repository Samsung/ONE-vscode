// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class PadV2Options {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):PadV2Options {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsPadV2Options(bb:flatbuffers.ByteBuffer, obj?:PadV2Options):PadV2Options {
  return (obj || new PadV2Options()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsPadV2Options(bb:flatbuffers.ByteBuffer, obj?:PadV2Options):PadV2Options {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new PadV2Options()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static startPadV2Options(builder:flatbuffers.Builder) {
  builder.startObject(0);
}

static endPadV2Options(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createPadV2Options(builder:flatbuffers.Builder):flatbuffers.Offset {
  PadV2Options.startPadV2Options(builder);
  return PadV2Options.endPadV2Options(builder);
}
}
