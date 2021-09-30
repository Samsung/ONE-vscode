import {BuiltinOperator} from '../circle-analysis/circle/builtin-operator';
import {Model} from '../circle-analysis/circle/model';

export function initBuiltInOperator(model: Model): Array<String> {
  let builtinCodes = [];

  for (let opcodeIdx = 0; opcodeIdx < model.operatorCodesLength(); opcodeIdx++) {
    builtinCodes[opcodeIdx] = BuiltinOperator[model.operatorCodes(opcodeIdx)!.builtinCode()];
  }

  return builtinCodes;
}
