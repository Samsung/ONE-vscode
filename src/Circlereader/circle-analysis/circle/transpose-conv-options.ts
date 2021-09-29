// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { Padding } from '../circle/padding';


export class TransposeConvOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):TransposeConvOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsTransposeConvOptions(bb:flatbuffers.ByteBuffer, obj?:TransposeConvOptions):TransposeConvOptions {
  return (obj || new TransposeConvOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsTransposeConvOptions(bb:flatbuffers.ByteBuffer, obj?:TransposeConvOptions):TransposeConvOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new TransposeConvOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

padding():Padding {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : Padding.SAME;
}

strideW():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

strideH():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
}

static startTransposeConvOptions(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addPadding(builder:flatbuffers.Builder, padding:Padding) {
  builder.addFieldInt8(0, padding, Padding.SAME);
}

static addStrideW(builder:flatbuffers.Builder, strideW:number) {
  builder.addFieldInt32(1, strideW, 0);
}

static addStrideH(builder:flatbuffers.Builder, strideH:number) {
  builder.addFieldInt32(2, strideH, 0);
}

static endTransposeConvOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createTransposeConvOptions(builder:flatbuffers.Builder, padding:Padding, strideW:number, strideH:number):flatbuffers.Offset {
  TransposeConvOptions.startTransposeConvOptions(builder);
  TransposeConvOptions.addPadding(builder, padding);
  TransposeConvOptions.addStrideW(builder, strideW);
  TransposeConvOptions.addStrideH(builder, strideH);
  return TransposeConvOptions.endTransposeConvOptions(builder);
}
}
