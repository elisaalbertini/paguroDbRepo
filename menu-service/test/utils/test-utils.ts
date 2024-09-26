import { Item } from "../../src/domain/item"
import { getMenuItems } from "../../src/repository/connection"

/**
 * Utility function to empty the collection
 */
export async function emptyMenuDb() {
	await (await getMenuItems()).deleteMany()
}

/**
 * Utility function to add an item into the collection
 * @param item 
 */
export async function addItem(item: Item) {
	await (await getMenuItems()).insertOne(item, { forceServerObjectId: true })
}

/**
 * Utility function to get the last inserted Item
 * @returns the last inserted Item
 */
export async function getLastInsertedItem(): Promise<Item> {
	let menuItems = (await getMenuItems()).find({}, { projection: { _id: 0 } })
	let last = (await menuItems.toArray()).pop()
	return last!
}
