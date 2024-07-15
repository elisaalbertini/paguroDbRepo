import { Service } from '../src/utils/service'
import { MenuServiceMessages, RequestMessage, ResponseMessage } from '../src/utils/messages';
import express from 'express';
import { IncomingMessage, Server, ServerResponse, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { closeMongoClient } from './utils/db-connection';
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
test('Get Item By Name Test - 200', done => {
	const requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.GET_ITEM_BY_NAME.toString(), omelette.name)
	startWebsocket(requestMessage, 200, 'OK', omelette, done)
});


// write
test('Create Ingredient Test - 200', done => {
	let requestMessage = createRequestMessage(Service.MENU, MenuServiceMessages.CREATE_ITEM.toString(), boiledEgg)
	startWebsocket(requestMessage, 200, 'OK', boiledEgg, done)

});

function startWebsocket(requestMessage: RequestMessage, code: number, message: string, data: any, callback: jest.DoneCallback) {
	ws = new WebSocket('ws://localhost:3000');
	ws.on('message', async (msg: string) => {
		m = JSON.parse(msg)
		expect(m.code).toBe(code);
		expect(m.message).toBe(message);
		expect(JSON.parse(m.data)).toStrictEqual(data);
		callback()

	});

	ws.on('open', () => {
		ws.send(JSON.stringify(requestMessage))
	});
}
