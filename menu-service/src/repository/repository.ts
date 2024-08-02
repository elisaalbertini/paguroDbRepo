import { MenuMessage } from "../../menu-message";
import { IngredientInRecipe, Item } from "../domain/item";
import * as mongoConnection from "./connection"

/**
 * This type represents the Response given by the repository. It consists of the generic data and an MenuMessage
 */
type RepositoryResponse<T> = { data?: T, message: MenuMessage };

const collection = mongoConnection.getMenuItems()

/**
 *  Inserts an item into the repository with the provided information
 * @param name 
 * @param price 
 * @param recipe 
 * @returns a Promise with the Repository Response containing the new Item data and the message OK if the operation was successful, 
 *          otherwise it returns the message ERROR_ITEM_ALREADY_EXISTS
 */
export async function createItem(name: string, price: number, recipe: IngredientInRecipe[]): Promise<RepositoryResponse<Item>> {

	const items = await collection
	const correctName = name.replace(/ /g, "_");

	const menuItem: Item = {
		name: correctName,
		price: price,
		recipe: recipe
	}

	try {
		await items.insertOne(menuItem, { forceServerObjectId: true })
		return { data: menuItem, message: MenuMessage.OK };
	} catch (error) {
		return { message: MenuMessage.ERROR_ITEM_ALREADY_EXISTS };
	}

}

/**
 * Get an item given its name
 * @param name 
 * @returns a Promise with the Repository Response containing the searched Item data and the message OK if the operation was successful, 
 *          otherwise it returns the message ERROR_ITEM_NOT_FOUND
 */
export async function getItemByName(name: string): Promise<RepositoryResponse<Item>> {

	const items = await collection
	const correctName = name.replace(/ /g, "_");

	const res = await items.findOne({ name: correctName }, { projection: { _id: 0 } })

	if (res != null) {
		return { data: res, message: MenuMessage.OK }
	} else {
		return { message: MenuMessage.ERROR_ITEM_NOT_FOUND };
	}
}

/**
 * It returs a Promise with the repository response and all the items in the repository
 * @returns MenuMessage.OK if there are items, MenuMessage.EMPTY_ORDERS_DB otherwise
 */
export async function getAllItems(): Promise<RepositoryResponse<Item[]>> {

	const menuItems = await (await collection).find({}, { projection: { _id: 0 } }).toArray() as Item[]

	if (menuItems.length > 0) {
		return { data: menuItems, message: MenuMessage.OK }
	} else {
		return { message: MenuMessage.EMPTY_MENU_DB };
	}
}

/**
 * It returs a Promise with the repository response and all the updated item
 * @param name 
 * @param item 
 * @returns MenuMessage.OK if the item was successfully updated, MenuMessage.ERROR_ITEM_NOT_FOUND otherwise
 */
export async function updateItem(name: string, item: any): Promise<RepositoryResponse<Item>> {

	const filter = { name: name }
	const options = { upsert: false }

	const res = await (await collection).updateOne(filter, item, options)

	if (res.modifiedCount == 1) {
		const data = await getItemByName(name)
		return { data: data.data, message: MenuMessage.OK }
	} else {
		return { message: MenuMessage.ERROR_ITEM_NOT_FOUND };
	}
}

/**
 * It returs a Promise with the repository response and all the items in the repository all recipes 
 * whose ingredients are contained in the available ingredient list
 * @param availableIngredients 
 * @returns MenuMessage.OK if there are items, MenuMessage.EMPTY_MENU_DB otherwise
 */
export async function getAllAvailableItems(availableIngredients: string[]): Promise<RepositoryResponse<Item[]>> {

	const items = (await (await collection).find({
		$expr: {
			$setIsSubset: [
				{ $map: { input: "$recipe", as: "recipe", in: "$$recipe.ingredient_name" } },
				availableIngredients
			]
		}
	}, { projection: { _id: 0 } }).toArray())

	if (items.length > 0) {
		return { data: items, message: MenuMessage.OK }
	} else {
		return { message: MenuMessage.EMPTY_MENU_DB };
	}
}
