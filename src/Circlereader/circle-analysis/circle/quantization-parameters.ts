// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import {QuantizationDetails, unionListToQuantizationDetails, unionToQuantizationDetails} from '../circle/quantization-details';


export class QuantizationParameters {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): QuantizationParameters {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsQuantizationParameters(bb: flatbuffers.ByteBuffer, obj?: QuantizationParameters):
      QuantizationParameters {
    return (obj || new QuantizationParameters())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsQuantizationParameters(
      bb: flatbuffers.ByteBuffer, obj?: QuantizationParameters): QuantizationParameters {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new QuantizationParameters())
        .__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  min(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readFloat32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  minLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  minArray(): Float32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? new Float32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  max(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.readFloat32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  maxLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  maxArray(): Float32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? new Float32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  scale(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? this.bb!.readFloat32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  scaleLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  scaleArray(): Float32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? new Float32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  zeroPoint(index: number): flatbuffers.Long|null {
    const offset = this.bb!.__offset(this.bb_pos, 10);
    return offset ? this.bb!.readInt64(this.bb!.__vector(this.bb_pos + offset) + index * 8) :
                    this.bb!.createLong(0, 0);
  }

  zeroPointLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 10);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  detailsType(): QuantizationDetails {
    const offset = this.bb!.__offset(this.bb_pos, 12);
    return offset ? this.bb!.readUint8(this.bb_pos + offset) : QuantizationDetails.NONE;
  }

  details<T extends flatbuffers.Table>(obj: any): any|null {
    const offset = this.bb!.__offset(this.bb_pos, 14);
    return offset ? this.bb!.__union(obj, this.bb_pos + offset) : null;
  }

  quantizedDimension(): number {
    const offset = this.bb!.__offset(this.bb_pos, 16);
    return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
  }

  static startQuantizationParameters(builder: flatbuffers.Builder) {
    builder.startObject(7);
  }

  static addMin(builder: flatbuffers.Builder, minOffset: flatbuffers.Offset) {
    builder.addFieldOffset(0, minOffset, 0);
  }

  static createMinVector(builder: flatbuffers.Builder, data: number[]|Float32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createMinVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createMinVector(builder: flatbuffers.Builder, data: number[]|Float32Array|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]!);
    }
    return builder.endVector();
  }

  static startMinVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static addMax(builder: flatbuffers.Builder, maxOffset: flatbuffers.Offset) {
    builder.addFieldOffset(1, maxOffset, 0);
  }

  static createMaxVector(builder: flatbuffers.Builder, data: number[]|Float32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createMaxVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createMaxVector(builder: flatbuffers.Builder, data: number[]|Float32Array|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]!);
    }
    return builder.endVector();
  }

  static startMaxVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static addScale(builder: flatbuffers.Builder, scaleOffset: flatbuffers.Offset) {
    builder.addFieldOffset(2, scaleOffset, 0);
  }

  static createScaleVector(builder: flatbuffers.Builder, data: number[]|Float32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createScaleVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createScaleVector(builder: flatbuffers.Builder, data: number[]|Float32Array|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addFloat32(data[i]!);
    }
    return builder.endVector();
  }

  static startScaleVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static addZeroPoint(builder: flatbuffers.Builder, zeroPointOffset: flatbuffers.Offset) {
    builder.addFieldOffset(3, zeroPointOffset, 0);
  }

  static createZeroPointVector(builder: flatbuffers.Builder, data: flatbuffers.Long[]):
      flatbuffers.Offset {
    builder.startVector(8, data.length, 8);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt64(data[i]!);
    }
    return builder.endVector();
  }

  static startZeroPointVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(8, numElems, 8);
  }

  static addDetailsType(builder: flatbuffers.Builder, detailsType: QuantizationDetails) {
    builder.addFieldInt8(4, detailsType, QuantizationDetails.NONE);
  }

  static addDetails(builder: flatbuffers.Builder, detailsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(5, detailsOffset, 0);
  }

  static addQuantizedDimension(builder: flatbuffers.Builder, quantizedDimension: number) {
    builder.addFieldInt32(6, quantizedDimension, 0);
  }

  static endQuantizationParameters(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createQuantizationParameters(
      builder: flatbuffers.Builder, minOffset: flatbuffers.Offset, maxOffset: flatbuffers.Offset,
      scaleOffset: flatbuffers.Offset, zeroPointOffset: flatbuffers.Offset,
      detailsType: QuantizationDetails, detailsOffset: flatbuffers.Offset,
      quantizedDimension: number): flatbuffers.Offset {
    QuantizationParameters.startQuantizationParameters(builder);
    QuantizationParameters.addMin(builder, minOffset);
    QuantizationParameters.addMax(builder, maxOffset);
    QuantizationParameters.addScale(builder, scaleOffset);
    QuantizationParameters.addZeroPoint(builder, zeroPointOffset);
    QuantizationParameters.addDetailsType(builder, detailsType);
    QuantizationParameters.addDetails(builder, detailsOffset);
    QuantizationParameters.addQuantizedDimension(builder, quantizedDimension);
    return QuantizationParameters.endQuantizationParameters(builder);
  }
}
