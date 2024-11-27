/**
 * This interface represents the request the client sends to the server
 */
export interface RequestMessage {
	client_request: string
	input: any
}

/**
 * This interface represents the response the client receives from the server
 */
export interface ResponseMessage {
	message: string,
	code: number,
	data: any
}

/**
 * Different messages handled by the menu microservice
 */
export const MenuServiceMessages = {
	CREATE_ITEM: 'CREATE_ITEM',
	GET_ITEM_BY_NAME: 'GET_ITEM_BY_NAME',
	UPDATE_ITEM: 'UPDATE_ITEM',
	GET_ITEMS: 'GET_ITEMS',
	GET_AVAILABLE_ITEMS: 'GET_AVAILABLE_ITEMS'
}
Object.freeze(MenuServiceMessages)

/**
 * Different messages handled by the orders microservice
 */
export const OrdersServiceMessages = {
	CREATE_ORDER: 'CREATE_ORDER',
	GET_ALL_ORDERS: 'GET_ALL_ORDERS',
	PUT_ORDER: 'PUT_ORDER',
	GET_ORDER_BY_ID: 'GET_ORDER_BY_ID'
}
Object.freeze(OrdersServiceMessages)

