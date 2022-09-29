export interface ResponseModel {
    command: string;
    type: string;
    offset: number;
    length: number;
    total: number;
    responseArray: Uint8Array;
}

export interface RequestMessage {
    command: string;
    type: string;
    data: any;
}

export interface CustomInfoMessage {
    command: string;
    data: any;
}

export interface ResponseModelPath {
    command: string;
    type: string;
    value: string;
}

export interface ResponseFileRequest {
    command: string;
    response: string;
}

export interface ResponseJson {
    command: string;
    data: string;
}