// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

export class WhereOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):WhereOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsWhereOptions(bb:flatbuffers.ByteBuffer, obj?:WhereOptions):WhereOptions {
  return (obj || new WhereOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsWhereOptions(bb:flatbuffers.ByteBuffer, obj?:WhereOptions):WhereOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new WhereOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static startWhereOptions(builder:flatbuffers.Builder) {
  builder.startObject(0);
}

static endWhereOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createWhereOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  WhereOptions.startWhereOptions(builder);
  return WhereOptions.endWhereOptions(builder);
}
}
