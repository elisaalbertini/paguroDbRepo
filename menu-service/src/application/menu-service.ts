import { MenuMessage } from "../../menu-message";
import { IngredientInRecipe, Item } from "../domain/item";
import * as repository from "../repository/repository";

/**
 * This type represents the Response given by the Service. It consists of the generic data and an MenuMessage
 */
type ServiceResponse<T> = { data?: T, message: MenuMessage };

/**
 * Service functinality to add a new item given its information:
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
