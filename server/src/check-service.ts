import { catchErrorAndSendMsg, http, httpMenu, httpOrders } from './utils/axios'
import {
	MenuServiceMessages, OrdersServiceMessages,
	RequestMessage, WarehouseServiceMessages
} from './utils/messages'
import { Service } from './utils/service'
import WebSocket from 'ws'
import { checkOrder, createErrorMessage, handleNewOrder, handleResponse } from './utils/utils'
import { StatusCodes } from 'http-status-codes'

/**
 * This function is used to call the correct microservice and API based on the received RequestMessage. 
 * It also sends the answer back through the websocket
 * @param message sent by the client through the websocket
 * @param currentWs the websocket communication used
 * @param managerWs list of manager application web socket 
 */
export function checkService(message: RequestMessage, currentWs: WebSocket, managerWs: WebSocket[]) {
	switch (message.client_name) {
		case Service.WAREHOUSE:
			warehouseApi(message.client_request, message.input, currentWs)
			break
		case Service.MENU:
			menuApi(message.client_request, message.input, currentWs)
			break
		default:
			ordersApi(message.client_request, message.input, currentWs, managerWs)
			break
	}
}

async function menuApi(message: string, input: any, ws: WebSocket) {
	let names: string[] = []
	switch (message) {
		case MenuServiceMessages.CREATE_ITEM:
			handleResponse(httpMenu.post('/menu/', input), ws)
			break
		case MenuServiceMessages.GET_ITEMS:
			handleResponse(httpMenu.get('/menu/'), ws)
			break
		case MenuServiceMessages.UPDATE_ITEM:
			handleResponse(httpMenu.put('/menu/', input), ws)
			break
		case MenuServiceMessages.GET_AVAILABLE_ITEMS:
			catchErrorAndSendMsg(http.get('/warehouse/available/').then((res) => {
				const availableIng: any[] = res.data

				availableIng.forEach(e => {
					names.push(e.name)
				})

				handleResponse(httpMenu.get('/menu/available/' + JSON.stringify(names)), ws)
			}), ws)
			break
		default: //get item by name
			handleResponse(httpMenu.get('/menu/' + input), ws)
			break
	}
}

function ordersApi(message: string, input: any, ws: WebSocket, managerWs: WebSocket[]) {
	switch (message) {
		case OrdersServiceMessages.CREATE_ORDER:
			checkOrder(input).then((res) => {
				switch (res) {
					case StatusCodes.OK:
						handleNewOrder(httpOrders.post('/orders/', input), input, ws, managerWs)
						break
					case StatusCodes.INTERNAL_SERVER_ERROR:
						ws.send(createErrorMessage(res, "ERROR_MICROSERVICE_NOT_AVAILABLE"))
						break
					default:
						ws.send(createErrorMessage(StatusCodes.BAD_REQUEST, "ERROR_MISSING_INGREDIENTS"))
				}
			})
			break
		case OrdersServiceMessages.GET_ORDER_BY_ID:
			handleResponse(httpOrders.get('/orders/' + input), ws)
			break
		case OrdersServiceMessages.PUT_ORDER:
			catchErrorAndSendMsg(httpOrders.get('/orders/' + input._id).then((res) => {
				res.data["state"] = input.state
				catchErrorAndSendMsg(httpOrders.put('/orders/', res.data).then(() => {
					handleResponse(httpOrders.get('/orders/'), ws)
				}), ws)
			}), ws)
			break
		default: //get all orders
			handleResponse(httpOrders.get('/orders/'), ws)
			break
	}
}

function warehouseApi(message: string, input: any, ws: WebSocket) {
	switch (message) {
		case WarehouseServiceMessages.CREATE_INGREDIENT:
			handleResponse(http.post('/warehouse/', input), ws)
			break
		case WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY:
			handleResponse(http.put('/warehouse/', input), ws)
			break
		case WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT:
			handleResponse(http.get('/warehouse/available'), ws)
			break
		case WarehouseServiceMessages.GET_ALL_INGREDIENT:
			handleResponse(http.get('/warehouse/'), ws)
			break
		// restock
		default: {
			handleResponse(http.put('/warehouse/' + input.name, {
				"quantity": input.quantity
			}), ws)
			break;
		}
	}
}
