/**
 * Item schema
 */
export interface Item {
	name: string,
	recipe: IngredientInRecipe[],
	price: number
}

/**
 * Ingredient in recipe schema
 */
export interface IngredientInRecipe {
	ingredient_name: string,
	quantity: number
}

/**
 * Ingredient in the warehouse schema
 */
export interface WarehouseIngredient {
	name: string,
	quantity: number
}

