export const newOrderOmelette = {
	"customerEmail": "c2@example.com",
	"price": 1,
	"type": "TAKE_AWAY",
	"items": [
		{
			"item": {
				"name": "omelette"
			},
			"quantity": 2
		},
	]
}

export const newOrderNotification = {
	"customerEmail": "c3@example.com",
	"price": 1,
	"type": "TAKE_AWAY",
	"items": [
		{
			"item": {
				"name": "omelette"
			},
			"quantity": 1
		},
		{
			"item": {
				"name": "fried_egg"
			},
			"quantity": 2
		},
	]
}

export const newOrderMissingIngredient = {
	"customerEmail": "c4@example.com",
	"price": 1,
	"type": "TAKE_AWAY",
	"items": [
		{
			"item": {
				"name": "omelette"
			},
			"quantity": 3
		},
	]
}

export const milk = {
	name: "milk",
	quantity: 95
}

export const salt = {
	name: "salt",
	quantity: 95
}

export const tea = {
	name: "tea",
	quantity: 0
}

export const omelette = {
	name: "omelette",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 2
		}
	],
	price: 3
}

export const blackCoffee = {
	name: "black_coffee",
	recipe: [
		{
			ingredient_name: "coffee",
			quantity: 1
		}
	],
	price: 1
}

export const boiledEgg = {
	name: "boiled_egg",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 1
		}
	],
	price: 1
}
export const friedEgg = {
	name: "fried_egg",
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
	price: 1
}

export const order: any = {
	"customerEmail": "c1@example.com",
	"price": 1,
	"type": "HOME_DELIVERY",
	"state": "PENDING",
	"items": [
		{
			"item": {
				"name": "i1"
			},
			"quantity": 2
		},
	]
}

export const newWrongOrder = {
	"customerEmail": "c1@example.com",
	"price": "1",
	"type": "HOME_DELIVERY",
	"items": [
		{
			"item": {
				"name": "omelette"
			},
			"quantity": 2
		},
	]
}

export const egg = {
	"name": "egg",
	"quantity": 4
}


export const coffee = {
	"name": "coffee",
	"quantity": 20
}
