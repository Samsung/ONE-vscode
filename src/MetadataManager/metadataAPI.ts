import * as vscode from 'vscode';
import * as crypto from 'crypto';
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
}