import { Service } from '../src/utils/service'
import { OrdersServiceMessages, RequestMessage, ResponseMessage } from '../src/utils/messages';
import { check_service } from '../src/check-service';
import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { add, cleanCollection, closeMongoClient } from './utils/db-connection';
import { addId } from './utils/order-json-utils';
import { check_order_message, createRequestMessage, egg, newOrder, omelette, order } from './utils/test-utils';

let m: ResponseMessage
let ws: WebSocket;
let wss: WebSocketServer;
const app = express();
let server: Server<typeof IncomingMessage, typeof ServerResponse>
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

afterEach(() => {
	ws.close()
	server.close()
})
beforeEach(() => {
	server = createServer(app);
	wss = new WebSocketServer({ server });
})

afterAll(() => { closeMongoClient() })

// read
test('Get all Orders Test - 200', done => {
	const requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.GET_ALL_ORDERS.toString(), '')
	createConnectionAndCall(requestMessage, 200, "OK", addId(order, insertedId), done)
});


// write
test('Create Order Test - 200', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder)
	createConnectionAndCall(requestMessage, 200, "OK", newOrder, done)

});

//write
test('Create Order Test - 400', done => {
	let requestMessage = createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER.toString(), newOrder)
	createConnectionAndCall(requestMessage, 400, "ERROR_WRONG_PARAMETERS", "", done)
});

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
