
/**
 * Different messages handled by the warehouse microservice
 */
export const WarehouseServiceMessages = {
	CREATE_INGREDIENT: 'CREATE_INGREDIENT',
	GET_ALL_INGREDIENT: 'GET_ALL_INGREDIENT',
	DECREASE_INGREDIENTS_QUANTITY: 'DECREASE_INGREDIENTS_QUANTITY',
	GET_ALL_AVAILABLE_INGREDIENT: 'GET_ALL_AVAILABLE_INGREDIENT',
	RESTOCK_INGREDIENT: 'RESTOCK_INGREDIENT'
}
Object.freeze(WarehouseServiceMessages)

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
 * Message sent to the Employee application when a new order is created
 */
export const NEW_ORDER_CREATED = "NEW_ORDER_CREATED"
