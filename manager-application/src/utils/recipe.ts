import { IArray } from "./array"
import { IngredientInRecipe } from "./schema/item"

/**
 * This function builds an array of IngredientInRecipe given the list of ingredient names and their quantity
 * @param selectedQuantities array of the quantity of specified by the user
 * @param selectedIngredients array of ingredient selected by the user
 * @returns an array of IngredientInRecipe
 */
export function buildRecipe(selectedQuantities: IArray, selectedIngredients: string[]): IngredientInRecipe[] {
	let recipe = Array()
	Object.keys(selectedQuantities).forEach(i => {
		if (selectedIngredients.includes(i)) {
			let newItem = {
				ingredient_name: i,
				quantity: selectedQuantities[i]
			}
			recipe.push(newItem)
		}
	})
	return recipe
}

/**
 * This function formats a given recipe to be printed in the web page
 * @param recipe 
 * @returns 
 */
export function formatRecipe(recipe: IngredientInRecipe[]) {
	let formattedRecipe = ""
	recipe.forEach(i => {
		const newElem = i.ingredient_name + " x" + i.quantity + ", "
		formattedRecipe = formattedRecipe + newElem
	})
	return formattedRecipe
}
