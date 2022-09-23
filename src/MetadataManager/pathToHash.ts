import * as vscode from 'vscode';
import * as crypto from 'crypto';

export class PathToHash{
    private static instance: PathToHash;
    private pathToHash: any;

    private constructor() {
    }
    
    private async initPathToHash() {
        if (vscode.workspace.workspaceFolders === undefined) {
            return;
        }
        const uri = vscode.workspace.workspaceFolders[0].uri;

        const obj: {[key: string]: any} = {};
        const arrayList = await vscode.workspace.fs.readDirectory(uri);

        for (const array of arrayList) {
            const name: string = array[0];
            const type: number = array[1];
            
            if (type === 1) {  // 파일인 경우
                obj[name] = await this.generateHash(vscode.Uri.joinPath(uri,"/"+name));
            } else if (type === 2 && name !== '.meta') {
                const result = await this.rec(vscode.Uri.joinPath(uri, "/" + name));
                obj[name] = result;
            }
        }
        console.log(obj);
        return obj;
    }
    
    private async rec(uri: vscode.Uri) {
        const obj: {[key: string]: any} = {};
        let arrayList = await vscode.workspace.fs.readDirectory(uri);

        for (const array of arrayList) {
            const name: string = array[0];
            const type: number = array[1];
            
            if (type === 1) {  // 파일인 경우
                obj[name] = await this.generateHash(vscode.Uri.joinPath(uri, "/" + name));
            } else if (type === 2) {
                const result = await this.rec(vscode.Uri.joinPath(uri, "/" + name));
                obj[name] = result;
            }
        }

        return obj;
    }

    public static async getInstance() {
        if (!this.instance) {
            this.instance = new PathToHash();
            this.instance.pathToHash = await this.instance.initPathToHash();
        }
        return this.instance;
    }

    public getPathToHash(path: string ) {
        
        let pathArray = path.split('/');
        
        let temp = this.pathToHash;
        pathArray.forEach((data) => {
            temp = temp[data];
        });

        return temp;
    }


    private async generateHash(uri: vscode.Uri) {        
        return  crypto.createHash('sha256').update(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString()).digest('hex');
    }

}