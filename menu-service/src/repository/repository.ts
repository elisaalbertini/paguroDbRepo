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
