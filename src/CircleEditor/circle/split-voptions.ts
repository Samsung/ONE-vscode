// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class SplitVOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):SplitVOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsSplitVOptions(bb:flatbuffers.ByteBuffer, obj?:SplitVOptions):SplitVOptions {
  return (obj || new SplitVOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsSplitVOptions(bb:flatbuffers.ByteBuffer, obj?:SplitVOptions):SplitVOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new SplitVOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

numSplits():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startSplitVOptions(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addNumSplits(builder:flatbuffers.Builder, numSplits:number) {
  builder.addFieldInt32(0, numSplits, 0);
}

static endSplitVOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createSplitVOptions(builder:flatbuffers.Builder, numSplits:number):flatbuffers.Offset {
  SplitVOptions.startSplitVOptions(builder);
  SplitVOptions.addNumSplits(builder, numSplits);
  return SplitVOptions.endSplitVOptions(builder);
}

unpack(): SplitVOptionsT {
  return new SplitVOptionsT(
    this.numSplits()
  );
}


unpackTo(_o: SplitVOptionsT): void {
  _o.numSplits = this.numSplits();
}
}

export class SplitVOptionsT {
constructor(
  public numSplits: number = 0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return SplitVOptions.createSplitVOptions(builder,
    this.numSplits
  );
}
}
