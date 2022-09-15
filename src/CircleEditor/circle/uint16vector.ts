// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class Uint16Vector {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):Uint16Vector {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsUint16Vector(bb:flatbuffers.ByteBuffer, obj?:Uint16Vector):Uint16Vector {
  return (obj || new Uint16Vector()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsUint16Vector(bb:flatbuffers.ByteBuffer, obj?:Uint16Vector):Uint16Vector {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new Uint16Vector()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

values(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.readUint16(this.bb!.__vector(this.bb_pos + offset) + index * 2) : 0;
}

valuesLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

valuesArray():Uint16Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? new Uint16Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

static startUint16Vector(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addValues(builder:flatbuffers.Builder, valuesOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, valuesOffset, 0);
}

static createValuesVector(builder:flatbuffers.Builder, data:number[]|Uint16Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createValuesVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createValuesVector(builder:flatbuffers.Builder, data:number[]|Uint16Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(2, data.length, 2);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt16(data[i]!);
  }
  return builder.endVector();
}

static startValuesVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(2, numElems, 2);
}

static endUint16Vector(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createUint16Vector(builder:flatbuffers.Builder, valuesOffset:flatbuffers.Offset):flatbuffers.Offset {
  Uint16Vector.startUint16Vector(builder);
  Uint16Vector.addValues(builder, valuesOffset);
  return Uint16Vector.endUint16Vector(builder);
}

unpack(): Uint16VectorT {
  return new Uint16VectorT(
    this.bb!.createScalarList(this.values.bind(this), this.valuesLength())
  );
}


unpackTo(_o: Uint16VectorT): void {
  _o.values = this.bb!.createScalarList(this.values.bind(this), this.valuesLength());
}
}

export class Uint16VectorT {
constructor(
  public values: (number)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const values = Uint16Vector.createValuesVector(builder, this.values);

  return Uint16Vector.createUint16Vector(builder,
    values
  );
}
}
