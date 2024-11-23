import axios, { AxiosResponse } from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import { assertEquals } from 'typia'
import { addItem, emptyMenuDb, getLastInsertedItem } from './utils/test-utils'
import { Item } from '../src/domain/item'
import { ApiResponse, EMPTY_MENU_DB, ERROR_ITEM_ALREADY_EXISTS, ERROR_ITEM_NOT_FOUND, ERROR_WRONG_PARAMETERS, OK } from './utils/ApiResponse'
import { friedEgg, omelette, pizza, scrambledEgg, updatedOmelette, wrongItem } from './utils/test-data'

const http = axios.create({
	baseURL: 'http://localhost:8085'
})

beforeEach(async () => {
	await emptyMenuDb()
	await addItem(omelette)
})

afterAll(() => {
	client.closeMongoClient()
	server.close()
})

function checkResponse<T>(res: AxiosResponse, expectedResponse: ApiResponse, expectedData: T, actualData?: T) {
	expect(res.status).toBe(expectedResponse.code)
	expect(res.statusText).toBe(expectedResponse.message)
	if (actualData != undefined) {
		expect(actualData).toStrictEqual(expectedData)
	} else {
		expect(res.data).toStrictEqual(expectedData)
	}
}

// read
test('Get Item by name', async () => {
	// ok
	const res = await http.get('/menu/omelette')
	checkResponse(res, OK, omelette, assertEquals<Item>(res.data))

	// empty
	await emptyMenuDb()
	await http.get('/menu/omelette').catch((error) => {
		checkResponse(error.response, ERROR_ITEM_NOT_FOUND, error.response.data)
	})

})

test('Get All Available Items', async () => {

	// ok
	const ok_ingredient = ["egg"]
	await addItem(pizza)
	const res = await http.get('/menu/available/' + JSON.stringify(ok_ingredient))
	checkResponse(res, OK, [omelette], assertEquals<Item[]>(res.data))

	//wrong parameters
	const wrong_param_ingredient = [2, "salt"]
	await http.get('/menu/available/' + JSON.stringify(wrong_param_ingredient)).catch((error) => {
		checkResponse(error.response, ERROR_WRONG_PARAMETERS, "")
	})

	// not found
	await emptyMenuDb()
	await addItem(pizza)
	const not_found_ingredient = ["salt"]
	await http.get('/menu/available/' + JSON.stringify(not_found_ingredient)).catch((error) => {
		checkResponse(error.response, EMPTY_MENU_DB, "")
	})
})

test('Get All Item', async () => {
	// ok
	const res = await http.get('/menu')
	checkResponse(res, OK, [omelette], assertEquals<Item[]>(res.data))

	// empty
	await emptyMenuDb()
	await http.get('/menu').catch((error) => {
		checkResponse(error.response, EMPTY_MENU_DB, "")
	})
})


// write
test('Add new item', async () => {

	let res = await http.post('/menu', friedEgg)
	let last = await getLastInsertedItem()
	checkResponse(res, OK, assertEquals<Item>(res.data), last)

	// send wrong format
	await http.post('/menu', wrongItem).catch((error) => {

		checkResponse(error.response, ERROR_WRONG_PARAMETERS, "")

	})
	// name already existing
	await http.post('/menu', friedEgg).catch((error) => {
		checkResponse(error.response, ERROR_ITEM_ALREADY_EXISTS, "")
	})
})

test('Update Item', async () => {
	// ok
	let res = await http.put('/menu', updatedOmelette)
	checkResponse(res, OK, updatedOmelette, assertEquals<Item>(res.data))

	// wrong parameters - price
	updatedOmelette.price = "2"
	await http.put('/menu', updatedOmelette).catch((error) => {
		checkResponse(error.response, ERROR_WRONG_PARAMETERS, "")
	})

	// wrong parameters - recipe (wrong type)
	updatedOmelette.price = 2
	updatedOmelette.recipe = [
		{
			ingredient_name: "egg",
			quantity: "2"
		}
	]
	await http.put('/menu', omelette).catch((error) => {
		checkResponse(error.response, ERROR_WRONG_PARAMETERS, "")
	})

	// wrong parameters - recipe (wrong recipe)
	updatedOmelette.recipe = {
		ingredient_name: "egg",
		quantity: "2"
	}

	await http.put('/menu', updatedOmelette).catch((error) => {
		checkResponse(error.response, ERROR_WRONG_PARAMETERS, "")
	})

	// not found
	await http.put('/menu', scrambledEgg).catch((error) => {
		checkResponse(error.response, ERROR_ITEM_NOT_FOUND, "")
	})
})
