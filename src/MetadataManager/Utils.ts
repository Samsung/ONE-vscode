import vscode from 'vscode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as flatbuffers from 'flatbuffers';
import * as Circle from '../CircleEditor/circle_schema_generated';

export function getStats(uri: vscode.Uri) {
  return new Promise(function(resolve, reject) {
    fs.stat(uri.fsPath, function(err, stats) {
      if (err) {
        return reject(err);
      }
        return resolve(stats);
    });
  });
}

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
