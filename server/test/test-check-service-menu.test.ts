import { Service } from '../src/utils/service'
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../src/utils/messages';
import { check_service } from '../src/check-service';
import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { add, cleanCollection, closeMongoClient, getCollection } from './utils/db-connection';
import { boiledEgg, createRequestMessage, initMenu, omelette } from './utils/test-utils';

let m: ResponseMessage
let ws: WebSocket;
let wss: WebSocketServer;
const app = express();
let server: Server<typeof IncomingMessage, typeof ServerResponse>

beforeAll(async () => {
	initMenu()
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
test('Get ingredient by name Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME.toString(), omelette.name)
	createConnectionAndCall(requestMessage, 200, 'OK', omelette, done)
});

// write
test('Restock Test - 200', done => {
	let requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM.toString(), boiledEgg)
	createConnectionAndCall(requestMessage, 200, 'OK', boiledEgg, done)
});

function createConnectionAndCall(requestMessage: RequestMessage, code: number, message: string, output: any, callback: jest.DoneCallback) {
	wss.on('connection', (ws) => {
		ws.on('error', console.error);

		ws.on('message', (msg: string) => {
			m = JSON.parse(msg)
			expect(m.code).toBe(code);
			expect(m.message).toBe(message);
			expect(JSON.parse(m.data)).toStrictEqual(output);
			callback()
		});

	});
	server.listen(8081, () => console.log('listening on port :8081'));

	ws = new WebSocket('ws://localhost:8081');
	ws.on('open', () => {
		check_service(requestMessage, ws)
	})
}
