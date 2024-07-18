import { MenuServiceMessages, OrdersServiceMessages, RequestMessage, ResponseMessage, WarehouseServiceMessages } from './utils/messages'
import { Service } from './utils/service';
import axios from 'axios';

const http = axios.create({
	baseURL: 'http://localhost:8080'
})
const httpOrders = axios.create({
	baseURL: 'http://localhost:8090'
})
const httpMenu = axios.create({
	baseURL: 'http://localhost:8085'
})
/**
 * this function is used to call the correct microservice and API based on the received RequestMessage. 
 * It also sends the answer back through the websocket
	  @param message sent by the client through the websocket
	@param ws the websocket communication used
**/
export function check_service(message: RequestMessage, ws: any) {
	console.log('received: %s', message);
	switch (message.client_name) {
		case Service.WAREHOUSE:
			warehouse_api(message.client_request, message.input, ws)
			break;
		case Service.MENU:
			menu_api(message.client_request, message.input, ws)
			break;
		default:
			orders_api(message.client_request, message.input, ws)
			break;
	}
}

function menu_api(message: string, input: string, ws: WebSocket) {
	switch (message) {
		case MenuServiceMessages.CREATE_ITEM.toString():
			handleResponse(httpMenu.post('/menu/', input), ws)
			break;
		default: //get item by name
			handleResponse(httpMenu.get('/menu/' + input), ws)
			break;
	}
}

function orders_api(message: string, input: string, ws: WebSocket) {
	switch (message) {
		case OrdersServiceMessages.CREATE_ORDER.toString():
			handleNewOrder(httpOrders.post('/orders/', input), input, ws)
			break;
		default: //get all orders
			handleResponse(httpOrders.get('/orders/'), ws)
			break;
	}
}

function warehouse_api(message: string, input: string, ws: WebSocket) {
	switch (message) {
		case WarehouseServiceMessages.CREATE_INGREDIENT.toString():
			handleResponse(http.post('/warehouse/', input), ws)
			break;
		case WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY.toString():
			handleResponse(http.put('/warehouse/', input), ws)
			break;
		case WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT.toString():
			handleResponse(http.get('/warehouse/available'), ws)
			break;
		case WarehouseServiceMessages.GET_ALL_INGREDIENT.toString():
			handleResponse(http.get('/warehouse/'), ws)
			break;
		// restock
		default: {
			const body = JSON.parse(input)
			const quantity = {
				"quantity": body.quantity
			}
			handleResponse(http.put('/warehouse/' + body.name, quantity), ws)
			break;
		}
	}
}

interface IArray {
	[index: string]: number;
}

async function calcUsedIngredient(item: string, ingredients: IArray, items: IArray) {
	let res = await httpMenu.get('/menu/' + item)
	for (let r of res.data.recipe) {
		let ingredient = r.ingredient_name
		let qty = r.quantity
		ingredients[ingredient] = Object.keys(ingredients).includes(ingredient) ? ingredients[ingredient] + (items[item] * qty) : items[item] * qty
	}
	return ingredients
}

function handleNewOrder(promise: Promise<any>, input: any, ws: WebSocket) {
	promise.then(async (res) => {
		if (res.status == 200) {
			const orederItems = input.items
			let items = {} as IArray
			let ingredients = {} as IArray
			for (let i of orederItems) {
				let ingredient: string = i.item.name.toString()
				let qty: number = i.quantity
				items[ingredient] = Object.keys(items).includes(ingredient) ? items[ingredient] + qty : qty
			}
			for (let i of Object.keys(items)) {
				ingredients = await calcUsedIngredient(i, ingredients, items)
			}
			let decrease = []
			for (let i of Object.keys(ingredients)) {
				decrease.push({
					"name": i,
					"quantity": ingredients[i]
				})
			}
			http.put('/warehouse/', decrease).then((e) => {
				const msg: ResponseMessage = {
					message: res.statusText,
					code: res.status,
					data: JSON.stringify(res.data)
				}
				ws.send(JSON.stringify(msg))
			})
		}
	}).catch((error) => {
		const msg = createErrorMessage(error)
		ws.send(JSON.stringify(msg))
	});
}

function handleResponse(promise: Promise<any>, ws: WebSocket) {
	promise.then((res) => {
		const msg: ResponseMessage = {
			message: res.statusText,
			code: res.status,
			data: JSON.stringify(res.data)
		}
		ws.send(JSON.stringify(msg))
	}).catch((error) => {
		const msg = createErrorMessage(error)
		ws.send(JSON.stringify(msg))
	});
}

function createErrorMessage(error: any) {
	let msg: ResponseMessage
	if (error.response == undefined) {
		msg = {
			message: "ERROR_SERVER_NOT_AVAILABLE",
			code: 500,
			data: ""
		}
	} else {
		msg = {
			message: error.response.statusText,
			code: error.response.status,
			data: ""
		}
	}
	return msg
}
