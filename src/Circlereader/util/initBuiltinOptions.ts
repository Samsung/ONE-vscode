import { BuiltinOperator } from '../circle-analysis/circle/builtin-operator';
import { Model } from '../circle-analysis/circle/model';

export function initBuiltInOperator(model: Model):Array<String> {
    let builtinCodes = [];

    for(let opcode_idx=0; opcode_idx<model.operatorCodesLength();opcode_idx++){
        builtinCodes[opcode_idx] = BuiltinOperator[model.operatorCodes(opcode_idx)!.builtinCode()];
    }

    return builtinCodes;
}