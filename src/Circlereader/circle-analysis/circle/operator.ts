// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import {BuiltinOptions, unionListToBuiltinOptions, unionToBuiltinOptions} from '../circle/builtin-options';
import {CustomOptionsFormat} from '../circle/custom-options-format';


export class Operator {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i: number, bb: flatbuffers.ByteBuffer): Operator {
    this.bb_pos = i;
    this.bb = bb;
    return this;
  }

  static getRootAsOperator(bb: flatbuffers.ByteBuffer, obj?: Operator): Operator {
    return (obj || new Operator()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  static getSizePrefixedRootAsOperator(bb: flatbuffers.ByteBuffer, obj?: Operator): Operator {
    bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
    return (obj || new Operator()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
  }

  opcodeIndex(): number {
    const offset = this.bb!.__offset(this.bb_pos, 4);
    return offset ? this.bb!.readUint32(this.bb_pos + offset) : 0;
  }

  inputs(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  inputsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  inputsArray(): Int32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 6);
    return offset ? new Int32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  outputs(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  outputsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  outputsArray(): Int32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 8);
    return offset ? new Int32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  builtinOptionsType(): BuiltinOptions {
    const offset = this.bb!.__offset(this.bb_pos, 10);
    return offset ? this.bb!.readUint8(this.bb_pos + offset) : BuiltinOptions.NONE;
  }

  builtinOptions<T extends flatbuffers.Table>(obj: any): any|null {
    const offset = this.bb!.__offset(this.bb_pos, 12);
    return offset ? this.bb!.__union(obj, this.bb_pos + offset) : null;
  }

  customOptions(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 14);
    return offset ? this.bb!.readUint8(this.bb!.__vector(this.bb_pos + offset) + index) : 0;
  }

  customOptionsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 14);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  customOptionsArray(): Uint8Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 14);
    return offset ? new Uint8Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  customOptionsFormat(): CustomOptionsFormat {
    const offset = this.bb!.__offset(this.bb_pos, 16);
    return offset ? this.bb!.readInt8(this.bb_pos + offset) : CustomOptionsFormat.FLEXBUFFERS;
  }

  mutatingVariableInputs(index: number): boolean|null {
    const offset = this.bb!.__offset(this.bb_pos, 18);
    return offset ? !!this.bb!.readInt8(this.bb!.__vector(this.bb_pos + offset) + index) : false;
  }

  mutatingVariableInputsLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 18);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  mutatingVariableInputsArray(): Int8Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 18);
    return offset ? new Int8Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  intermediates(index: number): number|null {
    const offset = this.bb!.__offset(this.bb_pos, 20);
    return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
  }

  intermediatesLength(): number {
    const offset = this.bb!.__offset(this.bb_pos, 20);
    return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
  }

  intermediatesArray(): Int32Array|null {
    const offset = this.bb!.__offset(this.bb_pos, 20);
    return offset ? new Int32Array(
                        this.bb!.bytes().buffer,
                        this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset),
                        this.bb!.__vector_len(this.bb_pos + offset)) :
                    null;
  }

  static startOperator(builder: flatbuffers.Builder) {
    builder.startObject(9);
  }

  static addOpcodeIndex(builder: flatbuffers.Builder, opcodeIndex: number) {
    builder.addFieldInt32(0, opcodeIndex, 0);
  }

  static addInputs(builder: flatbuffers.Builder, inputsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(1, inputsOffset, 0);
  }

  static createInputsVector(builder: flatbuffers.Builder, data: number[]|Int32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createInputsVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createInputsVector(builder: flatbuffers.Builder, data: number[]|Int32Array|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]!);
    }
    return builder.endVector();
  }

  static startInputsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static addOutputs(builder: flatbuffers.Builder, outputsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(2, outputsOffset, 0);
  }

  static createOutputsVector(builder: flatbuffers.Builder, data: number[]|Int32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createOutputsVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createOutputsVector(builder: flatbuffers.Builder, data: number[]|Int32Array|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]!);
    }
    return builder.endVector();
  }

  static startOutputsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static addBuiltinOptionsType(builder: flatbuffers.Builder, builtinOptionsType: BuiltinOptions) {
    builder.addFieldInt8(3, builtinOptionsType, BuiltinOptions.NONE);
  }

  static addBuiltinOptions(builder: flatbuffers.Builder, builtinOptionsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(4, builtinOptionsOffset, 0);
  }

  static addCustomOptions(builder: flatbuffers.Builder, customOptionsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(5, customOptionsOffset, 0);
  }

  static createCustomOptionsVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset {
    builder.startVector(1, data.length, 1);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt8(data[i]!);
    }
    return builder.endVector();
  }

  static startCustomOptionsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(1, numElems, 1);
  }

  static addCustomOptionsFormat(
      builder: flatbuffers.Builder, customOptionsFormat: CustomOptionsFormat) {
    builder.addFieldInt8(6, customOptionsFormat, CustomOptionsFormat.FLEXBUFFERS);
  }

  static addMutatingVariableInputs(
      builder: flatbuffers.Builder, mutatingVariableInputsOffset: flatbuffers.Offset) {
    builder.addFieldOffset(7, mutatingVariableInputsOffset, 0);
  }

  static createMutatingVariableInputsVector(builder: flatbuffers.Builder, data: boolean[]):
      flatbuffers.Offset {
    builder.startVector(1, data.length, 1);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt8(+data[i]!);
    }
    return builder.endVector();
  }

  static startMutatingVariableInputsVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(1, numElems, 1);
  }

  static addIntermediates(builder: flatbuffers.Builder, intermediatesOffset: flatbuffers.Offset) {
    builder.addFieldOffset(8, intermediatesOffset, 0);
  }

  static createIntermediatesVector(builder: flatbuffers.Builder, data: number[]|Int32Array):
      flatbuffers.Offset;
  /**
   * @deprecated This Uint8Array overload will be removed in the future.
   */
  static createIntermediatesVector(builder: flatbuffers.Builder, data: number[]|Uint8Array):
      flatbuffers.Offset;
  static createIntermediatesVector(
      builder: flatbuffers.Builder, data: number[]|Int32Array|Uint8Array): flatbuffers.Offset {
    builder.startVector(4, data.length, 4);
    for (let i = data.length - 1; i >= 0; i--) {
      builder.addInt32(data[i]!);
    }
    return builder.endVector();
  }

  static startIntermediatesVector(builder: flatbuffers.Builder, numElems: number) {
    builder.startVector(4, numElems, 4);
  }

  static endOperator(builder: flatbuffers.Builder): flatbuffers.Offset {
    const offset = builder.endObject();
    return offset;
  }

  static createOperator(
      builder: flatbuffers.Builder, opcodeIndex: number, inputsOffset: flatbuffers.Offset,
      outputsOffset: flatbuffers.Offset, builtinOptionsType: BuiltinOptions,
      builtinOptionsOffset: flatbuffers.Offset, customOptionsOffset: flatbuffers.Offset,
      customOptionsFormat: CustomOptionsFormat, mutatingVariableInputsOffset: flatbuffers.Offset,
      intermediatesOffset: flatbuffers.Offset): flatbuffers.Offset {
    Operator.startOperator(builder);
    Operator.addOpcodeIndex(builder, opcodeIndex);
    Operator.addInputs(builder, inputsOffset);
    Operator.addOutputs(builder, outputsOffset);
    Operator.addBuiltinOptionsType(builder, builtinOptionsType);
    Operator.addBuiltinOptions(builder, builtinOptionsOffset);
    Operator.addCustomOptions(builder, customOptionsOffset);
    Operator.addCustomOptionsFormat(builder, customOptionsFormat);
    Operator.addMutatingVariableInputs(builder, mutatingVariableInputsOffset);
    Operator.addIntermediates(builder, intermediatesOffset);
    return Operator.endOperator(builder);
  }
}
