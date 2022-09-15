// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { MirrorPadMode } from '../circle/mirror-pad-mode';


export class MirrorPadOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):MirrorPadOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsMirrorPadOptions(bb:flatbuffers.ByteBuffer, obj?:MirrorPadOptions):MirrorPadOptions {
  return (obj || new MirrorPadOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsMirrorPadOptions(bb:flatbuffers.ByteBuffer, obj?:MirrorPadOptions):MirrorPadOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new MirrorPadOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

mode():MirrorPadMode {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : MirrorPadMode.REFLECT;
}

static startMirrorPadOptions(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addMode(builder:flatbuffers.Builder, mode:MirrorPadMode) {
  builder.addFieldInt8(0, mode, MirrorPadMode.REFLECT);
}

static endMirrorPadOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createMirrorPadOptions(builder:flatbuffers.Builder, mode:MirrorPadMode):flatbuffers.Offset {
  MirrorPadOptions.startMirrorPadOptions(builder);
  MirrorPadOptions.addMode(builder, mode);
  return MirrorPadOptions.endMirrorPadOptions(builder);
}

unpack(): MirrorPadOptionsT {
  return new MirrorPadOptionsT(
    this.mode()
  );
}


unpackTo(_o: MirrorPadOptionsT): void {
  _o.mode = this.mode();
}
}

export class MirrorPadOptionsT {
constructor(
  public mode: MirrorPadMode = MirrorPadMode.REFLECT
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return MirrorPadOptions.createMirrorPadOptions(builder,
    this.mode
  );
}
}
