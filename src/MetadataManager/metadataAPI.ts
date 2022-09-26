import * as vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { obtainWorkspaceRoot } from '../Utils/Helpers';
import { PathToHash } from './pathToHash';
interface Relation{
    "selected": string,
    "relationData": Node[]
}

interface Node{
    "id": string,
    "parent": string,
    "representIdx": number,
    "dataList": Data[]
}

interface Data{
    "path": string,
    "name": string,
    "onecc_version"?: string,
    "toolchain_version"?: string
}

export class Metadata{
    private _disposables: vscode.Disposable[] = [];
    constructor() { }
    public static register(context: vscode.ExtensionContext): void {
        const registrations = [
            vscode.commands.registerCommand('one.metadata.showMetadata', async () => {

                const testPath: string = "2/3/testest.circle"; // workspace 기준 실제 파일 위치
                await Metadata.getFileInfo(testPath);
                // await Metadata.getRelationInfo(testPath);
            })
        ]

        registrations.forEach(disposable => {
            context.subscriptions.push(disposable);
        });
    }

    //get metadata of file by path
    public static async getFileInfo(path: string) {
        const instance = await PathToHash.getInstance();
        const hash = instance.getPathToHash(path);
        let metadata = await this.getMetadata(hash);
        return metadata[path];
    }

    // deactivate metadata
    public static async disableMetadata(pathOrUri: string|vscode.Uri) {
        // step 1. Get hash value from pathToHash
        // TODO: Get hash value from pathToHash
        const relativePath = typeof(pathOrUri) === 'string' ? pathOrUri : vscode.workspace.asRelativePath(pathOrUri);
        const hash = await Metadata.d_pathToHash(relativePath);
        // step 2. Find hash object with hash value
        const metadata = await Metadata.getMetadata(hash);
        // step 3. Check if the hash object has the deleted uri
        if(metadata) {
            const data = metadata[relativePath];
            if(data) {
                // step 4. If exists, deactivate (set deleted_time) that path.
                // FIXME: Do we need to deactivate it from pathToHash too? > If we deactivate pathToHash, if rename event came, we cannot specify what hash value the path is for.
                metadata[relativePath]["deleted_time"] = new Date();
                Metadata.setMetadata(hash, metadata);
            }
        }
    }

    // deactivate all metadata under the folder
    public static async disableMetadataUnderFolder(folderPath: string) {
        // if it is a folder, deactivate all of its child files
        Metadata.d_getFilesUnderDir(folderPath)?.forEach(f => {
            // NOTE: f should be a relative path here, but can be changed
            // FIXME: Do we need to use await keyword below?
            if (Metadata.d_isDir(f)) {
                Metadata.disableMetadataUnderFolder(f);
            } else {
                Metadata.disableMetadata(f);
            }
          });
    }

    public static async moveMetadata(oldPath: string, newPath: string) {
        const oldRelativePath = vscode.workspace.asRelativePath(oldPath);
        const newRelativePath = vscode.workspace.asRelativePath(newPath);
        // 1. Get hash from pathToHash
        // TODO: implement dummy function
        const hash = await Metadata.d_pathToHash(oldRelativePath);
        // 2. Get metadata
        const metadata = await Metadata.getMetadata(hash);
        const data = metadata[oldRelativePath];
        // 3. Move metadata
        delete metadata[oldRelativePath];
        metadata[newRelativePath] = data;
        Metadata.setMetadata(hash, metadata);
    }

    /**
     * Move metadata of the files and folders under the oldPath folder to the newPath folder
     * @param fromPath A absolute path string based on workspace (without workspace folder)
     * @param toPath A absolute path string based on workspace (without workspace folder)
     */
    public static async moveMetadataUnderFolder(fromPath: string, toPath: string) {
        const relativeToPath = vscode.workspace.asRelativePath(toPath);
        // const oldRelativePath = vscode.workspace.asRelativePath(oldPath);
        vscode.workspace.findFiles(`${relativeToPath}/**/*`).then(files => {
            files.forEach(file => {
                const fileToPath = file.path;
                const fileFromPath = fromPath + fileToPath.substring(fileToPath.lastIndexOf(toPath) + toPath.length);
                console.log('moveMetadataUnderFolder::', fileFromPath);
                if (Metadata.d_isDir(fileToPath)) {
                    Metadata.moveMetadataUnderFolder(fileFromPath, fileToPath);
                } else {
                    Metadata.moveMetadata(fileFromPath, fileToPath);
                }
            });
        });
    }

