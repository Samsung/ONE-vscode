// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import {ActivationFunctionType} from '../circle/activation-function-type';


export class BidirectionalSequenceRNNOptions {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): BidirectionalSequenceRNNOptions {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsBidirectionalSequenceRNNOptions(
      bb: flatbuffers.ByteBuffer,
      obj?: BidirectionalSequenceRNNOptions): BidirectionalSequenceRNNOptions {
    return (obj || new BidirectionalSequenceRNNOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsBidirectionalSequenceRNNOptions(
      bb: flatbuffers.ByteBuffer,
      obj?: BidirectionalSequenceRNNOptions): BidirectionalSequenceRNNOptions {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new BidirectionalSequenceRNNOptions())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  timeMajor(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  fusedActivationFunction(): ActivationFunctionType {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.readInt8(this.bb_pos + offset) : ActivationFunctionType.NONE;
  }

  mergeOutputs(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  asymmetricQuantizeInputs(): boolean {
    const offset = this.bb!.__offset(this.bb_pos, 10);
    return offset ? !!this.bb!.readInt8(this.bb_pos + offset) : false;
  }

  static startBidirectionalSequenceRNNOptions(builder: flatbuffers.Builder) {
    builder.startObject(4);
  }

  static addTimeMajor(builder: flatbuffers.Builder, timeMajor: boolean) {
    builder.addFieldInt8(0, +timeMajor, +false);
  }

  static addFusedActivationFunction(
      builder: flatbuffers.Builder, fusedActivationFunction: ActivationFunctionType) {
    builder.addFieldInt8(1, fusedActivationFunction, ActivationFunctionType.NONE);
  }

  static addMergeOutputs(builder: flatbuffers.Builder, mergeOutputs: boolean) {
    builder.addFieldInt8(2, +mergeOutputs, +false);
  }

  static addAsymmetricQuantizeInputs(
      builder: flatbuffers.Builder, asymmetricQuantizeInputs: boolean) {
    builder.addFieldInt8(3, +asymmetricQuantizeInputs, +false);
  }

  static endBidirectionalSequenceRNNOptions(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createBidirectionalSequenceRNNOptions(
      builder: flatbuffers.Builder, timeMajor: boolean,
      fusedActivationFunction: ActivationFunctionType, mergeOutputs: boolean,
      asymmetricQuantizeInputs: boolean): flatbuffers.Offset {
    BidirectionalSequenceRNNOptions.startBidirectionalSequenceRNNOptions(builder);
    BidirectionalSequenceRNNOptions.addTimeMajor(builder, timeMajor);
    BidirectionalSequenceRNNOptions.addFusedActivationFunction(builder, fusedActivationFunction);
    BidirectionalSequenceRNNOptions.addMergeOutputs(builder, mergeOutputs);
    BidirectionalSequenceRNNOptions.addAsymmetricQuantizeInputs(builder, asymmetricQuantizeInputs);
    return BidirectionalSequenceRNNOptions.endBidirectionalSequenceRNNOptions(builder);
  }
}
