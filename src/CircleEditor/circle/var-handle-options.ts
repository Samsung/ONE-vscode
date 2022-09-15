// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class VarHandleOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):VarHandleOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsVarHandleOptions(bb:flatbuffers.ByteBuffer, obj?:VarHandleOptions):VarHandleOptions {
  return (obj || new VarHandleOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsVarHandleOptions(bb:flatbuffers.ByteBuffer, obj?:VarHandleOptions):VarHandleOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new VarHandleOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

container():string|null
container(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
container(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

sharedName():string|null
sharedName(optionalEncoding:flatbuffers.Encoding):string|Uint8Array|null
sharedName(optionalEncoding?:any):string|Uint8Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
}

static startVarHandleOptions(builder:flatbuffers.Builder) {
  builder.startObject(2);
}

static addContainer(builder:flatbuffers.Builder, containerOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, containerOffset, 0);
}

static addSharedName(builder:flatbuffers.Builder, sharedNameOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, sharedNameOffset, 0);
}

static endVarHandleOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createVarHandleOptions(builder:flatbuffers.Builder, containerOffset:flatbuffers.Offset, sharedNameOffset:flatbuffers.Offset):flatbuffers.Offset {
  VarHandleOptions.startVarHandleOptions(builder);
  VarHandleOptions.addContainer(builder, containerOffset);
  VarHandleOptions.addSharedName(builder, sharedNameOffset);
  return VarHandleOptions.endVarHandleOptions(builder);
}

unpack(): VarHandleOptionsT {
  return new VarHandleOptionsT(
    this.container(),
    this.sharedName()
  );
}


unpackTo(_o: VarHandleOptionsT): void {
  _o.container = this.container();
  _o.sharedName = this.sharedName();
}
}

export class VarHandleOptionsT {
constructor(
  public container: string|Uint8Array|null = null,
  public sharedName: string|Uint8Array|null = null
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const container = (this.container !== null ? builder.createString(this.container!) : 0);
  const sharedName = (this.sharedName !== null ? builder.createString(this.sharedName!) : 0);

  return VarHandleOptions.createVarHandleOptions(builder,
    container,
    sharedName
  );
}
}
