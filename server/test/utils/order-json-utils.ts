import { getLastInsertedOrder } from "./db-connection"

/**
 * Adds id and state to a given order.
 * The id is the id of the last order inserted into the database.
 * The state is "PENDING"
 * @param order that has to be modified
 * @returns the modified order as a string
 */
export async function addIdandState(order: any) {
	let last = await getLastInsertedOrder()
	let output = order
	output["_id"] = last?._id
	output["state"] = "PENDING"
	return JSON.stringify(output)
}

/**
 * Adds id to a given order.
 * @param order that has to be modified
 * @param id of that has to be added
 * @returns the modified order as a string
 */
export function addId(order: any, id: string) {
	let output = order
	output["_id"] = id
	return "[" + JSON.stringify(output) + "]"
}
