// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class FillOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):FillOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsFillOptions(bb:flatbuffers.ByteBuffer, obj?:FillOptions):FillOptions {
  return (obj || new FillOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsFillOptions(bb:flatbuffers.ByteBuffer, obj?:FillOptions):FillOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new FillOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static startFillOptions(builder:flatbuffers.Builder) {
  builder.startObject(0);
}

static endFillOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createFillOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  FillOptions.startFillOptions(builder);
  return FillOptions.endFillOptions(builder);
}

unpack(): FillOptionsT {
  return new FillOptionsT();
}


unpackTo(_o: FillOptionsT): void {}
}

export class FillOptionsT {
constructor(){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return FillOptions.createFillOptions(builder);
}
}
