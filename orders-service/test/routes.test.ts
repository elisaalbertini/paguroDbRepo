import axios, { AxiosResponse } from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import * as db_test from '../test/test-utils'
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

function checkResponse<T>(res: AxiosResponse, data: T, expectedResponse: db_test.ApiResponse, expectedData?: T) {
	expect(res.status).toBe(expectedResponse.code)
	expect(res.statusText).toBe(expectedResponse.message)
	if (expectedData != undefined) {
		expect(data).toStrictEqual(expectedData)
	}
}

test('Get All Orders', async () => {

	// empty
	await http.get('/orders').catch((error) => {
		checkResponse(error.response, error.response.data, db_test.EMPTY_ORDERS_DB, [])
	})

	// ok
	await db_test.fillOrders()
	let res = await http.get('/orders')
	let orders = assertEquals<Order[]>(res.data)
	let expectedValues = orders.map(o => removeIndexOrder(o))
	checkResponse(res, expectedValues, db_test.OK, db_test.getTestOrders())
})

test('Get Order By Id', async () => {

	await db_test.fillOrders()

	// 200
	let order = await db_test.getLastInsertedOrder()
	let res = await http.get('/orders/' + order._id)

	order = await db_test.getLastInsertedOrder()
	checkResponse(res, res.data, db_test.OK, order)

	// 404
	await http.get('/orders/1').catch((error) => {
		checkResponse(error.response, error.response.data, db_test.ORDER_ID_NOT_FOUND)
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
	let last = await db_test.getLastInsertedOrder()
	checkResponse(res, res.data, db_test.OK, last)

	// send wrong format
	let wrong_format: any = { ...json }
	wrong_format["state"] = OrderState.PENDING
	await http.post('/orders', wrong_format).catch((error) => {
		checkResponse(error.response, error.response.data, db_test.ERROR_WRONG_PARAMETERS)
	})

	// send wrong concact
	let wrong_email: any = { ...json }
	wrong_email["customerEmail"] = "c1"
	await http.post('/orders', wrong_email).catch((error) => {
		checkResponse(error.response, error.response.data, db_test.ERROR_WRONG_PARAMETERS)
	})

})

test('Put Order', async () => {

	// take away 
	// pending -> ready -> completed ok
	await db_test.insertPendingTakeAway()
	let order = await db_test.getLastInsertedOrder()
	order["state"] = OrderState.READY
	let res = await http.put('/orders', order)
	checkResponse(res, res.data, db_test.OK, order)

	order["state"] = OrderState.COMPLETED
	res = await http.put('/orders', order)
	checkResponse(res, res.data, db_test.OK, order)

	// 400 --> pending
	order["state"] = OrderState.PENDING
	await http.put('/orders', order).catch((error) => {
		checkResponse(error.response, error.response.data, db_test.CHANGE_STATE_NOT_VALID)
	})

	// 404, wrong id
	order["_id"] = "1"
	await http.put('/orders', order).catch((error) => {
		checkResponse(error.response, error.response.data, db_test.ORDER_ID_NOT_FOUND)
	})

	// at the table
	// pending -> completed, 200
	await db_test.emptyOrders()
	await db_test.insertPendingAtTheTable()
	order = await db_test.getLastInsertedOrder()
	order["state"] = OrderState.COMPLETED
	res = await http.put('/orders', order)
	checkResponse(res, res.data, db_test.OK, order)

	// wrong format
	await db_test.emptyOrders()
	await db_test.insertPendingAtTheTable()
	order = await db_test.getLastInsertedOrder()
	let wrong_format: any = { ...order }
	wrong_format["wrong"] = "wrong"
	await http.put('/orders', wrong_format).catch((error) => {
		checkResponse(error.response, error.response.data, db_test.ERROR_WRONG_PARAMETERS)
	})

})

