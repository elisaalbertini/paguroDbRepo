import { Item } from "../../src/domain/item"

export const omelette: Item = {
	name: "omelette",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 2
		}
	],
	price: 3
}


export const updatedOmelette: any = {
	name: "omelette",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		},
		{
			ingredient_name: "salt",
			quantity: 1
		}
	],
	price: 2
}

export const pizza: Item = {
	name: "pizza",
	recipe: [
		{
			ingredient_name: "tomato",
			quantity: 2
		},
		{
			ingredient_name: "mozzarella",
			quantity: 2
		}
	],
	price: 5
}

export const friedEgg: Item = {
	name: "fried_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: 1
}

export const wrongItem: any = {
	name: "boiled_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: "1"
}

export const scrambledEgg: Item = {
	name: "scrambled_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: 1
}

