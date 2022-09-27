import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { ConsoleReporter } from '@vscode/test-electron';

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

    public getPathToHash(uri: vscode.Uri ) {
        let path = vscode.workspace.asRelativePath(uri);
        let pathArray = path.split('/');
        let temp = this.pathToHash;

        pathArray.forEach((data) => {

            if (temp === undefined) {
                return undefined;
            }
            temp = temp[data];
        });

        return temp;
    }


    private async generateHash(uri: vscode.Uri) {        
        return  crypto.createHash('sha256').update(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString()).digest('hex');
    }

    public isFile(uri: vscode.Uri): boolean {
        const relativeFolderPath = vscode.workspace.asRelativePath(uri);
        console.log(`PathToHash::isFile():: relativeFolderPath=${relativeFolderPath}`);
        const hash = this.getPathToHash(uri);
        console.log(typeof(hash) === 'string');
        return typeof(hash) === 'string';
    }

    public exists(uri: vscode.Uri): boolean {
        return this.getPathToHash(uri) !== undefined;
    }

    public getFilesUnderFolder(uri: vscode.Uri): vscode.Uri[] {
        const relativeFolderPath = vscode.workspace.asRelativePath(uri);
        console.log(`PathToHash::getFilesUnderFolder():: relativeFolderPath=${relativeFolderPath}`);
        const folder = this.getPathToHash(uri);
        const files: vscode.Uri[] = [];
        if (typeof (folder) === 'string') {
            // not a folder
            console.log(`PathToHash::getFilesUnderFolder()::${relativeFolderPath} is not a folder`);
            return files;
        }
        for (const name in folder) {
            console.log(`PathToHash::getFilesUnderFolder():: name=${name}`);
            files.push(vscode.Uri.joinPath(uri, name));
        }

        return files;
    }

    // TODO: optimise the function (deal with files under a folder at once, etc)
    public async addPath(uri: vscode.Uri) {
        const path = vscode.workspace.asRelativePath(uri);
        const paths = path.split('/');
        let content: any = await this.generateHash(uri);
        console.log(`PathToHash::addPath: paths=${paths}`);
        let obj = this.pathToHash;
        let idx = 0;
        for (let path = paths[idx]; idx < paths.length - 1; path = paths[++idx]) {
            if (!obj[path]) {break;}
            obj = obj[path];
        }
        if (paths.length - 1 === idx) { // paths.length - 1: index of a file name
            // When all of the folder path are stored in pathToHash
            // update / create pathToHash for a file
            obj[paths[idx]] = content;
            return;
        }

        for (let i = paths.length - 1; i > idx; --i) {
            let obj2: {[key: string]: any} = {};
            obj2[paths[i]] = content;
            content = obj2;
        }
        obj[paths[idx]] = content;
    }

    public deletePath(uri: vscode.Uri) {
        // console.log('PathToHash::deletePath=================');
        // console.log(uri);
        const path = vscode.workspace.asRelativePath(uri);
        const paths = path.split('/');

        let obj = this.pathToHash;
        for (let i = 0, path = paths[i]; i < paths.length - 1; path = paths[++i]) {
            if (!obj) {
                return;
            }
            obj = obj[path];
        }
        if (obj === undefined) {
            // already deleted
            return;
        }
        // console.log(`1. pathToHash =`);
        // console.log(this.pathToHash);
        delete obj[paths[paths.length-1]];
        // console.log(`2. pathToHash (after deleting the file ${paths[paths.length-1]}) =`);
        // console.log(this.pathToHash);
        if (paths.length > 1) {
            this.deleteEmptyFolder(this.pathToHash, paths, 0);
        }
        // console.log(`3. pathToHash (after deleting empty folders) =`);
        // console.log(this.pathToHash);
    }

    private deleteEmptyFolder(parent: any, paths: string[], idx: number) {
        const path = paths[idx];
        if (paths.length - 2 === idx) {
            if (Object.keys(parent[path]).length === 0) {
                delete parent[path];
            }
            return;
        }
        if (parent[path] === undefined) {
            return;
        }
        this.deleteEmptyFolder(parent[path], paths, idx + 1);
        if (Object.keys(parent[path]).length === 0) {
            delete parent[path];
        }
    }
}