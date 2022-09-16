import * as flatbuffers from "flatbuffers";
import * as Circle from "./circle_schema_generated";
import * as fs from "fs";

export class FlatBuffersUtil { //ModelDto
    ModelObj: Circle.ModelT;
    static Util: FlatBuffersUtil;
    
    private constructor(bytes: Uint8Array) {
        this.ModelObj = this.loadModel(bytes);
    }

    public static getFlatBuffersUtil(bytes: Uint8Array): FlatBuffersUtil{
        if(this.Util!=null){
            return this.Util;
        }
        return new FlatBuffersUtil(bytes);
    }
    
    loadModel(bytes: Uint8Array): Circle.ModelT{

        //let bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
        let buf = new flatbuffers.ByteBuffer(bytes);
        this.ModelObj = Circle.Model.getRootAsModel(buf).unpack();
        
        return this.ModelObj;
    }

    saveModel(): Circle.ModelT{
        
        let fbb = new flatbuffers.Builder(1024);
        Circle.Model.finishModelBuffer(fbb, this.ModelObj.pack(fbb));
        fs.writeFileSync('circleTest.circle', fbb.asUint8Array(), 'binary');

        return this.ModelObj;
    }

    //getter, setter
}