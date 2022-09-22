import { type } from "os";

export interface responseModel{
    command: string;
    type: string;
    offset: number;
    length: number;
    total: number;
    responseArray: Uint8Array;
}

export interface requestMessage{
    command: string;
    type: string;
    data: string;
}