import { ObjectId } from "mongodb"
import { OrderItem, OrderType, OrderState, InsertOrder, Order } from "../domain/order"

/**
 * @param customerEmail 
 * @param price 
 * @param type 
 * @param state 
 * @param items 
 * @returns the order to insert in the database, the id is not provided
 */
export function toInsertOrder(customerEmail: string, price: number, type: OrderType, state: OrderState, items: OrderItem[]): InsertOrder {
	return {
		customerEmail: customerEmail,
		price: price,
		type: type,
		state: state,
		items: items
	}
}

/**
 * Converts a MongoOrder to an Order trasforming the Mongo id into a string
 * @param id 
 * @param order 
 * @returns the converted Order
 */
export function fromMongoOrderToOrder(order: MongoOrder): Order {
	let newOrder: any = { ...order }
	newOrder._id = newOrder._id.toString()
	return newOrder
}

/**
 * Converts an Order to an InsertOrder removing the index
 * @param order 
 * @returns the converted InsertOrder
 */
export function removeIndexOrder(order: InsertOrder): InsertOrder {
	return toInsertOrder(order.customerEmail, order.price, order.type, order.state, order.items)
}

/**
 * This interface represents the Order Document used by Mongo
 */
export interface MongoOrder {
	_id: ObjectId,
	customerEmail: string,
	price: number,
	type: OrderType,
	state: OrderState,
	items: OrderItem[]
}


