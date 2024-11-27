import { Service } from '../src/utils/service'
import { WarehouseServiceMessages } from '../src/utils/messages'
import { ResponseMessage } from '../src/schema/messages'
import { add, cleanCollection, closeMongoClient, DbCollections, DbNames, getCollection } from './utils/db-connection'
import {
	closeServer,
	closeWs, createConnectionAndCall, createRequestMessage, createResponseMessage,
	initializeServer, startWebsocket
} from './utils/test-utils'
import { ERROR_INGREDIENT_ALREADY_EXISTS, ERROR_INGREDIENT_NOT_FOUND, ERROR_INGREDIENT_QUANTITY, OK } from './utils/api-response'
import { coffee, milk, tea } from './utils/test-data'

// milk 95, tea 0
let qty = 10

beforeAll(async () => {
	await (await getCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE)).createIndex({ name: 1 }, { unique: true })
})

afterEach(() => {
	closeWs()
	closeServer()
})
beforeEach(async () => {
	await cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE)
	await add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, milk)
	await add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, tea)
	initializeServer()
})

afterAll(() => { closeMongoClient() })

const testCheckService = (action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) => {
	createConnectionAndCall(createRequestMessage(Service.WAREHOUSE, action, input), expectedResponse, callback)
}

const testApi = (action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) => {
	startWebsocket(createRequestMessage(Service.WAREHOUSE, action, input), expectedResponse, callback)
}

// read
test('Get all Ingredient Test (check-service) - 200', done => {
	testCheckService(WarehouseServiceMessages.GET_ALL_INGREDIENT, '',
		createResponseMessage(OK, [milk, tea]), done)
})

test('Get all Available Ingredient Test (check-service) - 200', done => {
	testCheckService(WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT, '',
		createResponseMessage(OK, [milk]), done)
})

test('Get all Ingredient Test - 200', done => {
	testApi(WarehouseServiceMessages.GET_ALL_INGREDIENT, '',
		createResponseMessage(OK, [milk, tea]), done)
})

test('Get all Available Ingredient Test - 200', done => {
	testApi(WarehouseServiceMessages.GET_ALL_AVAILABLE_INGREDIENT, '',
		createResponseMessage(OK, [milk]), done)
})

// write
test('Restock Test (check-service) - 200', done => {
	let input = { name: milk.name, quantity: qty }
	let output = { name: milk.name, quantity: (milk.quantity + qty) }

	testCheckService(WarehouseServiceMessages.RESTOCK_INGREDIENT, input,
		createResponseMessage(OK, output), done)
})

test('Restock Test (check-service) - 400', done => {
	let input = { name: coffee.name, quantity: qty }
	testCheckService(WarehouseServiceMessages.RESTOCK_INGREDIENT, input,
		createResponseMessage(ERROR_INGREDIENT_NOT_FOUND, undefined), done)
})

test('Create Ingredient Test (check-service) - 400', done => {
	testCheckService(WarehouseServiceMessages.CREATE_INGREDIENT, milk,
		createResponseMessage(ERROR_INGREDIENT_ALREADY_EXISTS, undefined), done)
})

test('Create Ingredient Test (check-service) - 200', done => {
	testCheckService(WarehouseServiceMessages.CREATE_INGREDIENT, coffee,
		createResponseMessage(OK, coffee), done)
})

test('Decrease Ingredients Quantity Test (check-service) - 400', done => {
	let input = [{ name: milk.name, quantity: (milk.quantity + qty) }]
	testCheckService(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input,
		createResponseMessage(ERROR_INGREDIENT_QUANTITY, undefined), done)
})

test('Decrease Ingredients Quantity Test (check-service) - 200', done => {
	let input = [{ name: milk.name, quantity: qty }]
	let output = [{ name: milk.name, quantity: (milk.quantity - qty) }, { name: tea.name, quantity: 0 }]
	testCheckService(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input,
		createResponseMessage(OK, output), done)
})

test('Restock Test - 200', done => {
	let input = { name: milk.name, quantity: qty }
	let output = { name: milk.name, quantity: (milk.quantity + qty) }
	testApi(WarehouseServiceMessages.RESTOCK_INGREDIENT, input,
		createResponseMessage(OK, output), done)
})

test('Restock Test - 400', done => {
	let input = { name: coffee.name, quantity: qty }
	testApi(WarehouseServiceMessages.RESTOCK_INGREDIENT, input,
		createResponseMessage(ERROR_INGREDIENT_NOT_FOUND, undefined), done)
})

test('Create Ingredient Test - 400', done => {
	testApi(WarehouseServiceMessages.CREATE_INGREDIENT, milk,
		createResponseMessage(ERROR_INGREDIENT_ALREADY_EXISTS, undefined), done)
})

test('Create Ingredient Test - 200', done => {
	testApi(WarehouseServiceMessages.CREATE_INGREDIENT, coffee,
		createResponseMessage(OK, coffee), done)
})

test('Decrease Ingredients Quantity Test - 400', done => {
	let input = [{ name: milk.name, quantity: (milk.quantity + qty) }]
	testApi(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input,
		createResponseMessage(ERROR_INGREDIENT_QUANTITY, undefined), done)
})

test('Decrease Ingredients Quantity Test - 200', done => {
	let input = [{ name: milk.name, quantity: qty }]
	let output = [{ name: milk.name, quantity: (milk.quantity - qty) }, { name: tea.name, quantity: 0 }]
	testApi(WarehouseServiceMessages.DECREASE_INGREDIENTS_QUANTITY, input,
		createResponseMessage(OK, output), done)
})
