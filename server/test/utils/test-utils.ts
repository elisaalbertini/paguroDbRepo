import { OrdersServiceMessages, ResponseMessage } from "../../src/utils/messages";
import { Service } from "../../src/utils/service";
import { getCollection } from "./db-connection";
import { addIdandState } from "./order-json-utils";

export const milk = {
	name: "milk",
	quantity: 95
}

export const tea = {
	name: "tea",
	quantity: 0
}

export const omelette = {
	name: "omelette",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 2
		}
	],
	price: 3
}
export const boiledEgg = {
	name: "boiled_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: 1
}
export const friedEgg = {
	name: "fried_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: 1
}

export const order: any = {
	"customerContact": "c1",
	"price": 1,
	"type": "HOME_DELIVERY",
	"state": "PENDING",
	"items": [
		{
			"item": {
				"name": "i1"
			},
			"quantity": 2
		},
	]
}

export const newWrongOrder = {
	"customerContact": "c1",
	"price": "1",
	"type": "HOME_DELIVERY",
	"items": [
		{
			"item": {
				"name": "omelette"
			},
			"quantity": 2
		},
	]
}

export const egg = {
	"name": "egg",
	"quantity": 20
}

export const orderItemQuantity = 2

/**
 * Check that the responce message is correct
 * @param msg that has to be checked
 * @param code correct code
 * @param message correct message
 * @param data correct data. Id and state are added to data if the request was to create a new order
 * @param request request of the client
 */
export async function check_order_message(msg: ResponseMessage, code: number, message: string, data: any, request: string) {
	console.log(msg.message)
	expect(msg.code).toBe(code);
	expect(msg.message).toBe(message);
	if (msg.code == 200) {
		if (request == OrdersServiceMessages.CREATE_ORDER.toString()) {
			expect(JSON.parse(msg.data)).toStrictEqual(JSON.parse(await addIdandState(data)));
			//check ingredient db
			let dbEgg = await (await getCollection("Warehouse", "Ingredient")).findOne({ name: "egg" }, { projection: { _id: 0 } })
			const qty = egg.quantity - (omelette.recipe[0].quantity * orderItemQuantity)
			expect(dbEgg?.quantity).toBe(qty)
		} else {
			expect(JSON.parse(msg.data)).toStrictEqual(JSON.parse(data));
		}
	} else {
		expect(msg.data).toBe("")
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
