import { ObjectId } from 'mongodb';
import { OrderType, OrderItem, OrderState, Order, Item, InsertOrder } from '../domain/order'
import { OrdersMessage } from "../orders-message";
import * as mongoConnection from "./connection"
import { MongoOrder, toInsertOrder, fromMongoOrderToOrder } from './order-conversion-utils';

/**
 * This type represents the Response given by the repository. It consists of the generic data and an OrdersMessage
 */
type RepositoryResponse<T> = { data?: T, message: OrdersMessage };

let collection = mongoConnection.getOrdersCollection()

/**
 * Inserts a pending order into the repository with the provided information
 * @param customerContact of the ordering customer
 * @param price of the order
 * @param type of the order
 * @param items ordered
 * @returns a Promise with the repository response and the created Order as data
 */
export async function createOrder(customerContact: string, price: number, type: OrderType, items: OrderItem[]): Promise<RepositoryResponse<Order>> {

	let ordersCollection = await collection

	let newOrder = toInsertOrder(customerContact, price, type, OrderState.PENDING, items)

	let promise = await ordersCollection.insertOne(newOrder)
	let order = fromMongoOrderToOrder(promise.insertedId, customerContact, price, type, OrderState.PENDING, items)

	return { data: order, message: OrdersMessage.OK };

}

/**
 * It returs a Promise with the repository response and all the orders in the repository
 * @returns OrdersMessage.OK if there are orders, OrdersMessage.EMPTY_ORDERS_DB otherwise
 */
export async function getAllOrders(): Promise<RepositoryResponse<Order[]>> {

	let ordersCollection = await collection
	let mongoOrders = await ordersCollection.find().toArray() as MongoOrder[]
	let orders = mongoOrders.map((o) => fromMongoOrderToOrder(o._id, o.customerContact, o.price, o.type, o.state, o.items))

	if (orders.length > 0) {
		return { data: orders, message: OrdersMessage.OK }
	} else {
		return { data: orders, message: OrdersMessage.EMPTY_ORDERS_DB };
	}
}
