import { WebSocket, WebSocketServer } from 'ws';
import { Service } from '../src/utils/service'
import { OrdersServiceMessages, RequestMessage } from '../src/utils/messages';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { check_order_message, createRequestMessage, egg, newWrongOrder, omelette, order, orderItemQuantity } from './utils/test-utils';
import { addId, addIdandState } from './utils/order-json-utils';
import express from "express"
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import { check_service } from '../src/check-service'

let ws_route: WebSocket
let ws_check_service: WebSocket
let wss: WebSocketServer
let server: Server<typeof IncomingMessage, typeof ServerResponse>
let insertedId: string
const app = express()
const managerWsMsg = "Manager frontend web socket"
const orderWsMsg = "New order web socket"

beforeAll(async () => {
	await cleanCollection("Menu", "Items")
	let warehouse = await getCollection("Warehouse", "Ingredient")
	await warehouse.createIndex({ name: 1 }, { unique: true })
	let menu = await getCollection("Menu", "Items")
	await menu.createIndex({ name: 1 }, { unique: true })
	await add("Menu", "Items", JSON.stringify(omelette))
})


beforeEach(async () => {
	await cleanCollection("Orders", "Orders")
	await cleanCollection("Warehouse", "Ingredient")
	await getCollection("Warehouse", "Ingredient")
	await add("Warehouse", "Ingredient", JSON.stringify(egg))
	let res = await add("Orders", "Orders", JSON.stringify(order))
	insertedId = res.insertedId.toString()
	server = createServer(app)
	wss = new WebSocketServer({ server })
})

afterEach(() => {
	if (ws_check_service?.OPEN) {
		ws_check_service.close()
	}
	if (ws_route?.OPEN) {
		ws_route.close()
	}
	server.close()
})

afterAll(() => { closeMongoClient() })

//read
test('Get all orders - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ALL_ORDERS, '')
	startWebsocket(requestMessage, 200, "OK", addId(order, insertedId), done)
});

test('Get all orders - 200 (check-service)', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ALL_ORDERS, '')
	createConnectionAndCall(requestMessage, 200, "OK", addId(order, insertedId), done)
})

test('Get order by id - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ORDER_BY_ID, insertedId)
	let expected = JSON.stringify(JSON.parse(addId(order, insertedId))[0])
	startWebsocket(requestMessage, 200, "OK", expected, done)
})

test('Get order by id - 200 (check-service)', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ORDER_BY_ID, insertedId)
	let expected = JSON.stringify(JSON.parse(addId(order, insertedId))[0])
	createConnectionAndCall(requestMessage, 200, "OK", expected, done)
})

test('Get order by id - 404 (check-service)', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ORDER_BY_ID, "1")
	createConnectionAndCall(requestMessage, 404, "ORDER_ID_NOT_FOUND", undefined, done)
})

//write
test('Create Order Test - 200', done => {
	const newOrder = {
		"customerEmail": "c1@example.com",
		"price": 1,
		"type": "HOME_DELIVERY",
		"items": [
			{
				"item": {
					"name": "omelette"
				},
				"quantity": orderItemQuantity
			},
		]
	}
	startWebsocket(
		createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER, newOrder), 200, "OK", newOrder, done)
})

test('Create Order Test (check-service) - 200', done => {
	const newOrder = {
		"customerEmail": "c2@example.com",
		"price": 1,
		"type": "TAKE_AWAY",
		"items": [
			{
				"item": {
					"name": "omelette"
				},
				"quantity": orderItemQuantity
			},
		]
	}
	createConnectionAndCallNewOrder(
		createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER, newOrder), 200, "OK", newOrder, done)
})

test('Create Order Test - 400', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER, newWrongOrder)
	startWebsocket(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)

})

test('Create Order Test - 400 (check-service)', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER, newWrongOrder)
	createConnectionAndCall(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)
})

test('Put Order Test - 200', done => {
	cleanCollection("Orders", "Orders").then(() => {

		add("Orders", "Orders", JSON.stringify(order)).then((res) => {

			let id = res.insertedId.toString()
			let mod = {
				"_id": id,
				"state": "READY"
			}

			let expected = { ...order }
			expected["_id"] = id
			expected["state"] = "READY"
			let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.PUT_ORDER, JSON.stringify(mod))
			startWebsocket(requestMessage, 200, "OK", JSON.stringify([expected]), done)

		})

	})

})

