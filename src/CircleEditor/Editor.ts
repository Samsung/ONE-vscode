/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as flexbuffers from "flatbuffers/js/flexbuffers";

import { Balloon } from "../Utils/Balloon";

import * as Circle from "./circle_schema_generated";
import * as Types from "./CircleType";

export interface Editor {
  edit(targetName: string, targetData: any): void;
}

export class AttributeEditor implements Editor {
  private _model: Circle.ModelT;
  private _subgraphIdx: number = -1;
  private _operatorIdx: number = -1;

  public constructor(model: Circle.ModelT) {
    this._model = model;
  }

  private guessExactNumberType(n: any) {
    if (isNaN(Number(n))) {
      return "error";
    }

    if (Number(n) % 1 === 0) {
      return "int";
    } else if (Number(n) % 1 !== 0) {
      return "float";
    } else {
      return "not supported type";
    }
  }

  public edit(inputBuiltinCode: string, attr: any): void {
    if (
      inputBuiltinCode === undefined ||
      this._subgraphIdx === -1 ||
      this._operatorIdx === -1
    ) {
      Balloon.error("input data is undefined", false);
      return;
    }
    const operator: any =
      this._model.subgraphs[this._subgraphIdx]?.operators[this._operatorIdx];
    if (operator === undefined) {
      Balloon.error("model is undefined", false);
      return;
    }

    let builtinCode: string = "";
    const builtinOpEnumKeys = Object.keys(Circle.BuiltinOperator).filter((k) =>
      isNaN(Number(k))
    );
    builtinOpEnumKeys.forEach((key) => {
      let opStr = key.split("_").join("").toUpperCase();
      if (opStr === inputBuiltinCode.toUpperCase()) {
        builtinCode = key;
      }
    });

    const COSTUM_OP_CODE: string = "CUSTOM";
    if (builtinCode === COSTUM_OP_CODE) {
      operator.builtinOptionsType = Circle.BuiltinOptions.NONE;
      operator.builtinOptions = null;

      const customKeys = attr.keys;
      let fbb = flexbuffers.builder();
      fbb.startMap();
      for (const key of customKeys) {
        fbb.addKey(key);
        const customValue = attr[key];
        const customValueType = attr[key + "_type"];
        switch (customValueType) {
          case "boolean": {
            if (customValue === "true" || customValue === true) {
              fbb.add(true);
            } else if (customValue === "false" || customValue === false) {
              fbb.add(false);
            } else {
              Balloon.error("'boolean' type must be 'true' or 'false'.", false);
              return;
            }
            break;
          }
          case "int": {
            const guessType = this.guessExactNumberType(customValue);
            if (guessType === "float") {
              Balloon.error("'int' type doesn't include decimal point.", false);
              return;
            } else if (
              guessType === "error" ||
              guessType === "not supported type"
            ) {
              Balloon.error("it's not a number", false);
              return;
            }
            fbb.addInt(Number(customValue));
            break;
          }
          default: {
            fbb.add(String(customValue));
          }
        }
      }
      fbb.end();
      let res = fbb.finish();
      operator.customOptions = Array.from(res);
    } else {
      /* builtinCode !== COSTUM_OP_CODE */
      let inputBuiltinCodeNormalized: any =
        inputBuiltinCode.toUpperCase() + "OPTIONS";
      // AVERAGE_POOL_2D, L2_POOL_2D, and MAX_POOL_2D all use Pool2DOptions
      if (inputBuiltinCodeNormalized.indexOf("POOL2D") !== -1) {
        inputBuiltinCodeNormalized = "POOL2DOPTIONS";
      }
      operator.builtinOptionsType =
        Types.BuiltinOptionsType[inputBuiltinCodeNormalized];
      const attrKey: any = attr.name;
      const attrValue: any = attr._value;
      const attrType: any = attr._type;
      let targetKey: any = null;

      let builtinOptionsKeyArr: any = null;
      let attrKeyNormalized: any = attrKey;
      attrKeyNormalized = attrKeyNormalized.replaceAll("_", "");
      attrKeyNormalized = attrKeyNormalized.toUpperCase();

      if (operator.builtinOptionsType === Circle.BuiltinOptions.NONE) {
        if (attr !== null) {
          Balloon.error(
            "This attribute does not belong to this operator",
            false
          );
        }
        return;
      } else {
        /* operator.builtinOptionsType !== Circle.BuiltinOptions.NONE */
        if (operator.builtinOptions === null) {
          Balloon.error(
            "This attribute does not belong to this operator",
            false
          );
          return;
        }
        builtinOptionsKeyArr = Object.keys(operator.builtinOptions).map((val) =>
          val.toUpperCase()
        );
        if (!builtinOptionsKeyArr.includes(attrKeyNormalized)) {
          Balloon.error(
            "This attribute does not belong to this operator",
            false
          );
          return;
        }
      }

      for (const obj in operator.builtinOptions) {
        if (obj.toUpperCase() === attrKeyNormalized.toUpperCase()) {
          targetKey = obj;
        }
      }

      const circleTypeKeys = Object.keys(Types.CircleType);
      // attrType is NormalType
      if (
        circleTypeKeys.find((element) => element === attrType) === undefined
      ) {
        switch (attrType) {
          case "int32[]":
          case "int16[]":
          case "uint32[]":
          case "uint16[]":
          case "float32[]":
          case "float64[]": {
            let editValue = attrValue;
            let lastCommaIdx = attrValue.lastIndexOf(",");
            let lastNumberIdx: number = attrValue.length - 1;
            for (let i = attrValue.length - 1; i >= 0; i--) {
              if (attrValue[i] >= "0" && attrValue[i] <= "9") {
                lastNumberIdx = i;
                break;
              }
            }
            if (lastCommaIdx > lastNumberIdx) {
              editValue = attrValue.slice(0, lastCommaIdx);
            }
            const valArr = editValue.split(",");
            const valNumArr = [];
            for (let i = 0; i < valArr.length; i++) {
              if (isNaN(Number(valArr[i]))) {
                Balloon.error(
                  "Check your input array! you didn't typed number",
                  false
                );
                return;
              }
              valNumArr.push(Number(valArr[i]));
            }
            const resArr = new Types.NormalType[attrType](valNumArr);
            operator.builtinOptions[targetKey] = resArr;
            break;
          }
          case "boolean": {
            if (attrValue === "false") {
              operator.builtinOptions[targetKey] = false;
            } else if (attrValue === "true") {
              operator.builtinOptions[targetKey] = true;
            } else {
              Balloon.error("'boolean' type must be 'true' or 'false'.", false);
              return;
            }
            break;
          }
          case "float":
          case "float16":
          case "float32":
          case "float64":
          case "epsilon": {
            operator.builtinOptions[targetKey] = parseFloat(attrValue);
            break;
          }
          case "string": {
            operator.builtinOptions[targetKey] = String(attrValue);
            break;
          }
          default: {
            if (isNaN(attrValue)) {
              Balloon.error("Check your input data.", false);
              return;
            }
            operator.builtinOptions[targetKey] =
              Types.NormalType[attrType](attrValue);
          }
        }
      } else {
        // attrType is CircleType
        operator.builtinOptions[targetKey] =
          Types.CircleType[attrType][attrValue];
      }
    }
  }

