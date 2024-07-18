/**
 * his interface represents an item
 */
export interface Item {
	name: string,
	recipe: IngredientInRecipe[],
	price: number
}

/**
 * This interface represents an ingredient of the recipe
 */
export interface IngredientInRecipe {
	ingredient_name: string,
	quantity: number
}
