import { Service } from './service';

/**
 * This interface represents the request the client sends to the server
 */
export interface RequestMessage {
	client_name: Service
	client_request: string
	input: any
}

/**
 * This interface represents the response the client receives from the server
 */
export interface ResponseMessage {
	message: string,
	code: number,
	data: string
}

/**
 * This enum lists the different messages handled by the warehouse microservice
 */
export enum WarehouseServiceMessages {
	CREATE_INGREDIENT,
	GET_ALL_INGREDIENT,
	DECREASE_INGREDIENTS_QUANTITY,
	GET_ALL_AVAILABLE_INGREDIENT,
	RESTOCK_INGREDIENT
}

/**
 * This enum lists the different messages handled by the orders microservice
 */
export enum OrdersServiceMessages {
	CREATE_ORDER,
	GET_ALL_ORDERS,
}

/**
 * This enum lists the different messages handled by the menu microservice
 */
export enum MenuServiceMessages {
	CREATE_ITEM,
	GET_ITEM_BY_NAME,
}
