import { Order, OrderItem, OrderType } from "../domain/order";
import { OrdersMessage } from "../orders-message";
import * as repository from "../repository/repository";

/**
 * this type represents the Response given by the Service. It consists of the generic data and an OrdersMessage
 */
type ServiceResponse<T> = { data?: T, message: OrdersMessage };

/**
 * Service functionality to add a new order given its information:
 * @param customerContact 
 * @param price 
 * @param type 
 * @param items 
 * @returns a Promise with the Service Response containing the new Order data and an OK message 
 */
export async function addNewOrder(customerContact: string, price: number, type: OrderType, items: OrderItem[]): Promise<ServiceResponse<Order>> {
	let res = await repository.createOrder(customerContact, price, type, items)
	return { data: res.data, message: res.message }

}

/**
 * Service functionality to get all the received orders
 * @returns all the received orders
 */
export async function getAllOrders(): Promise<ServiceResponse<Order[]>> {
	let res = await repository.getAllOrders()
	return { data: res.data, message: res.message }
}
