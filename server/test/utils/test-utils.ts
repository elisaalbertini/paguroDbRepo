import { createServer, IncomingMessage, Server, ServerResponse } from "http"
import { NEW_ORDER_CREATED, OrdersServiceMessages } from "../../src/utils/messages"
import { RequestMessage, ResponseMessage } from '../../src/schema/messages'
import { Service } from "../../src/utils/service"
import { ApiResponse } from "./api-response"
import { DbCollections, DbNames, getCollection } from "./db-connection"
import { addIdandState } from "./order-json-utils"
import { WebSocket, WebSocketServer } from 'ws'
import { checkService } from "../../src/check-service"
import express from "express"
import { egg, salt } from "./test-data"
import { StatusCodes } from "http-status-codes"

const app = express()
let wsRoute: WebSocket
let wsCheckService: WebSocket
let wss: WebSocketServer
let server: Server<typeof IncomingMessage, typeof ServerResponse>
let wsManager: WebSocket
let wsEmployee: WebSocket
const managerWsMsg = "Manager frontend web socket"
const employeeWsMsg = "Employee frontend web socket"
const orderWsMsg = "New order web socket"

interface IArray {
	[index: string]: number
}

const createOrderIngredients = {} as IArray
createOrderIngredients[egg.name] = egg.quantity
createOrderIngredients[salt.name] = salt.quantity

/**
 * This function closes the server
 */
export function closeServer() {
	server.close()
}

/**
 * This function initializes the server
 */
export function initializeServer() {
	server = createServer(app)
	wss = new WebSocketServer({ server })
}

/**
 * This function closes the web socket used for the routes tests, 
 * the one used for the check service tests and the manager application one
 */
export function closeWs() {
	closeWsIfOpened(wsCheckService)
	closeWsIfOpened(wsRoute)
	closeWsIfOpened(wsManager)
	closeWsIfOpened(wsEmployee)
}

function openWsRoute(address: string) {
	wsRoute = new WebSocket(address)
}

/**
 * This function opems the check service used for the routes tests
 * @param address 
 */
export function openWsCheckService(address: string) {
	wsCheckService = new WebSocket(address)
}

function onMessage(ws: WebSocket, expectedResponse: ResponseMessage, request: RequestMessage, callback: jest.DoneCallback) {
	ws.on('message', async (msg: string) => {
		await checkMessage(JSON.parse(msg), expectedResponse, request)
		callback()
	})
}

/**
 * This function sends a message to the server with a request, collects the response and check if it's correct
 * @param requestMessage 
 * @param expectedResponse 
 * @param callback 
 */
export function startWebsocket(requestMessage: RequestMessage, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	openWsRoute('ws://localhost:3000')
	onMessage(wsRoute, expectedResponse, requestMessage, callback)

	wsRoute.on('open', () => {
		wsRoute.send(JSON.stringify(requestMessage))
	})
}

/**
 * This function calls check service given a request message, collects the response and check if it's correct
 * @param requestMessage 
 * @param expectedResponse 
 * @param callback 
 */
export function createConnectionAndCall(requestMessage: RequestMessage, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	wss.on('connection', (ws) => {
		ws.on('error', console.error)
		onMessage(ws, expectedResponse, requestMessage, callback)
	})
	server.listen(8081, () => console.log('listening on port :8081'))

	openWsCheckService('ws://localhost:8081')
	wsCheckService.on('open', () => {
		const managerWsArray = Array()
		const employeeWsArray = Array()
		checkService(requestMessage, wsCheckService, managerWsArray, employeeWsArray)
	})
}

/**
 * Check that the response message is correct
 * @param msg that has to be checked
 * @param expectedResponse correct response
 * @param request request of the client (if needed)
 */