test('Put Order Test - 200 (check-service)', done => {
	cleanCollection("Orders", "Orders").then(() => {

		let expected = { ...order }
		expected["state"] = "READY"

		add("Orders", "Orders", JSON.stringify(expected)).then((res) => {
			let id = res.insertedId.toString()

			let mod = {
				"_id": id,
				"state": "COMPLETED"
			}
			expected["_id"] = id
			expected["state"] = "COMPLETED"
			let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.PUT_ORDER, JSON.stringify(mod))
			createConnectionAndCall(requestMessage, 200, "OK", JSON.stringify([expected]), done)
		})

	})


})

test('Put Order Test - 400 (check-service)', done => {
	cleanCollection("Orders", "Orders").then(() => {

		let modOrder = { ...order }
		modOrder["state"] = "COMPLETED"
		add("Orders", "Orders", JSON.stringify(modOrder)).then((res) => {
			let id = res.insertedId.toString()

			let mod = {
				"_id": id,
				"state": "PENDING"
			}

			modOrder["_id"] = id
			modOrder["state"] = "PENDING"
			let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.PUT_ORDER, JSON.stringify(mod))
			createConnectionAndCall(requestMessage, 400, "CHANGE_STATE_NOT_VALID", undefined, done)
		})

	})

})

test('Put Order Test - 400 (check-service) - id not found', done => {
	cleanCollection("Orders", "Orders").then(() => {
		let mod = {
			"_id": insertedId,
			"state": "PENDING"
		}
		let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.PUT_ORDER, JSON.stringify(mod))
		createConnectionAndCall(requestMessage, 404, "ORDER_ID_NOT_FOUND", undefined, done)
	})
})

function startWebsocket(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	ws_route = new WebSocket('ws://localhost:3000');
	ws_route.on('message', async (msg: string) => {
		await check_order_message(JSON.parse(msg), code, message, data, requestMessage.client_request)
		callback()
	});

	ws_route.on('open', () => {
		ws_route.send(JSON.stringify(requestMessage))
	});
}

function createConnectionAndCall(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	wss.on('connection', (ws) => {
		ws.on('error', console.error);

		ws.on('message', async (msg: string) => {
			await check_order_message(JSON.parse(msg), code, message, data, requestMessage.client_request)
			callback()
		});

	});
	server.listen(8081, () => console.log('listening on port :8081'));

	ws_check_service = new WebSocket('ws://localhost:8081');
	ws_check_service.on('open', () => {
		const managerWsArray = Array()
		check_service(requestMessage, ws_check_service, managerWsArray)
	})
}

export interface IArray {
	[index: string]: WebSocket;
}

function createConnectionAndCallNewOrder(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	let connections: Map<WebSocket, string> = new Map()
	let wsArray = {} as IArray

	wss.on('connection', (ws: WebSocket) => {
		ws.on('error', console.error);

		ws.on('message', async (msg: string) => {
			if (msg == managerWsMsg) {
				wsArray[managerWsMsg] = ws
			} else if (msg == orderWsMsg) {
				wsArray[orderWsMsg] = ws
			} else {
				connections.set(ws, msg)
				if (connections.size == 2) {
					const orederRes = JSON.parse(connections.get(wsArray[orderWsMsg])!)
					const managerRes = JSON.parse(connections.get(wsArray[managerWsMsg])!)

					expect(wsArray[managerWsMsg]).toBe(ws)
					expect(wsArray[orderWsMsg] == ws).toBeFalsy
					expect(orederRes.code).toBe(code)
					expect(orederRes.message).toBe(message)
					expect(JSON.parse(orederRes.data)).toStrictEqual(JSON.parse(await addIdandState(data)))
					expect(managerRes.message).toBe("NEW_MISSING_INGREDIENTS")
					expect(JSON.parse(managerRes.data)).toStrictEqual([egg])
					wsManager.close()
					callback()
				}
			}
		});
	});
	server.listen(8081, () => console.log('listening on port :8081'));

	ws_check_service = new WebSocket('ws://localhost:8081');
	ws_check_service.on('open', () => {
		let managerWsArray = Array()
		managerWsArray.push(wsManager)
		check_service(requestMessage, ws_check_service, managerWsArray)
		ws_check_service.send(orderWsMsg)
	})

	const wsManager = new WebSocket('ws://localhost:8081')
	wsManager.on('open', () => {
		wsManager.send(managerWsMsg)
	})
}
