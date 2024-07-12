import { Item, Order, OrderItem, OrderState, OrderType } from '../src/domain/order'
import { getOrdersCollection } from '../src/repository/connection'
import * as conversion from '../src/repository/order-conversion-utils'

/**
 * Utility function to empty the database
 */
export async function emptyOrders() {
    let collection = await getOrdersCollection()
    await collection.deleteMany()
}

/**
 * Utily function to 
 * @returns some samples items
 */
export function getTestItems() {
    let i1: Item = { "name": "i1" }
    let i2: Item = { "name": "i2" }
    let ordersItem: OrderItem[] = [{ "item": i1, "quantity": 2 }, { "item": i2, quantity: 3 }]
    return ordersItem
}

/**
* Utily function to 
* @returns some samples orders
*/
export function getTestOrders() {

    let ordersItem = getTestItems()

    let o1 = conversion.toInsertOrder("c1", 1, OrderType.HOME_DELIVERY, OrderState.PENDING, ordersItem)

    let o2 = conversion.toInsertOrder("c2", 10, OrderType.AT_THE_TABLE, OrderState.COMPLETED, ordersItem)

    let o3 = conversion.toInsertOrder("c3", 1, OrderType.HOME_DELIVERY, OrderState.READY, ordersItem)

    let o4 = conversion.toInsertOrder("c4", 25, OrderType.TAKE_AWAY, OrderState.PENDING, [ordersItem[0]])

    return [o1, o2, o3, o4]

}

/**
 * Utily function to fill the database with the sample orders
 */
export async function fillOrders() {
    let collection = await getOrdersCollection()
    await collection.insertMany(getTestOrders())
}

/**
 * Utility function to get the last inserted Order
 * @returns the last inserted Order
 */
export async function getLastInsertedOrder(): Promise<Order> {
    let orders = (await getOrdersCollection()).find()
    let last = (await orders.toArray()).pop() as conversion.MongoOrder
    return conversion.fromMongoOrderToOrder(last._id, last.customerContact, last.price, last.type, last.state, last.items)
}
