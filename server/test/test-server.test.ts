import WebSocket, { WebSocketServer } from 'ws';
import { Service } from '../src/utils/service'
import { RequestMessage, ResponseMessage, WarehouseServiceMessages } from '../src/utils/messages';

// milk 95, tea 0

let m: ResponseMessage
let ws: WebSocket;

afterEach(() => { ws.close() })

// read
test('Get all Ingredient Test - 200', done => {
	let output = JSON.stringify([{ name: "milk", quantity: 95 }, { name: "tea", quantity: 0 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.GET_ALL_INGREDIENT, '')
	startWebsocket(requestMessage, 200, 'OK', output, done)

});

test('Get all Available Ingredient Test - 200', done => {
	let output = JSON.stringify([{ name: "milk", quantity: 95 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT, '')
	startWebsocket(requestMessage, 200, 'OK', output, done)

});


// write
test('Restock Test - 200', done => {
	let input = JSON.stringify({ name: "milk", quantity: 10 })
	let output = JSON.stringify({ name: "milk", quantity: 105 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.RESTOCK_INGREDIENT, input)
	startWebsocket(requestMessage, 200, 'OK', output, done)

});

test('Restock Test - 400', done => {
	let input = JSON.stringify({ name: "coffee", quantity: 10 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.RESTOCK_INGREDIENT, input)
	startWebsocket(requestMessage, 404, 'ERROR_INGREDIENT_NOT_FOUND', '', done)

});

test('Create Ingredient Test - 400', done => {
	let input = JSON.stringify({ name: "milk", quantity: 2 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.CREATE_INGREDIENT, input)
	startWebsocket(requestMessage, 400, 'ERROR_INGREDIENT_ALREADY_EXISTS', "", done)

});

test('Create Ingredient Test - 200', done => {
	let input = JSON.stringify({ name: "coffee", quantity: 5 })
	let requestMessage = createRequestMessage(WarehouseServiceMessages.CREATE_INGREDIENT, input)
	startWebsocket(requestMessage, 200, 'OK', input, done)

});

test('Decrease Ingredients Quantity Test - 400', done => {
	let input = JSON.stringify([{ name: "milk", quantity: 10 }, { name: "coffee", quantity: 10 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input)
	startWebsocket(requestMessage, 400, 'ERROR_INGREDIENT_QUANTITY', '', done)

});

test('Decrease Ingredients Quantity Test - 200', done => {
	let input = JSON.stringify([{ name: "milk", quantity: 10 }, { name: "coffee", quantity: 4 }])
	let output = JSON.stringify([{ name: "milk", quantity: 95 }, { name: "tea", quantity: 0 }, { name: "coffee", quantity: 1 }])
	let requestMessage = createRequestMessage(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input)
	startWebsocket(requestMessage, 200, 'OK', output, done)

});



function startWebsocket(requestMessage: RequestMessage, code: number, message: string, data: string, callback: jest.DoneCallback) {
	ws = new WebSocket('ws://localhost:3000');

	ws.on('message', (msg: string) => {
		m = JSON.parse(msg)
		expect(m.code).toBe(code);
		expect(m.message).toBe(message);
		expect(m.data).toBe(data);
		callback()

	});

	ws.on('open', () => {
		ws.send(JSON.stringify(requestMessage))
	});
}

function createRequestMessage(request: WarehouseServiceMessages, input: string): RequestMessage {
	return {
		client_name: Service.WAREHOUSE,
		client_request: request,
		input: input
	}
}
