import express from 'express'
import { createServer } from 'http'
import WebSocket, { Server as WebSocketServer } from 'ws'
import { checkService } from './check-service'
import { Log } from './schema/messages'
import { is } from 'typia'

/**
 * Script used to initialize the server
 */
const app = express()
const server = createServer(app)

const wss = new WebSocketServer({ server })
const manager = "MANAGER"

let managerWs = Array()
let employyWs = Array()

wss.on('connection', (ws: WebSocket) => {

	ws.on('error', console.error)

	ws.on('message', (data: string) => {
		console.log('received: %s', data)
		const parsedData = JSON.parse(data)
		if (is<Log>(parsedData)) {
			parsedData.message == manager ? managerWs.push(ws) : employyWs.push(ws)
		} else {
			checkService(parsedData, ws, managerWs, employyWs)
		}
	})

	ws.on('open', () => {
		console.log('socket is open')
	})

	ws.on('close', () => {
		managerWs = managerWs.filter(w => w != ws)
		console.log('socket has closed')
	})
})

server.listen(3000, () => console.log('listening on port :3000'))
