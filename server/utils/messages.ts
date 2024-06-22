import { Service } from './service';

export interface RequestMessage {
    client_name: Service
    client_request: WarehouseServiceMessages
    input: string
}

export interface ResponseMessage {
    message: string,
    code: number,
    data: string
}

export enum WarehouseServiceMessages {
    CREATE_INGREDIENT,
    GET_ALL_INGREDIENT,
    DECREASE_INGREDIENTS_QUANTITY,
    GET_ALL_AVAILABLE_INGREDIENT,
    RESTOCK_INGREDIENT
}