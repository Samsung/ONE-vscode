export interface ResponseModel{
    command: string;
    type: string;
    offset: number;
    length: number;
    total: number;
    responseArray: Uint8Array;
    subgraphIdx?: number;
    nodeIdx?: number;
}

export interface RequestMessage{
    command: string;
    type: string;
    data: any;
}

export interface CustomInfoMessage{
    command: string;
    data: any;
    subgraphIdx?: number;
    nodeIdx?: number;
}

export interface ResponseModelPath{
    command: string,
    type: string,
    value: string
}

export interface ResponseFileRequest{
    command: string,
    response: string,
}