export async function checkMessage(msg: ResponseMessage, expectedResponse: ResponseMessage, request?: RequestMessage) {
	const expectedData = expectedResponse.data
	expect(msg.code).toBe(expectedResponse.code)
	expect(msg.message).toBe(expectedResponse.message)
	if (msg.code == StatusCodes.OK) {
		if (request?.client_request == OrdersServiceMessages.CREATE_ORDER) {
			expect(msg.data).toStrictEqual(await addIdandState(expectedData))
			//check ingredient db
			let ingredients = {} as IArray
			request.input.items.forEach(async (i: any) => {
				let item = await (await getCollection(DbNames.MENU, DbCollections.MENU))
					.findOne({ name: i.name }, { projection: { _id: 0 } })
				item?.recipe.forEach((ing: any) => {
					if (ingredients[ing.ingredient_name] != undefined) {
						ingredients[ing.ingredient_name]
							= ingredients[ing.ingredient_name] + ing.quantity
					} else {
						ingredients[ing.ingredient_name] = ing.quantity
					}
				})
			})
			Object.keys(ingredients).forEach(async (ing: any) => {
				let dbQty = await (await getCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE))
					.findOne({ name: ing }, { projection: { _id: 0 } })
				expect(dbQty).toBe(createOrderIngredients[ing] - ingredients[ing])
			})
		} else {
			expect(msg.data).toStrictEqual(expectedData)
		}
	} else {
		expect(msg.data).toBe(undefined)
	}
}

/**
 * Create a request message
 * @param client that represent the microservice
 * @param request of the client
 * @param input body of the request
 * @returns a request message
 */
export function createRequestMessage(client: Service, request: string, input: any) {
	return {
		client_name: client,
		client_request: request,
		input: input
	}
}

/**
 * Create a response message
 * @param code
 * @param msg 
 * @param data 
 * @returns a response message
 */
export function createResponseMessage(response: ApiResponse, data: any): ResponseMessage {
	return {
		code: response.code,
		message: response.message,
		data: data
	}
}

/**
 * Check if a web socket is open and closes it if it is
 * @param ws web socket that have to be close
 */
export function closeWsIfOpened(ws: WebSocket) {
	if (ws?.OPEN) {
		ws.close()
	}
}

/**
 * Possible states that an order can have 
 */
export const OrderState = {
	PENDING: "PENDING",
	READY: "READY",
	COMPLETED: "COMPLETED"
}

interface IWebsocketArray {
	[index: string]: WebSocket
}

/**
 * This function calls check service given a request message, 
 * collects the response and check if it's correct in case a new order is created
 * @param requestMessage 
 * @param expectedResponse 
 * @param callback 
 */
export function createConnectionAndCallNewOrder(requestMessage: RequestMessage, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	let connections: Map<WebSocket, string> = new Map()
	let wsArray = {} as IWebsocketArray
	wss.on('connection', (ws: WebSocket) => {
		ws.on('error', console.error)

		ws.on('message', async (msg: string) => {
			if (msg == managerWsMsg) {
				wsArray[managerWsMsg] = ws
			} else if (msg == orderWsMsg) {
				wsArray[orderWsMsg] = ws
			} else if (msg == employeeWsMsg) {
				wsArray[employeeWsMsg] = ws
			} else {
				connections.set(ws, msg)
				if (connections.size == 3) {
					const orederRes = JSON.parse(connections.get(wsArray[orderWsMsg])!)
					const managerRes = JSON.parse(connections.get(wsArray[managerWsMsg])!)
					const employeeRes = JSON.parse(connections.get(wsArray[employeeWsMsg])!)

					expect(wsArray[managerWsMsg]).toBe(ws)
					expect(wsArray[orderWsMsg] == ws).toBeFalsy
					expect(wsArray[employeeWsMsg] == ws).toBeFalsy

					// server
					expectedResponse.data = await addIdandState(expectedResponse.data)
					checkMessage(orederRes, expectedResponse, requestMessage).then(() => {
						expect(employeeRes.message).toBe(NEW_ORDER_CREATED)
						expect(managerRes.message).toBe("NEW_MISSING_INGREDIENTS")
						expect(managerRes.data).toStrictEqual([egg])
						callback()
					})
				}
			}
		})
	})
	server.listen(8081, () => console.log('listening on port :8081'))

	openWsCheckService('ws://localhost:8081')
	wsCheckService.on('open', () => {
		let managerWsArray = Array()
		managerWsArray.push(wsManager)
		const employeeWsArray = Array()
		employeeWsArray.push(wsEmployee)
		checkService(requestMessage, wsCheckService, managerWsArray, employeeWsArray)
		wsCheckService.send(orderWsMsg)
	})

	wsManager = new WebSocket('ws://localhost:8081')
	wsManager.on('open', () => {
		wsManager.send(managerWsMsg)
	})

	wsEmployee = new WebSocket('ws://localhost:8081')
	wsEmployee.on('open', () => {
		wsEmployee.send(employeeWsMsg)
	})
}

