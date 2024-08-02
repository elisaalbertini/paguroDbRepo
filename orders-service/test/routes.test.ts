import axios from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import * as db_test from '../test/test-utils'
import { OrdersMessage } from '../src/orders-message'
import { removeIndexOrder } from '../src/repository/order-conversion-utils'
import { assertEquals } from 'typia'
import { Order, OrderState } from '../src/domain/order'

const http = axios.create({
	baseURL: 'http://localhost:8090'
})

beforeEach(async () => { await db_test.emptyOrders() })

afterAll(() => {
	client.closeMongoClient()
	server.close()
})

test('Get All Orders', async () => {

	// empty
	await http.get('/orders').catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(OrdersMessage.EMPTY_ORDERS_DB)
		expect(error.response.data).toStrictEqual([])
	})

	// ok
	await db_test.fillOrders()
	let res = await http.get('/orders')
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	let orders = assertEquals<Order[]>(res.data)
	let expectedValues = orders.map(o => removeIndexOrder(o))
	expect(expectedValues).toStrictEqual(db_test.getTestOrders())

})

test('Get Order By Id', async () => {

	await db_test.fillOrders()

	// 200
	let order = await db_test.getLastInsertedOrder()
	let res = await http.get('/orders/' + order._id)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	order = await db_test.getLastInsertedOrder()
	expect(res.data).toStrictEqual(order)

	// 404
	await http.get('/orders/1').catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)
	})

})

test('Add New Order', async () => {

	await db_test.fillOrders()
	let json = {
		"customerEmail": "c1@example.com",
		"price": 1,
		"type": "HOME_DELIVERY",
		"items": [
			{
				"item": {
					"name": "i1"
				},
				"quantity": 2
			},
		]
	}


	let res = await http.post('/orders', json)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	let last = await db_test.getLastInsertedOrder()
	expect(res.data).toStrictEqual(last)

	// send wrong format
	let wrong_format: any = { ...json }
	wrong_format["state"] = OrderState.PENDING
	await http.post('/orders', wrong_format).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(OrdersMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual({})

	})

	// send wrong concact
	let wrong_email: any = { ...json }
	wrong_email["customerEmail"] = "c1"
	await http.post('/orders', wrong_email).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(OrdersMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toBe("")
	})

})

test('Put Order', async () => {

	// take away 
	// pending -> ready -> completed ok
	await db_test.insertPendingTakeAway()
	let order = await db_test.getLastInsertedOrder()
	order["state"] = OrderState.READY
	let res = await http.put('/orders', order)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	expect(res.data).toStrictEqual(order)

	order["state"] = OrderState.COMPLETED
	res = await http.put('/orders', order)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	expect(res.data).toStrictEqual(order)

	// 400 --> pending
	order["state"] = OrderState.PENDING
	await http.put('/orders', order).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(OrdersMessage.CHANGE_STATE_NOT_VALID)
	})


	// 404, wrong id
	order["_id"] = "1"
	await http.put('/orders', order).catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(OrdersMessage.ORDER_ID_NOT_FOUND)
	})

	// at the table
	// pending -> completed, 200
	await db_test.emptyOrders()
	await db_test.insertPendingAtTheTable()
	order = await db_test.getLastInsertedOrder()
	order["state"] = OrderState.COMPLETED
	res = await http.put('/orders', order)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(OrdersMessage.OK)
	expect(res.data).toStrictEqual(order)

	// wrong format
	await db_test.emptyOrders()
	await db_test.insertPendingAtTheTable()
	order = await db_test.getLastInsertedOrder()
	let wrong_format: any = { ...order }
	wrong_format["wrong"] = "wrong"
	await http.put('/orders', wrong_format).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(OrdersMessage.ERROR_WRONG_PARAMETERS)
	})

})

