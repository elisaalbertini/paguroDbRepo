import { getLastInsertedOrder } from "./db-connection"
import { OrderState } from "./test-utils"

/**
 * Adds id and state to a given order.
 * The id is the id of the last order inserted into the database.
 * The state is "PENDING"
 * @param order that has to be modified
 * @returns the modified order
 */
export async function addIdandState(order: any) {
	let last = await getLastInsertedOrder()
	let output = { ...order }
	output["_id"] = last?._id.toString()
	output["state"] = OrderState.PENDING
	return output
}

/**
 * Adds id to a given order.
 * @param order that has to be modified
 * @param id of that has to be added
 * @returns the modified order
 */
export function addId(order: any, id: string) {
	let output = { ...order }
	output["_id"] = id
	return output
}
