import express from 'express';
import { createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { check_service } from './check-service';
import { Frontend, Log } from './utils/messages';
import { is } from 'typia';

/**
 * Script used to initialize the server
 */
const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

let managerWs = Array()
let employeeWs = Array()
let customerWs = Array()

function checkMessage(msg: string, ws: WebSocket) {
	switch (msg) {
		case Frontend.MANAGER: {
			managerWs.push(ws)
			break
		}
		case Frontend.EMPLOYEE: {
			employeeWs.push(ws)
			break
		}
		case Frontend.CUSTOMER: {
			customerWs.push(ws)
			break
		}
		default: {
			check_service(JSON.parse(msg), ws, managerWs)
			break
		}
	}
}

wss.on('connection', (ws: WebSocket) => {

	ws.on('error', console.error);

	ws.on('message', (data: string) => {
		console.log('received: %s', data)
		const parsedData = JSON.parse(data)

		if (is<Log>(parsedData)) {
			checkMessage(parsedData.message, ws)
		} else {
			checkMessage(data, ws)
		}
	});

	ws.on('open', () => {
		console.log('socket is open');
	});

	ws.on('close', () => {
		employeeWs = employeeWs.filter(w => w != ws)
		customerWs = customerWs.filter(w => w != ws)
		managerWs = managerWs.filter(w => w != ws)
		console.log('socket has closed');
	});
});

server.listen(3000, () => console.log('listening on port :3000'));
