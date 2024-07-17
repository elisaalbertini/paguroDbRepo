import { Service } from '../src/utils/service'
import { RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../src/utils/messages';
import { check_service } from '../src/check-service';

import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { milk, tea } from './utils/test-utils';

// milk 95, tea 0
let m: ResponseMessage
let ws: WebSocket;
let wss: WebSocketServer;
const app = express();
let server: Server<typeof IncomingMessage, typeof ServerResponse>
const db_name = "Warehouse"
const db_collection = "Ingredient"

beforeAll(async () => {
	await (await getCollection(db_name, db_collection)).createIndex({ name: 1 }, { unique: true })
	await cleanCollection(db_name, db_collection)
	await add(db_name, db_collection, JSON.stringify(milk))
	await add(db_name, db_collection, JSON.stringify(tea))
})

afterEach(() => {
	ws.close()
	server.close()
	wss.close()
})
beforeEach(() => {
	server = createServer(app);
	wss = new WebSocketServer({ server });
})

afterAll(() => { closeMongoClient() })

// read
test('Get all Ingredient Test - 200', done => {
	const output = JSON.stringify([{ name: "milk", quantity: 95 }, { name: "tea", quantity: 0 }])
	const requestMessage = createRequestMessage(WarehouseServiceMessages.GET_ALL_INGREDIENT, '')
	createConnectionAndCall(requestMessage, 200, 'OK', output, done)
});

test('Get all Available Ingredient Test - 200', done => {
	const output = JSON.stringify([{ name: "milk", quantity: 95 }])
	const requestMessage = createRequestMessage(WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT, '')
	createConnectionAndCall(requestMessage, 200, 'OK', output, done)
});

// write
test('Restock Test - 200', done => {
	let input = JSON.stringify({ name: "milk", quantity: 10 })
	let output = JSON.stringify({ name: "milk", quantity: 105 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.RESTOCK_INGREDIENT, input)
	createConnectionAndCall(requestMessage, 200, 'OK', output, done)
});

test('Restock Test - 400', done => {
	let input = JSON.stringify({ name: "coffee", quantity: 10 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.RESTOCK_INGREDIENT, input)
	createConnectionAndCall(requestMessage, 404, 'ERROR_INGREDIENT_NOT_FOUND', '', done)

});

test('Create Ingredient Test - 400', done => {
	let input = JSON.stringify({ name: "milk", quantity: 2 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.CREATE_INGREDIENT, input)
	createConnectionAndCall(requestMessage, 400, 'ERROR_INGREDIENT_ALREADY_EXISTS', "", done)

});

test('Create Ingredient Test - 200', done => {
	let input = JSON.stringify({ name: "coffee", quantity: 5 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.CREATE_INGREDIENT, input)
	createConnectionAndCall(requestMessage, 200, 'OK', input, done)

});

test('Decrease Ingredients Quantity Test - 400', done => {
	let input = JSON.stringify([{ name: "milk", quantity: 10 }, { name: "coffee", quantity: 10 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input)
	createConnectionAndCall(requestMessage, 400, 'ERROR_INGREDIENT_QUANTITY', '', done)

});

test('Decrease Ingredients Quantity Test - 200', done => {
	let input = JSON.stringify([{ name: "milk", quantity: 10 }, { name: "coffee", quantity: 4 }])
	let output = JSON.stringify([{ name: "milk", quantity: 95 }, { name: "tea", quantity: 0 }, { name: "coffee", quantity: 1 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input)
	createConnectionAndCall(requestMessage, 200, 'OK', output, done)

});
function createRequestMessage(request: WarehouseServiceMessages, input: string): RequestMessage {
	return {
		client_name: Service.WAREHOUSE,
		client_request: request.toString(),
		input: input
	}
}

function createConnectionAndCall(requestMessage: RequestMessage, code: number, message: string, output: string, callback: jest.DoneCallback) {
	wss.on('connection', (ws) => {
		ws.on('error', console.error);

		ws.on('message', (msg: string) => {
			m = JSON.parse(msg)
			expect(m.code).toBe(code);
			expect(m.message).toBe(message);
			expect(m.data).toBe(output);
			callback()
		});

	});
	server.listen(8081, () => console.log('listening on port :8081'));

	ws = new WebSocket('ws://localhost:8081');
	ws.on('open', () => {
		check_service(requestMessage, ws)
	})
}
