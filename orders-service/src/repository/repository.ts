import { OrderType, OrderItem, OrderState, Order } from '../domain/order'
import { OrdersMessage } from "../orders-message";
import * as mongoConnection from "./connection"
import { MongoOrder, toInsertOrder, fromMongoOrderToOrder } from './order-conversion-utils';
import { ObjectId } from "mongodb"

/**
 * This type represents the Response given by the repository. It consists of the generic data and an OrdersMessage
 */
type RepositoryResponse<T> = { data?: T, message: OrdersMessage };

let collection = mongoConnection.getOrdersCollection()

/**
 * Inserts a pending order into the repository with the provided information
 * @param customerEmail of the ordering customer
 * @param price of the order
 * @param type of the order
 * @param items ordered
 * @returns a Promise with the RepositoryResponse and the created Order as data
 */
export async function createOrder(customerEmail: string, price: number, type: OrderType, items: OrderItem[]): Promise<RepositoryResponse<Order>> {

	let ordersCollection = await collection

	let newOrder = toInsertOrder(customerEmail, price, type, OrderState.PENDING, items)

	await ordersCollection.insertOne(newOrder)

	return repositoryResponse(OrdersMessage.OK, newOrder as Order)
}

/**
 * It returs a Promise with the repository response and all the orders in the repository
 * @returns OrdersMessage.OK if there are orders, OrdersMessage.EMPTY_ORDERS_DB otherwise
 */
export async function getAllOrders(): Promise<RepositoryResponse<Order[]>> {

	let ordersCollection = await collection
	let mongoOrders = await ordersCollection.find().toArray() as MongoOrder[]

	let orders = mongoOrders.map((o) => fromMongoOrderToOrder(o))

	if (orders.length > 0) {
		return repositoryResponse(OrdersMessage.OK, orders)
	} else {
		return repositoryResponse(OrdersMessage.EMPTY_ORDERS_DB, orders)
	}
}

/**
 * It finds a specific Order given the id.
 * @param orderId 
 * @returns a Promise with the RepositoryResponse. If the provided id is not valid or does not exist in the database, 
 * the message is ORDER_ID_NOT_FOUND and the data is undefined. 
 * Otherwsise, the message is OK and the data is the order
 */
export async function findOrderById(orderId: string): Promise<RepositoryResponse<Order>> {
	if (!ObjectId.isValid(orderId)) {
		return repositoryResponse(OrdersMessage.ORDER_ID_NOT_FOUND)
	}

	let ordersCollection = await collection
	let id = new ObjectId(orderId)
	let find = (await ordersCollection.find({ "_id": id }).toArray())
	if (find.length == 0) {
		return repositoryResponse(OrdersMessage.ORDER_ID_NOT_FOUND)
	}
	let mongoOrder = find.at(0) as MongoOrder
	let order = fromMongoOrderToOrder(mongoOrder)
	return repositoryResponse(OrdersMessage.OK, order)
}


/**
 * It updates a specific Order to a new state given the id.
 * @param orderId 
 * @param newState 
 * @returns a Promise with the RepositoryResponse. If the provided id is not valid or the update is not successful, 
 * the message is ORDER_ID_NOT_FOUND and the data is undefined. 
 * Otherwsise, the message is OK and the data is the updated order.
 */
export async function updateOrder(orderId: string, newState: OrderState): Promise<RepositoryResponse<Order>> {
	if (!ObjectId.isValid(orderId)) {
		return repositoryResponse(OrdersMessage.ORDER_ID_NOT_FOUND)
	}
	let filter = { "_id": new ObjectId(orderId) }
	let update = { $set: { "state": newState } }

	let ordersCollection = await collection
	let res = await ordersCollection.updateOne(filter, update)
	if (res.modifiedCount == 1) {
		let order = (await findOrderById(orderId)).data
		return repositoryResponse(OrdersMessage.OK, order)
	} else {
		return repositoryResponse(OrdersMessage.ORDER_ID_NOT_FOUND)
	}
}

function repositoryResponse<T>(msg: OrdersMessage, data?: T): RepositoryResponse<T> {
	return data != undefined ? { data: data, message: msg } : { message: msg }
}


