import vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as flatbuffers from 'flatbuffers';
import * as Circle from '../../CircleEditor/circle_schema_generated';

export function isValidFile(uri: vscode.Uri): boolean {
  const path = uri.path;
  const ends = ['.pb', '.onnx', '.tflite', '.circle', '.cfg', '.log'];
  return ends.some((x) => path.endsWith(x));
}

export async function generateHash(uri: vscode.Uri) {
  // TODO: Error handling
  return crypto.createHash('sha256')
    .update(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString())
    .digest('hex');
}

export async function getOperators(uri: vscode.Uri) {
  if (!uri.fsPath.endsWith('.circle')) {
    return [];
  }
  const bytes = new Uint8Array(await vscode.workspace.fs.readFile(uri));
  const buf = new flatbuffers.ByteBuffer(bytes);
  const model = Circle.Model.getRootAsModel(buf).unpack();
  const operators = model.operatorCodes.map((operator) => {
    Circle.BuiltinOperator[operator.deprecatedBuiltinCode];
  });
  return operators;
}

export async function saveJson(name: string, data: any) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }

  const uri =
      vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta', name + '.json');
  await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 4), 'utf8'));
}

export async function readJson(name: string) {
  if (vscode.workspace.workspaceFolders === undefined) {
    return;
  }

  const uri =
      vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, '.meta', name + '.json');
  if (!fs.existsSync(uri.fsPath)) {
    await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify({}, null, 4), 'utf8'));
    return {};
  }
  const json: any = JSON.parse(Buffer.from(await vscode.workspace.fs.readFile(uri)).toString());
  return json;
}