  public get subgraphIndex(): number {
    return this._subgraphIdx;
  }
  public set subgraphIndex(idx: number) {
    this._subgraphIdx = idx;
  }

  public get operatorIndex(): number {
    return this._operatorIdx;
  }
  public set operatorIndex(idx: number) {
    this._operatorIdx = idx;
  }
}

export class TensorEditor implements Editor {
  private _model: Circle.ModelT;
  private _subgraphIdx: number = -1;

  public constructor(model: Circle.ModelT) {
    this._model = model;
  }

  public edit(tensorName: string, args: any): void {
    if (tensorName === undefined || this._subgraphIdx === undefined) {
      Balloon.error("input data is undefined", false);
      return;
    }

    const argname: string = args._name;
    const tensorIdx: number = Number(args._location);
    let tensorType = args._type._dataType;
    let tensorShape = args._type._shape._dimensions;
    if (
      argname === undefined ||
      tensorIdx === undefined ||
      tensorType === undefined ||
      tensorShape === undefined
    ) {
      Balloon.error("input data is undefined", false);
      return;
    }

    const isChanged: boolean = args._isChanged;
    let bufferData: any = null;
    if (args._initializer !== null) {
      const ini = args._initializer;
      if (isChanged === true) {
        bufferData = ini._data;
      }
    }

    const targetTensor =
      this._model?.subgraphs[this._subgraphIdx]?.tensors[tensorIdx];
    if (targetTensor === undefined) {
      Balloon.error("model is undefined", false);
      return;
    }

    tensorType = tensorType.toUpperCase();
    if (tensorType === "BOOLEAN") {
      tensorType = "BOOL";
    }

    let tensorTypeNum: any = Circle.TensorType[tensorType];
    targetTensor.name = argname;
    targetTensor.type = tensorTypeNum;
    targetTensor.shape = tensorShape;
    if (bufferData !== null) {
      const editBufferIdx: number = targetTensor.buffer;
      this._model.buffers[editBufferIdx].data = bufferData;
    }
  }

  public get subgraphIndex(): number {
    return this._subgraphIdx;
  }
  public set subgraphIndex(idx: number) {
    this._subgraphIdx = idx;
  }
}
