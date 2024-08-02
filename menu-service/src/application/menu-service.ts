import { MenuMessage } from "../../menu-message";
import { IngredientInRecipe, Item } from "../domain/item";
import * as repository from "../repository/repository";

/**
 * This type represents the Response given by the Service. It consists of the generic data and an MenuMessage
 */
type ServiceResponse<T> = { data?: T, message: MenuMessage };

/**
 * Service functionality to add a new item given its information:
 * @param name
 * @param price 
 * @param recipe
 * @returns a Promise with the Service Response containing the new Item data and the message returned by the repository 
 */
export async function addNewItem(name: string, price: number, recipe: IngredientInRecipe[]): Promise<ServiceResponse<Item>> {
	let res = await repository.createItem(name, price, recipe)
	return { data: res.data, message: res.message }

}

/**
 * Service functionality to get an item given its name
 * @param name 
 * @returns a Promise with the Service Response containing the searched Item data and the message returned by the repository 
 */
export async function getItemByName(name: string): Promise<ServiceResponse<Item>> {
	let res = await repository.getItemByName(name)
	return { data: res.data, message: res.message }
}

/**
 * Service functionality to get all the items
 * @returns a Promise with the Service Response containing the searched Item data and the message returned by the repository 
 */
export async function getAllMenuItems(): Promise<ServiceResponse<Item[]>> {
	let res = await repository.getAllItems()
	return { data: res.data, message: res.message }
}

/**
 * Service functionality to update an item
 * @param name 
 * @param item 
 * @returns a Promise with the Service Response containing the searched Item data and the message returned by the repository 
 */
export async function updateMenuItem(name: string, item: any): Promise<ServiceResponse<Item>> {
	let res = await repository.updateItem(name, item)
	return { data: res.data, message: res.message }
}

/**
 * Service functionality to get all the items whose ingredients are contained in the available ingredient name list
 * @param availableIngredient 
 * @returns a Promise with the Service Response containing the searched Item data and the message returned by the repository 
 */
export async function getAllAvailableMenuItems(availableIngredient: string[]): Promise<ServiceResponse<Item[]>> {
	let res = await repository.getAllAvailableItems(availableIngredient)
	return { data: res.data, message: res.message }
}
