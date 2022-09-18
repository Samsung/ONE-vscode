import * as vscode from 'vscode';

export class Metadata{

    private _disposables: vscode.Disposable[] = [];
    constructor() { }
    public static register(context: vscode.ExtensionContext): void {
        const registrations = [
            vscode.commands.registerCommand('one.metadata.showMetadata', async () => {

                const testPath :string = "./model.tflite" // workspace 기준 실제 파일 위치
                await Metadata.getMetadata(context, testPath);
            })
        ]

        registrations.forEach(disposable => {
            context.subscriptions.push(disposable);
        });
    }

    
    public static getMetadata(context: vscode.ExtensionContext, uri: string) {
        // uri를 통해 hash 값 가져오는 로직 필요 




        // - pathToHash 의 접근 방식 미정으로 예시 hash 파일 설정
        const hash = "9f8641056d4e2eb03830f3c1bbb6c71ca6e820f6da94bf7055b132b8d2e6a2b5"
        const metaUri =
            vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, `.meta/hash_objects/${hash.substring(0, 2)}/${hash.substring(2)}.json`);
        
        
        vscode.workspace.fs.readFile(metaUri).then((success) => {
            
            let metadata = Buffer.from(success).toString();  
            console.log(JSON.parse(metadata));
            return metadata;
        }); 

    }
}


