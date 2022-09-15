// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { ActivationFunctionType } from '../circle/activation-function-type';


export class BidirectionalSequenceLSTMOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):BidirectionalSequenceLSTMOptions {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsBidirectionalSequenceLSTMOptions(bb:flatbuffers.ByteBuffer, obj?:BidirectionalSequenceLSTMOptions):BidirectionalSequenceLSTMOptions {
  return (obj || new BidirectionalSequenceLSTMOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsBidirectionalSequenceLSTMOptions(bb:flatbuffers.ByteBuffer, obj?:BidirectionalSequenceLSTMOptions):BidirectionalSequenceLSTMOptions {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new BidirectionalSequenceLSTMOptions()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

fusedActivationFunction():ActivationFunctionType {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readInt8(this.bb_pos + offset) : ActivationFunctionType.NONE;
}

cellClip():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 0.0;
}

projClip():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 0.0;
}

mergeOutputs():boolean {
  const offset = this.bb!.__offset(this.bb_pos, 10);
  return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
}

timeMajor():boolean {
  const offset = this.bb!.__offset(this.bb_pos, 12);
  return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : true;
}

asymmetricQuantizeInputs():boolean {
  const offset = this.bb!.__offset(this.bb_pos, 14);
  return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
}

static startBidirectionalSequenceLSTMOptions(builder:flatbuffers.Builder) {
  builder.startObject(6);
}

static addFusedActivationFunction(builder:flatbuffers.Builder, fusedActivationFunction:ActivationFunctionType) {
  builder.addFieldInt8(0, fusedActivationFunction, ActivationFunctionType.NONE);
}

static addCellClip(builder:flatbuffers.Builder, cellClip:number) {
  builder.addFieldFloat32(1, cellClip, 0.0);
}

static addProjClip(builder:flatbuffers.Builder, projClip:number) {
  builder.addFieldFloat32(2, projClip, 0.0);
}

static addMergeOutputs(builder:flatbuffers.Builder, mergeOutputs:boolean) {
  builder.addFieldInt8(3, +mergeOutputs, +false);
}

static addTimeMajor(builder:flatbuffers.Builder, timeMajor:boolean) {
  builder.addFieldInt8(4, +timeMajor, +true);
}

static addAsymmetricQuantizeInputs(builder:flatbuffers.Builder, asymmetricQuantizeInputs:boolean) {
  builder.addFieldInt8(5, +asymmetricQuantizeInputs, +false);
}

static endBidirectionalSequenceLSTMOptions(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createBidirectionalSequenceLSTMOptions(builder:flatbuffers.Builder, fusedActivationFunction:ActivationFunctionType, cellClip:number, projClip:number, mergeOutputs:boolean, timeMajor:boolean, asymmetricQuantizeInputs:boolean):flatbuffers.Offset {
  BidirectionalSequenceLSTMOptions.startBidirectionalSequenceLSTMOptions(builder);
  BidirectionalSequenceLSTMOptions.addFusedActivationFunction(builder, fusedActivationFunction);
  BidirectionalSequenceLSTMOptions.addCellClip(builder, cellClip);
  BidirectionalSequenceLSTMOptions.addProjClip(builder, projClip);
  BidirectionalSequenceLSTMOptions.addMergeOutputs(builder, mergeOutputs);
  BidirectionalSequenceLSTMOptions.addTimeMajor(builder, timeMajor);
  BidirectionalSequenceLSTMOptions.addAsymmetricQuantizeInputs(builder, asymmetricQuantizeInputs);
  return BidirectionalSequenceLSTMOptions.endBidirectionalSequenceLSTMOptions(builder);
}

unpack(): BidirectionalSequenceLSTMOptionsT {
  return new BidirectionalSequenceLSTMOptionsT(
    this.fusedActivationFunction(),
    this.cellClip(),
    this.projClip(),
    this.mergeOutputs(),
    this.timeMajor(),
    this.asymmetricQuantizeInputs()
  );
}


unpackTo(_o: BidirectionalSequenceLSTMOptionsT): void {
  _o.fusedActivationFunction = this.fusedActivationFunction();
  _o.cellClip = this.cellClip();
  _o.projClip = this.projClip();
  _o.mergeOutputs = this.mergeOutputs();
  _o.timeMajor = this.timeMajor();
  _o.asymmetricQuantizeInputs = this.asymmetricQuantizeInputs();
}
}

export class BidirectionalSequenceLSTMOptionsT {
constructor(
  public fusedActivationFunction: ActivationFunctionType = ActivationFunctionType.NONE,
  public cellClip: number = 0.0,
  public projClip: number = 0.0,
  public mergeOutputs: boolean = false,
  public timeMajor: boolean = true,
  public asymmetricQuantizeInputs: boolean = false
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return BidirectionalSequenceLSTMOptions.createBidirectionalSequenceLSTMOptions(builder,
    this.fusedActivationFunction,
    this.cellClip,
    this.projClip,
    this.mergeOutputs,
    this.timeMajor,
    this.asymmetricQuantizeInputs
  );
}
}
