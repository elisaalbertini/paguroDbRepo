import * as repository from '../src/repository/repository'
import { OrderState, OrderType } from '../src/domain/order'
import { OrdersMessage } from '../src/orders-message'
import * as client from '../src/repository/connection'
import * as conversion from '../src/repository/order-conversion-utils'
import * as db_test from './test-utils'

let wrong_id = "1"
let non_existing_id = "000000000000000000000000"

afterAll(() => { client.closeMongoClient() })

function checkResponse<T>(message: OrdersMessage, data: T, expectedMsg: OrdersMessage, expectedData?: T) {
	expect(message).toBe(expectedMsg)
	if (expectedData != undefined) {
		expect(data).toStrictEqual(expectedData)
	}
}

beforeEach(async () => { await db_test.emptyOrders() })

// read
test('Get All Orders', async () => {

	// empty repository test
	let value = await repository.getAllOrders()
	checkResponse(value.message, value.data, OrdersMessage.EMPTY_ORDERS_DB, [])

	// repository with orders test
	await db_test.fillOrders()
	value = await repository.getAllOrders()

	let actualValues = value.data?.map(o => conversion.removeIndexOrder(o))

	checkResponse(value.message, actualValues, OrdersMessage.OK, db_test.getTestOrders())

})

test('Find Order by Id', async () => {
	//prepare
	await db_test.fillOrders()

	// wrong id string
	let res = await repository.findOrderById(wrong_id)
	checkResponse(res.message, res.data, OrdersMessage.ORDER_ID_NOT_FOUND)

	// correct but non existing id 
	res = await repository.findOrderById(non_existing_id)
	checkResponse(res.message, res.data, OrdersMessage.ORDER_ID_NOT_FOUND)

	//existing id 
	let existingOrder = (await db_test.getLastInsertedOrder())
	res = await repository.findOrderById(existingOrder._id)
	checkResponse(res.message, res.data, OrdersMessage.OK, existingOrder)
})

// write
test('Create Order', async () => {
	let expectedOrder = conversion.toInsertOrder("user@gmail.com", 10, OrderType.AT_THE_TABLE, OrderState.PENDING, db_test.getTestItems())
	let res = await repository.createOrder(expectedOrder.customerEmail, expectedOrder.price, expectedOrder.type, expectedOrder.items)
	if (res.data != null) {
		checkResponse(res.message, conversion.removeIndexOrder(res.data), OrdersMessage.OK, expectedOrder)
	}
})

test('Update Order', async () => {
	//prepare
	await db_test.fillOrders()

	//wrong id string
	let res = await repository.updateOrder(wrong_id, OrderState.COMPLETED)
	checkResponse(res.message, res.data, OrdersMessage.ORDER_ID_NOT_FOUND)

	// correct but not existing id
	res = await repository.updateOrder(non_existing_id, OrderState.COMPLETED)
	checkResponse(res.message, res.data, OrdersMessage.ORDER_ID_NOT_FOUND)

	//existing id
	let order = await db_test.getLastInsertedOrder()
	res = await repository.updateOrder(order._id, OrderState.COMPLETED)
	order = await db_test.getLastInsertedOrder()
	checkResponse(res.message, res.data, OrdersMessage.OK, order)
})
