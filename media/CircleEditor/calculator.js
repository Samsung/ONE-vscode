function calculate(num, c, b) {

    var buffer = new ArrayBuffer(b);
    var view = new DataView(buffer);

    switch (c) {
        case 0:
            view.setFloat32(0, num, true);
            break;
        case 1:
            view.setFloat16(0, num, true);
            break;
        case 2:
            view.setInt32(0, num, true);
            break;
        case 3:
            if(num < 0) { return; }
            view.setUint8(0, num, true);
            break;
        case 4:
            view.setBigInt64(0, BigInt(parseInt(String(num))), true);
            break;
        case 5:
            break;
        case 6:
            view.setInt32(0, num, true);
            break;
        case 7:
            view.setInt16(0, num, true);
            break;
        case 8:
            break;
        case 9:
            view.setInt8(0, num, true);
            break;
        case 10:
            view.setFloat64(0, num, true);
            break;
        case 11:
            break;
        case 12:
            if(num < 0) { return; }
            view.setBigUint64(0, BigInt(parseInt(String(num))), true);
            break;
        case 13:
            break;
        case 14:
            break;
        case 15:
            if(num < 0) { return; }
            view.setUInt32(0, num, true);
            break;
    }

    return view;

}

function calc(str, type) {
    const types = ['float32', 'float16', 'int32', 'uint8', 'int64', 'string', 'bool', 'int16',
    'complex64', 'int8', 'float64', 'complex128', 'uint64', 'resource', 'variant', 'uint32'];
    
    // 0:float, 1:int, 2:uint, 3:string, 4:boolean, 5:complex, 6:resource, 7:variant
    const typeclass = [0, 0, 1, 2, 1, 3, 4, 1, 5, 1, 0, 5, 2, 6, 7, 2];
    const bits = [32, 16, 32, 8, 64, 0, 32, 16, 64, 8, 64, 128, 64, 0, 0, 32];
    
    var typeIndex = types.indexOf(type.toLowerCase());
    
    let arr = str.split(',');
    let result = "";
    if(type === 'bool') {
        for (let i = 0; i< arr.length; i++) {
            if(arr[i].trim().toLowerCase() === 'true') {
                arr[i] = 1;
            } else if(arr[i].trim().toLowerCase() === 'false') {
                arr[i] = 0;
            } else {
                return "ERROR: Please enter in 'true' or 'false' format for boolean type."
            }
        }
    }
    for (let i = 0; i < arr.length; i++) {
        if(!/^\d+$/.test(arr[i])) {return "ERROR: Please enter digits and decimal points only.";}
        let v = calculate(parseFloat(arr[i]), typeIndex, bits[typeIndex]/8);
        if(!v) {
            return "ERROR: Data does not match type.";
        }else {
            for (let j = 0; j < v.byteLength; j++) {
                result += v.getUint8(j) +",";
            }
        }
    }
    result = result.slice(0,-1);
    return result;
}

// console.log(calc("1230.123154631, 1.24515514515, 555.25454545, -36655.451454", "int32"));
// console.log(calc("true, false, true, true, Faalse", "bool"));
console.log(calc("-132131234561235314235135115.1,true,123123", "bool"));
// console.log(calc("1123", "int32"));