    //get metadata of file by path
    public static async getRelationInfo(path: string) {
        const instance = await PathToHash.getInstance();
        const nowHash = instance.getPathToHash(path);
        if (vscode.workspace.workspaceFolders === undefined) return;

        let relationUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, ".meta/relation.json");
        let relationJSON: JSON = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(relationUri)).toString());
        
        // 반환 객체 생성
        let relations: Relation = {
            "selected" :  "",
            "relationData" : []
        }

        // 현재 노드 메타데이터 불러오기

        let nowMetadata: JSON = await this.getMetadata(nowHash)

        relations.selected = nowHash

        relations.relationData.push({ "id": nowHash, "parent": relationJSON[nowHash].parent, "representIdx": 0, "dataList": this.getDataList(nowMetadata) })
       
    
        // 부모 노드 찾기
        let tempHash: string = relationJSON[nowHash].parent
        while (true) {
            
            if (!tempHash) {
                break;
            }
            else {

                let tempMetadata: JSON = await this.getMetadata(tempHash)
                
                relations.relationData.push({ "id": tempHash, "parent": relationJSON[tempHash].parent, "representIdx": 0, "dataList": this.getDataList(tempMetadata) })
                tempHash = relationJSON[tempHash].parent
            }
        }

        // 자식 노드 찾기
        let tempHashs: [] = relationJSON[nowHash].children
        while (true) {
            let hashs:[] = []
            if (tempHashs.length===0) {
                break;
            }
            else {
                
                for (let i = 0; i < tempHashs.length; i++){
                    let tempMetadata: JSON = await this.getMetadata(tempHashs[i])
                    
                    relations.relationData.push({ "id": tempHashs[i], "parent": relationJSON[tempHashs[i]].parent, "represent": 0, "dataList": this.getDataList(tempMetadata) })
                    hashs.push(...relationJSON[tempHashs[i]].children)
                }
                
                tempHashs = hashs
            }
        }

        console.log(relations)
        
        return relations

    }

    //get all Metadata of same hash object by hash
    public static async getMetadata(hash: string) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const metaUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);    
            return JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(metaUri)).toString())
        }
    }

    //set all Metadata of same hash object by hash
    public static async setMetadata(hash: string | undefined, value: object) { //.meta 기준 relative path [=== workspace assert 로직이 필요할 것 같다.]
        let workspaceroot=obtainWorkspaceRoot();
        if(hash){
            const Uri = vscode.Uri.joinPath(vscode.Uri.file(workspaceroot), `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);
            await vscode.workspace.fs.writeFile(Uri,Buffer.from(JSON.stringify(value),'utf8'));
        }
    }

    public static getDataList(metadata: JSON) {
        let dataList: Data[] = [];
        
        let keys = Object.keys(metadata);
        for (let i = 0; i < keys.length; i++){
            let element = metadata[keys[i]];
            let data: Data = {
                "path": keys[i],
                "name": element.name,
                "onecc_version": element.onecc_version,
                "toolchain_version": element.toolchain_version
            }

            dataList.push(data);
        }

        return dataList
    }


    // dummy functions
    public static d_isDir(path: string) {
        const dotIdx = path.lastIndexOf('.');
        const slashIdx = path.lastIndexOf('/');
        return slashIdx === path.length - 1 || dotIdx === -1 || dotIdx <= slashIdx;
    }

    public static d_getFilesUnderDir(path: string): string[] {
        if (Metadata.d_isDir(path)) {
          // FIXME: what will be returned when we call?
          return ['test/while_000.log', 'test/while_000 copy.log'];
        }
        return []; // 파일일 때
    }

    public static async d_pathToHash(relativePath: string) {
        return await Metadata.contentHash("while_000.log");/////////////////////////////////////////////////////////////To Semi : contentHash is removed
    }
}


