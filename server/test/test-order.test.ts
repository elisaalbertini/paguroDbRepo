import WebSocket, { WebSocketServer } from 'ws';
import { Service } from '../src/utils/service'
import { OrdersServiceMessages, RequestMessage } from '../src/utils/messages';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { check_order_message, createRequestMessage, egg, newWrongOrder, omelette, order, orderItemQuantity } from './utils/test-utils';
import { addId } from './utils/order-json-utils';
import express from "express"
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import { check_service } from '../src/check-service';

let ws1: WebSocket
let ws: WebSocket;
let wss: WebSocketServer;
let server: Server<typeof IncomingMessage, typeof ServerResponse>
let insertedId: string
const app = express();

beforeAll(async () => {
	await cleanCollection("Orders", "Orders")
	await cleanCollection("Menu", "Items")
	await cleanCollection("Warehouse", "Ingredient")
	let warehause = await getCollection("Warehouse", "Ingredient")
	await warehause.createIndex({ name: 1 }, { unique: true })
	let menu = await getCollection("Menu", "Items")
	await menu.createIndex({ name: 1 }, { unique: true })
	let res = await add("Orders", "Orders", JSON.stringify(order))
	insertedId = res.insertedId.toString()
	await add("Menu", "Items", JSON.stringify(omelette))
})

beforeEach(async () => {
	await cleanCollection("Warehouse", "Ingredient")
	await getCollection("Warehouse", "Ingredient")
	await add("Warehouse", "Ingredient", JSON.stringify(egg))
	server = createServer(app);
	wss = new WebSocketServer({ server });
})

afterEach(() => {
	ws.close()
	ws1.close()
	server.close()
})

afterAll(() => { closeMongoClient() })

//read
test('Get all orders - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ALL_ORDERS.toString(), '')
	startWebsocket(requestMessage, 200, "OK", addId(order, insertedId), done)
	createConnectionAndCall(requestMessage, 200, "OK", addId(order, insertedId), done)
});

//write
test('Create Order Test - 200', done => {
	const newOrder = {
		"customerContact": "c1",
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
		createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder), 200, "OK", newOrder, done)
});

test('Create Order Test 2 - 200', done => {
	const newOrder = {
		"customerContact": "c2",
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
	createConnectionAndCall(
		createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder), 200, "OK", newOrder, done)
});

test('Create Order Test - 400', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newWrongOrder)
	startWebsocket(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)
	createConnectionAndCall(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)
});

function startWebsocket(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	ws1 = new WebSocket('ws://localhost:3000');
	ws1.on('message', async (msg: string) => {
		await check_order_message(JSON.parse(msg), code, message, data, requestMessage.client_request)
		callback()
	});

	ws1.on('open', () => {
		ws1.send(JSON.stringify(requestMessage))
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

	ws = new WebSocket('ws://localhost:8081');
	ws.on('open', () => {
		check_service(requestMessage, ws)
	})
}
