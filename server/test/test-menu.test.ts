import { Service } from '../src/utils/service'
import { MenuServiceMessages, ResponseMessage } from '../src/utils/messages'
import { add, cleanCollection, closeMongoClient, DbCollections, DbNames, getCollection } from './utils/db-connection'
import {
	closeServer,
	closeWs, createConnectionAndCall, createRequestMessage,
	createResponseMessage, initializeServer, startWebsocket
} from './utils/test-utils'
import { boiledEgg, egg, friedEgg, omelette } from './utils/test-data'
import { ERROR_EMPTY_WAREHOUSE, OK } from './utils/api-response'

beforeAll(async () => {
	await (await getCollection(DbNames.MENU, DbCollections.MENU)).createIndex({ name: 1 }, { unique: true })
})

beforeEach(async () => {
	await cleanCollection(DbNames.MENU, DbCollections.MENU)
	await cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE)
	await add(DbNames.MENU, DbCollections.MENU, omelette)
	await add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, egg)
	initializeServer()
})

afterEach(() => {
	closeWs()
	closeServer()
})

afterAll(() => { closeMongoClient() })

const testCheckService = (action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) => {
	createConnectionAndCall(createRequestMessage(Service.MENU, action, input), expectedResponse, callback)
}

function testApi(action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	startWebsocket(createRequestMessage(Service.MENU, action, input),
		expectedResponse, callback)
}

test('Get all available items Test - 200', done => {
	testApi(MenuServiceMessages.GET_AVAILABLE_ITEMS, "",
		createResponseMessage(OK, [omelette]), done)
})

test('Get all available items Test - 200 (check-service)', done => {
	testCheckService(MenuServiceMessages.GET_AVAILABLE_ITEMS, "",
		createResponseMessage(OK, [omelette]), done)
})

test('Get item by name Test - 200', done => {
	testApi(MenuServiceMessages.GET_ITEM_BY_NAME, omelette.name,
		createResponseMessage(OK, omelette), done)
})

test('Get item by name Test - 200 (check-service)', done => {
	testCheckService(MenuServiceMessages.GET_ITEM_BY_NAME, omelette.name,
		createResponseMessage(OK, omelette), done)
})

test('Get all items Test - 200', done => {
	testApi(MenuServiceMessages.GET_ITEMS, "",
		createResponseMessage(OK, [omelette]), done)
})

test('Get all items Test - 200 (check-service)', done => {
	testCheckService(MenuServiceMessages.GET_ITEMS, "",
		createResponseMessage(OK, [omelette]), done)
})

test('Add new item Test - 200', done => {
	testApi(MenuServiceMessages.CREATE_ITEM, friedEgg,
		createResponseMessage(OK, friedEgg), done)
})

test('Add new item Test - 200 (check-service)', done => {
	testCheckService(MenuServiceMessages.CREATE_ITEM, boiledEgg,
		createResponseMessage(OK, boiledEgg), done)
})

test('Update item Test - 200', done => {
	const updateOmelette = {
		name: "omelette",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 2
			},
			{
				ingredient_name: "salt",
				quantity: 1
			}
		],
		price: 4
	}

	testApi(MenuServiceMessages.UPDATE_ITEM, updateOmelette,
		createResponseMessage(OK, updateOmelette), done)
})

test('Update item Test - 200 (check-service)', done => {
	const updateOmelette = {
		name: "omelette",
		recipe: [
			{
				ingredient_name: "egg",
				quantity: 2
			},
			{
				ingredient_name: "salt",
				quantity: 1
			},
			{
				ingredient_name: "tomato",
				quantity: 1
			}
		],
		price: 5
	}
	testCheckService(MenuServiceMessages.UPDATE_ITEM, updateOmelette,
		createResponseMessage(OK, updateOmelette), done)
})

test('Get all available items Test - 404', done => {
	cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE).then(() => {
		testApi(MenuServiceMessages.GET_AVAILABLE_ITEMS, "",
			createResponseMessage(ERROR_EMPTY_WAREHOUSE, ""), done)
	})
})

test('Get all available items Test (check-service) - 404', done => {
	cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE).then(() => {
		testCheckService(MenuServiceMessages.GET_AVAILABLE_ITEMS, "",
			createResponseMessage(ERROR_EMPTY_WAREHOUSE, ""), done)
	})
})
