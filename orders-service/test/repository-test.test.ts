import * as repository from '../src/repository/repository'
import { OrderState, OrderType } from '../src/domain/order'
import { OrdersMessage } from '../src/orders-message'
import * as client from '../src/repository/connection'
import * as conversion from '../src/repository/order-conversion-utils'
import * as db_test from './test-utils'

let wrong_id = "1"
let non_existing_id = "000000000000000000000000"

afterAll(() => { client.closeMongoClient() })

// read
test('Get All Orders', async () => {

	// empty repository test
	await db_test.emptyOrders()
	let value = await repository.getAllOrders()
	expect(value.message).toBe(OrdersMessage.EMPTY_ORDERS_DB)
	expect(value.data?.length).toBe(0)

	// repository with orders test
	await db_test.fillOrders()
	value = await repository.getAllOrders()
	expect(value.message).toBe(OrdersMessage.OK)
	expect(value.data?.length).toBe(4)

	let expectedValues = value.data?.map(o => conversion.removeIndexOrder(o))

	expect(expectedValues).toStrictEqual(db_test.getTestOrders())

})

test('Find Order by Id', async () => {
	//prepare
	await db_test.emptyOrders()
	await db_test.fillOrders()

	// wrong id string
	let res = await repository.findOrderById(wrong_id)
	expect(res.data).toBe(undefined)
	expect(res.message).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)

	// correct but non existing id 
	res = await repository.findOrderById(non_existing_id)
	expect(res.data).toBe(undefined)
	expect(res.message).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)

	//existing id 
	let existingOrder = (await db_test.getLastInsertedOrder())
	res = await repository.findOrderById(existingOrder._id)
	expect(res.data).toStrictEqual(existingOrder)
	expect(res.message).toBe(OrdersMessage.OK)
})

// write
test('Create Order', async () => {
	await db_test.emptyOrders()
	let expectedOrder = conversion.toInsertOrder("user@gmail.com", 10, OrderType.AT_THE_TABLE, OrderState.PENDING, db_test.getTestItems())
	let res = await repository.createOrder(expectedOrder.customerEmail, expectedOrder.price, expectedOrder.type, expectedOrder.items)
	expect(res.message).toBe(OrdersMessage.OK)
	if (res.data != undefined) {
		expect(conversion.removeIndexOrder(res.data)).toStrictEqual(expectedOrder)
	}

})

test('Update Order', async () => {
	//prepare
	await db_test.emptyOrders()
	await db_test.fillOrders()

	//wrong id string
	let res = await repository.updateOrder(wrong_id, OrderState.COMPLETED)
	expect(res.data).toBe(undefined)
	expect(res.message).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)

	// correct but not existing id
	res = await repository.updateOrder(non_existing_id, OrderState.COMPLETED)
	expect(res.data).toBe(undefined)
	expect(res.message).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)

	//existing id
	let order = await db_test.getLastInsertedOrder()
	res = await repository.updateOrder(order._id, OrderState.COMPLETED)
	order = await db_test.getLastInsertedOrder()
	expect(res.data).toStrictEqual(order)
	expect(res.message).toBe(OrdersMessage.OK)

})
