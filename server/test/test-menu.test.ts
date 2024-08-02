import { Service } from '../src/utils/service'
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../src/utils/messages';
import { check_service } from '../src/check-service';
import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { boiledEgg, createRequestMessage, egg, friedEgg, omelette } from './utils/test-utils';

let ws_check_service: WebSocket
let ws_route: WebSocket
let wss: WebSocketServer
const app = express()
let server: Server<typeof IncomingMessage, typeof ServerResponse>
let db_name = "Menu"
let db_collection = "Items"
let db_warehouse_name = "Warehouse"
let db_warehouse_collection = "Ingredient"

beforeAll(async () => {
	await (await getCollection(db_name, db_collection)).createIndex({ name: 1 }, { unique: true })
	await cleanCollection(db_name, db_collection)
	await cleanCollection(db_warehouse_name, db_warehouse_collection)
	await add(db_name, db_collection, JSON.stringify(omelette))
	await add(db_warehouse_name, db_warehouse_collection, JSON.stringify(egg))
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
beforeEach(() => {
	server = createServer(app);
	wss = new WebSocketServer({ server });
})

afterAll(() => { closeMongoClient() })

test('Get all available items Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_AVAILABLE_ITEMS, "")
	test_route(requestMessage, 200, 'OK', [omelette], done)
})

test('Get all available items Test - 200 (check-service)', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_AVAILABLE_ITEMS, "")
	test_check_service(requestMessage, 200, 'OK', [omelette], done)
})

test('Get item by name Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME, omelette.name)
	test_route(requestMessage, 200, 'OK', omelette, done)
});

test('Get item by name Test - 200 (check-service)', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME, omelette.name)
	test_check_service(requestMessage, 200, 'OK', omelette, done)
})

test('Get all items Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEMS, "")
	test_route(requestMessage, 200, 'OK', [omelette], done)
})

test('Get all items Test - 200 (check-service)', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEMS, "")
	test_check_service(requestMessage, 200, 'OK', [omelette], done)
})

test('Add new item Test - 200', done => {
	test_route(
		createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM, friedEgg), 200, 'OK', friedEgg, done)
});

test('Add new item Test - 200 (check-service)', done => {
	test_check_service(
		createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM, boiledEgg), 200, 'OK', boiledEgg, done)
});

test('Update item Test - 200', done => {
	const update_omelette = {
		name: "omelette",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 2
			},
			{
				ingredient_name: "salt",
				quantity: 1
			}
		],
		price: 4
	}
	test_route(
		createRequestMessage(Service.MENU, MenuServiceMessages.UPDATE_ITEM, update_omelette), 200, 'OK', update_omelette, done)
});

test('Update item Test - 200 (check-service)', done => {
	const update_omelette = {
		name: "omelette",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 2
			},
			{
				ingredient_name: "salt",
				quantity: 1
			},
			{
				ingredient_name: "tomato",
				quantity: 1
			}
		],
		price: 5
	}
	test_check_service(
		createRequestMessage(Service.MENU, MenuServiceMessages.UPDATE_ITEM, update_omelette), 200, 'OK', update_omelette, done)
});

test('Get all available items Test - 404', done => {
	cleanCollection(db_warehouse_name, db_warehouse_collection).then(() => {
		const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_AVAILABLE_ITEMS, "")
		test_route(requestMessage, 404, "ERROR_EMPTY_WAREHOUSE", "", done)
	})
})

test('Get all available items Test - 404', done => {
	cleanCollection(db_warehouse_name, db_warehouse_collection).then(() => {
		const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_AVAILABLE_ITEMS, "")
		test_check_service(requestMessage, 404, "ERROR_EMPTY_WAREHOUSE", "", done)
	})
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
	const managerWs = Array()
	ws_check_service.on('open', () => check_service(requestMessage, ws_check_service, managerWs))
}

function check(res: ResponseMessage, code: number, message: string, output: any) {
	expect(res.code).toBe(code);
	expect(res.message).toBe(message);
	if (res.code == 200) {
		expect(JSON.parse(res.data)).toStrictEqual(output)
	} else {
		expect(res.data).toBe(output);
	}
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
