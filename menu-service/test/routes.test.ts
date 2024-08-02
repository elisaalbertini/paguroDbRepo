import axios from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import { assertEquals } from 'typia'
import { addItem, emptyMenuDb, getLastInsertedItem } from './utils/test-utils'
import { Item } from '../src/domain/item'
import { MenuMessage } from '../menu-message'

const http = axios.create({
	baseURL: 'http://localhost:8085'
})

const omelette: Item = {
	name: "omelette",
	recipe: [
		{
			ingredient_name: "egg",
			quantity: 2
		}
	],
	price: 3
}

beforeEach(async () => {
	await emptyMenuDb()
	await addItem(omelette)
})

afterAll(() => {
	client.closeMongoClient()
	server.close()
})

// read
test('Get Item by name', async () => {
	// ok
	const res = await http.get('/menu/omelette')
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(MenuMessage.OK)
	const item = assertEquals<Item>(res.data)
	expect(item).toStrictEqual(omelette)

	// empty
	await emptyMenuDb()
	await http.get('/menu/omelette').catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_ITEM_NOT_FOUND)
		expect(error.response.data).toStrictEqual("")
	})

})

test('Get All Available Items', async () => {
	const pizza: Item = {
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

	// ok
	const ok_ingredient = []
	ok_ingredient.push("egg")
	await addItem(pizza)
	const res = await http.get('/menu/available/' + JSON.stringify(ok_ingredient))
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(MenuMessage.OK)
	const item = assertEquals<Item[]>(res.data)
	expect(item).toStrictEqual([omelette])

	//wrong parameters
	const wrong_param_ingredient = []
	wrong_param_ingredient.push(2)
	wrong_param_ingredient.push("salt")
	await http.get('/menu/available/' + JSON.stringify(wrong_param_ingredient)).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual("")
	})

	// not found
	await emptyMenuDb()
	await addItem(pizza)
	const not_found_ingredient = []
	not_found_ingredient.push("salt")
	await http.get('/menu/available/' + JSON.stringify(not_found_ingredient)).catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(MenuMessage.EMPTY_MENU_DB)
		expect(error.response.data).toStrictEqual("")
	})
})

// write
test('Add new item', async () => {

	const friedEgg: Item = {
		name: "fried_egg",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 1
			}
		],
		price: 1
	}

	const wrongItem: any = {
		name: "boiled_egg",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 1
			}
		],
		price: "1"
	}

	let res = await http.post('/menu', friedEgg)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(MenuMessage.OK)
	const data = assertEquals<Item>(res.data)
	let last = await getLastInsertedItem()
	expect(data).toStrictEqual(last)

	// send wrong format
	await http.post('/menu', wrongItem).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual("")

	})
	// name already existing
	await http.post('/menu', friedEgg).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_ITEM_ALREADY_EXISTS)
		expect(error.response.data).toStrictEqual("")

	})
})

test('Get All Item', async () => {
	// ok
	const res = await http.get('/menu')
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(MenuMessage.OK)
	const item = assertEquals<Item[]>(res.data)
	expect(item).toStrictEqual([omelette])

	// empty
	await emptyMenuDb()
	await http.get('/menu').catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(MenuMessage.EMPTY_MENU_DB)
		expect(error.response.data).toStrictEqual("")
	})
})

test('Update Item', async () => {

	let omelette: any = {
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
		price: 1
	}
	const scrambledEgg = {
		name: "scrambled_egg",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 1
			}
		],
		price: 1
	}
	// ok
	let res = await http.put('/menu', omelette)
	expect(res.status).toBe(200)
	expect(res.statusText).toBe(MenuMessage.OK)
	const item = assertEquals<Item>(res.data)
	expect(item).toStrictEqual(omelette)

	// wrong parameters - price
	omelette['price'] = "2"
	await http.put('/menu', omelette).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual("")
	})

	// wrong parameters - recipe (wrong type)
	omelette['price'] = 2
	omelette['recipe'] = [
		{
			ingredient_name: "egg",
			quantity: "2"
		}
	]
	await http.put('/menu', omelette).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual("")
	})

	// wrong parameters - recipe (wrong recipe)
	omelette['recipe'] = {
		ingredient_name: "egg",
		quantity: "2"
	}

	await http.put('/menu', omelette).catch((error) => {
		expect(error.response.status).toBe(400)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
		expect(error.response.data).toStrictEqual("")
	})

	// not found
	omelette.name = "omelettes"
	await http.put('/menu', scrambledEgg).catch((error) => {
		expect(error.response.status).toBe(404)
		expect(error.response.statusText).toBe(MenuMessage.ERROR_ITEM_NOT_FOUND)
		expect(error.response.data).toStrictEqual("")
	})
})
