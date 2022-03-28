/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode';

export class CompilableFile {
  /**
   * Sets the list of file extension into context named 'ctxName'
   * @param ctxName the name of vscode context
   */
  public static setFileExtContext(ctxName: string): void {
    // TODO Consider supporting *.pth later
    vscode.commands.executeCommand('setContext', ctxName, ['.pb', '.tflite', '.onnx']);
  }

  /**
   * Sets the list of directory names into context named 'ctxName'
   * @param ctxName the name of vscode context
   */
  public static setDirContext(ctxName: string): void {
    let dirList: string[] = [];

    /*
    Cases:

    case A) When vscode runs on Windows and workspace is on Linux
    case B) When vscode runs on Linux and workspace is on Linux
    case C) When vscode and workspace is in Windows
    case D) When vscode and workspace is in Linux

    vscode context values in the above three cases are:

       context name   |    case A        |     case B     |     case C     |     case D
       ---------------|------------------|----------------|----------------|----------------
       isLinux        |      false       |       ?        |       ?        |       ?
       isWindows      |       true       |       ?        |       ?        |       ?
       resourceScheme | "vscode-remote"  |       ?        |       ?        |       ?
       resourcePath   | "\\tmp\\foo"     |       ?        |       ?        |       ?

    Case A) was investigated to check possibility in draft. As you can see, path separator is in
    Windows format while path exists in Linux.

    TODO Investigate case B and case C and fill the above table

    TODO iterate directory in workspace and search dirs that contains Keras model and saved model

    TODO Check if this instance of extension runs in case A, B or C

    In case of case A), call

        dirList.push(`\\tmp//foo`);
    */
    vscode.commands.executeCommand('setContext', ctxName, dirList);
  }
}
