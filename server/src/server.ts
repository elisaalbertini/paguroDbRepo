import express from 'express';
import { createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { check_service } from './check-service';

/**
 * Script used to initialize the server
 */
const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {

	ws.on('error', console.error);

	ws.on('message', (data: string) => {
		console.log('received: %s', data);
		check_service(JSON.parse(data), ws)

	});

	ws.on('open', () => {
		console.log('socket is open');
	});

	ws.on('close', () => {
		console.log('socket has closed');
	});
});

server.listen(3000, () => console.log('listening on port :3000'));
