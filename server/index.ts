import express from 'express';
import { createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { RequestMessage } from './utils/messages'
import { check_service } from './check_service';

const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
    ws.on('error', console.error);

    ws.on('message', (data: RequestMessage) => {
        console.log('received: %s', data);
        check_service(data)
    });
});

app.get('/', (req, res) => res.send('Hello World'));

server.listen(3000, () => console.log('listening on port :3000'));