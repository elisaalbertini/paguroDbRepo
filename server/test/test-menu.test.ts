import { Service } from '../src/utils/service'
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../src/utils/messages';
import { check_service } from '../src/check-service';
import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { boiledEgg, createRequestMessage, friedEgg, omelette } from './utils/test-utils';

let ws_check_service: WebSocket
let ws_route: WebSocket
let wss: WebSocketServer
const app = express()
let server: Server<typeof IncomingMessage, typeof ServerResponse>
let db_name = "Menu"
let db_collection = "Items"

beforeAll(async () => {
	await (await getCollection(db_name, db_collection)).createIndex({ name: 1 }, { unique: true })
	await cleanCollection(db_name, db_collection)
	await add(db_name, db_collection, JSON.stringify(omelette))
})

afterEach(() => {
	if (ws_check_service !== undefined && ws_check_service.OPEN){
		ws_check_service.close()
	}
	if (ws_route !== undefined && ws_route.OPEN){
		ws_route.close()
	}
	server.close()
})

beforeEach(() => {
	server = createServer(app);
	wss = new WebSocketServer({ server });
})

afterAll(() => { closeMongoClient() })

// read
test('Get item by name Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME.toString(), omelette.name)
	test_route(requestMessage, 200, 'OK', omelette, done)
});

test('Get item by name Test - 200 (check-service)', done =>{
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME.toString(), omelette.name)
	test_check_service(requestMessage, 200, 'OK', omelette, done)
})


// write
test('Add new item Test - 200', done => {
	test_route(
		createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM.toString(), friedEgg), 200, 'OK', friedEgg, done)
});

test('Add new item Test - 200 (check-service)', done => {
	test_check_service(
		createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM.toString(), boiledEgg), 200, 'OK', boiledEgg, done)
})

function test_check_service(requestMessage: RequestMessage, code: number, message: string, output: any, callback: jest.DoneCallback) {
	wss.on('connection', (ws) => {
		ws.on('error', console.error);

		ws.on('message', (msg: string) => {
			const m = JSON.parse(msg)
			check(m, code, message, output)
			callback()
		});

	});
	server.listen(8081, () => console.log('listening on port :8081'));

	ws_check_service = new WebSocket('ws://localhost:8081');
	ws_check_service.on('open', () => check_service(requestMessage, ws_check_service))
}

function check(res: ResponseMessage, code: number, message: string, output: any) {
	expect(res.code).toBe(code);
	expect(res.message).toBe(message);
	expect(JSON.parse(res.data)).toStrictEqual(output);
}

function test_route(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	ws_route = new WebSocket('ws://localhost:3000');
	ws_route.on('message', (msg: string) => {
		const m = JSON.parse(msg)
		check(m, code, message, data)
		callback()

	});

	ws_route.on('open', () => ws_route.send(JSON.stringify(requestMessage)));
}

