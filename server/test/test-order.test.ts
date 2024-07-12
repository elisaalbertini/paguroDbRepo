import WebSocket from 'ws';
import { Service } from '../src/utils/service'
import { OrdersServiceMessages, RequestMessage } from '../src/utils/messages';
import { add, cleanCollection, closeMongoClient } from './utils/db-connection';
import { check_order_message, createRequestMessage, egg, newOrder, omelette, order } from './utils/test-utils';
import { addId } from './utils/order-json-utils';

let ws: WebSocket
let insertedId: string

beforeAll(async () => {
	await cleanCollection("Orders", "Orders")
	await cleanCollection("Menu", "Items")
	await cleanCollection("Warehouse", "Ingredient")
	let res = await add("Orders", "Orders", JSON.stringify(order))
	await add("Menu", "Items", JSON.stringify(omelette))
	await add("Warehouse", "Ingredient", JSON.stringify(egg))
	insertedId = res.insertedId.toString()
})

afterEach(() => { ws.close() })

afterAll(() => { closeMongoClient() })

//read
test('Get all orders - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ALL_ORDERS.toString(), '')
	startWebsocket(requestMessage, 200, "OK", addId(order, insertedId), done)
});

//write
test('Create Order Test - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder)
	startWebsocket(requestMessage, 200, "OK", newOrder, done)
});

test('Create Order Test - 400', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder)
	startWebsocket(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)
});

function startWebsocket(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	ws = new WebSocket('ws://localhost:3000');
	ws.on('message', async (msg: string) => {
		await check_order_message(JSON.parse(msg), code, message, data, requestMessage.client_request)
		callback()

	});

	ws.on('open', () => {
		ws.send(JSON.stringify(requestMessage))
	});
}
