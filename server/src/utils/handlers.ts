import { StatusCodes } from "http-status-codes"
import { http, httpMenu } from "./axios"
import { MissingIngredientNotification, ResponseMessage, ServiceResponse } from '../schema/messages'
import WebSocket from "ws"
import { Item, WarehouseIngredient } from "../schema/item"
import { Order, OrderItem } from "../schema/order"
import { NEW_ORDER_CREATED } from "./messages"

interface IArray {
	[index: string]: number
}

/**
 * This function creates an error message given the code and the message returned by an API lalalalalalalala
 * @param code 
 * @param msg 
 * @returns a new response message with empty data
 */
export function createErrorMessage(code: number, msg: string) {
	return JSON.stringify({
		code: code,
		message: msg,
		data: undefined
	})
}

/**
 * This function checks if the response of an error message is undefined and if it's the case 
 * it returns "ERROR_SERVER_NOT_AVAILABLE", otherwise it returns the response of the message
 * @param error 
 * @returns 
 */
export function checkErrorMessage(error: any) {
	return error.response == undefined ? createErrorMessage(StatusCodes.INTERNAL_SERVER_ERROR, "ERROR_SERVER_NOT_AVAILABLE") :
		createErrorMessage(error.response.status, error.response.statusText)
}

async function calcUsedIngredient(item: string, ingredients: IArray, items: IArray) {
	let res: ServiceResponse<Item> = await httpMenu.get('/menu/' + item)
	for (let r of res.data.recipe) {
		let ingredient = r.ingredient_name
		let qty = r.quantity
		ingredients[ingredient] =
			Object.keys(ingredients).includes(ingredient) ?
				ingredients[ingredient] + (items[item] * qty) : items[item] * qty
	}
	return ingredients
}

function calcItemNumber(orderItem: OrderItem[]) {
	let items = {} as IArray
	orderItem.forEach((i) => {
		items[i.item.name.toString()] = i.quantity
	})
	return items
}

function getNames(array: WarehouseIngredient[]) {
	let names = Array()
	array.forEach((i) => {
		names.push(i.name)
	})
	return names
}

function getQuantity(array: WarehouseIngredient[], name: string) {
	return array.filter((i) => { return i.name == name })[0].quantity
}

/**
 * This function checks if there are enough ingredients in the warehouse to complete the order  
 * @param input the order
 * @returns true if there are enough ingredients, false otherwise
 */
export async function checkOrder(input: Order): Promise<StatusCodes> {
	let response = StatusCodes.INTERNAL_SERVER_ERROR
	await http.get('/warehouse/available/').then(async (res: ServiceResponse<WarehouseIngredient[]>) => {
		const availableIngredients = res.data
		let ingredients = {} as IArray
		const itemNumbers = calcItemNumber(input.items)
		for (let item of Object.keys(itemNumbers)) {
			ingredients = await calcUsedIngredient(item, ingredients, itemNumbers)
		}
		response = (Object.keys(ingredients).filter((name) => {
			return getNames(availableIngredients).includes(name) && (ingredients[name]
				<= getQuantity(availableIngredients, name))
		}).length == Object.keys(ingredients).length) ? StatusCodes.OK : StatusCodes.BAD_REQUEST
	}).catch((e) => {
		response = e.response == undefined ? StatusCodes.INTERNAL_SERVER_ERROR : e.response.status
	})
	return response
}

function checkAndNotify(oldAvailableIngredients: WarehouseIngredient[], managerWs: WebSocket[]) {
	http.get('/warehouse/').then((resAvailable: ServiceResponse<WarehouseIngredient[]>) => {
		let availableIngredientsnames = Array()
		resAvailable.data.forEach((i) => {
			if (i.quantity > 0) {
				availableIngredientsnames.push(i.name)
			}
		})

		let missingIngredients = oldAvailableIngredients.filter((i) => !availableIngredientsnames.includes(i.name))

		if (missingIngredients.length > 0) {
			const notification: MissingIngredientNotification = {
				message: "NEW_MISSING_INGREDIENTS",
				data: missingIngredients
			}
			sendToAllWs(managerWs, JSON.stringify(notification))
		}
	})
}

function sendToAllWs(WsArray: WebSocket[], msg: string) {
	WsArray.forEach(ws => {
		ws.send(msg)
	})
}

/**
 * This function handles the creation of a new order. If the new order is sucessfully created, 
 * it removes the ingredients necessary to complete the order from the warehouse.
 * If one or more ingredients become missing, it sends to all the manager frontends logged a notification.
 * At the end, it sends a message back with the response of the API.
 * @param promise returned by the create order API
 * @param ws 
 * @param managerWs array of all the manager frontends logged
 * @param employeeWs array of all the employee frontends logged
 */
export function handleNewOrder(promise: Promise<ServiceResponse<Order>>, ws: WebSocket, managerWs: WebSocket[], employeeWs: WebSocket[]) {
	promise.then(async (res) => {
		const orderItems = res.data.items
		let ingredients = {} as IArray
		const items = calcItemNumber(orderItems)
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
		http.get('/warehouse/available').then((checkMissingIngredient: ServiceResponse<WarehouseIngredient[]>) => {
			const oldAvailable = checkMissingIngredient.data

			http.put('/warehouse/', decrease).then(() => {
				const msg: ResponseMessage = {
					message: res.statusText,
					code: res.status,
					data: res.data
				}
				sendToAllWs(employeeWs, JSON.stringify({
					message: NEW_ORDER_CREATED
				}))
				ws.send(JSON.stringify(msg))
				checkAndNotify(oldAvailable, managerWs)
			})
		})
	}).catch((error) => {
		ws.send(checkErrorMessage(error))
	})
}

/**
 * This function handles the call of an API. It sends a message back with the response.
 * @param promise returned by the API
 * @param ws 
 */
export function handleResponse(promise: Promise<ServiceResponse<any>>, ws: WebSocket) {
	promise.then((res) => {
		const msg: ResponseMessage = {
			message: res.statusText,
			code: res.status,
			data: res.data
		}
		ws.send(JSON.stringify(msg))
	}).catch((error) => {
		ws.send(checkErrorMessage(error))
	})
}


