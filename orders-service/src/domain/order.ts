import { InsertOrder } from "../repository/insert-order"

/**
 * this interface represents an Order modifica ciao
 */
export interface Order extends InsertOrder {
	_id: string
}

/**
 * this interface represents the item inside an order, so the item itself in the ordered quantity
 */
export interface OrderItem {
	item: Item,
	quantity: number
}

/**
 * this interface represents an item
 */
export interface Item {
	name: string
}

/**
 * this enum represents the three different types of orders
 */
export enum OrderType {
	AT_THE_TABLE = "AT_THE_TABLE",
	TAKE_AWAY = "TAKE_AWAY",
	HOME_DELIVERY = "HOME_DELIVERY"
}

/**
 * this enum represents the three different states of an order.
 * PENDING: the order has to be processed
 * READY: the order can be collected by the customer or it’s going to be delivered
 * COMPLETED: the order it has been served at the table, or it has been collected by the customer, or it has been delivered to the customer house.
 */
export enum OrderState {
	PENDING = "PENDING",
	READY = "READY",
	COMPLETED = "COMPLETED"
}
