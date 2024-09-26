import { Service } from '../src/utils/service'
import { OrdersServiceMessages } from '../src/utils/messages'
import { ResponseMessage } from '../src/schema/messages'
import { add, cleanCollection, closeMongoClient, DbCollections, DbNames, getCollection } from './utils/db-connection'
import {
	closeServer, closeWs, createConnectionAndCall, createConnectionAndCallNewOrder, createRequestMessage, createResponseMessage,
	initializeServer, OrderState, startWebsocket
} from './utils/test-utils'
import { addId } from './utils/order-json-utils'
import { ApiResponse, CHANGE_STATE_NOT_VALID, ERROR_MISSING_INGREDIENTS, ERROR_WRONG_PARAMETERS, OK, ORDER_ID_NOT_FOUND } from './utils/api-response'
import { blackCoffee, coffee, egg, friedEgg, newOrderMissingIngredient, newOrderNotification, newOrderOmelette, newWrongOrder, omelette, order, salt } from './utils/test-data'

let insertedId: string

beforeAll(async () => {
	await cleanCollection(DbNames.MENU, DbCollections.MENU)
	await (await getCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE)).createIndex({ name: 1 }, { unique: true })
	await (await getCollection(DbNames.MENU, DbCollections.MENU)).createIndex({ name: 1 }, { unique: true })
	await add(DbNames.MENU, DbCollections.MENU, omelette)
})

beforeEach(async () => {
	await cleanCollection(DbNames.ORDERS, DbCollections.ORDERS)
	await cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE)
	await add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, egg)
	insertedId = (await add(DbNames.ORDERS, DbCollections.ORDERS, order)).insertedId.toString()
	initializeServer()
})

afterEach(() => {
	closeWs()
	closeServer()
})

afterAll(() => { closeMongoClient() })

function testCheckService(action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	createConnectionAndCall(createRequestMessage(Service.ORDERS, action, input), expectedResponse, callback)
}

function testApi(action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) {
	startWebsocket(createRequestMessage(Service.ORDERS, action, input),
		expectedResponse, callback)
}

//read
test('Get all orders - 200', done => {
	testApi(OrdersServiceMessages.GET_ALL_ORDERS, '', createResponseMessage(OK, [addId(order, insertedId)]), done)
})

test('Get all orders - 200 (check-service)', done => {
	testCheckService(OrdersServiceMessages.GET_ALL_ORDERS, "",
		createResponseMessage(OK, [addId(order, insertedId)]), done)
})

test('Get order by id - 200', done => {
	testApi(OrdersServiceMessages.GET_ORDER_BY_ID, insertedId, createResponseMessage(OK, addId(order, insertedId)), done)
})

test('Get order by id - 200 (check-service)', done => {
	testCheckService(OrdersServiceMessages.GET_ORDER_BY_ID, insertedId,
		createResponseMessage(OK, addId(order, insertedId)), done)
})

test('Get order by id - 404 (check-service)', done => {
	testCheckService(OrdersServiceMessages.GET_ORDER_BY_ID, "1",
		createResponseMessage(ORDER_ID_NOT_FOUND, undefined), done)
})

//write
test('Create Order Test - 200', done => {
	testApi(OrdersServiceMessages.CREATE_ORDER, newOrderOmelette, createResponseMessage(OK, newOrderOmelette), done)
})

test('Create Order Test (check-service) - 200 and missing ingredient notification', done => {
	add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, salt).then(() => {
		add(DbNames.MENU, DbCollections.MENU, friedEgg).then(() => {
			createConnectionAndCallNewOrder(createRequestMessage(Service.ORDERS, OrdersServiceMessages.CREATE_ORDER, newOrderNotification),
				createResponseMessage(OK, newOrderNotification), done)
		})
	})
})

test('Create Order Test (check-service) - 200', done => {
	add(DbNames.WAREHOUSE, DbCollections.WAREHOUSE, coffee).then(() => {
		add(DbNames.MENU, DbCollections.MENU, blackCoffee).then(() => {
			testCheckService(OrdersServiceMessages.CREATE_ORDER, newOrderOmelette,
				createResponseMessage(OK, newOrderOmelette), done)
		})
	})
})

test('Create Order Test (check-service) - 400 - Missing Ingredients', done => {
	cleanCollection(DbNames.WAREHOUSE, DbCollections.WAREHOUSE).then(() => {
		testCheckService(OrdersServiceMessages.CREATE_ORDER, newOrderOmelette,
			createResponseMessage(ERROR_MISSING_INGREDIENTS, undefined), done)
	})
})

test('Create Order Test - 400 - Wrong parameters', done => {
	testApi(OrdersServiceMessages.CREATE_ORDER, newWrongOrder, createResponseMessage(ERROR_WRONG_PARAMETERS, undefined), done)

})

test('Create Order Test - 400 - Wrong parameters (check-service)', done => {
	testCheckService(OrdersServiceMessages.CREATE_ORDER, newWrongOrder,
		createResponseMessage(ERROR_WRONG_PARAMETERS, undefined), done)
})

test('Create Order Test - 400 - Missing ingredients (check-service)', done => {
	testCheckService(OrdersServiceMessages.CREATE_ORDER, newOrderMissingIngredient,
		createResponseMessage(ERROR_MISSING_INGREDIENTS, undefined), done)
})

test('Put Order Test - 200', done => {
	testPutOrder(OrderState.PENDING, OrderState.READY, OK, testApi, done)
})

function testPutOrder(initState: string, finalState: string, apiResponse: ApiResponse, test: (action: string, input: any, expectedResponse: ResponseMessage, callback: jest.DoneCallback) => void, callback: jest.DoneCallback) {
	cleanCollection(DbNames.ORDERS, DbCollections.ORDERS).then(() => {
		let newOrder = { ...order }
		newOrder["state"] = initState
		add(DbNames.ORDERS, DbCollections.ORDERS, newOrder).then((res) => {
			let id = res.insertedId.toString()
			let update = {
				"_id": id,
				"state": finalState
			}
			let expectedData
			if (apiResponse.code == 200) {
				newOrder["_id"] = id
				newOrder["state"] = finalState
				expectedData = [newOrder]
			} else {
				expectedData = undefined
			}
			test(OrdersServiceMessages.PUT_ORDER, update,
				createResponseMessage(apiResponse, expectedData), callback)
		})
	})
}

test('Put Order Test - 200 (check-service)', done => {
	testPutOrder(OrderState.READY, OrderState.COMPLETED, OK, testCheckService, done)
})

test('Put Order Test - 400 (check-service)', done => {
	testPutOrder(OrderState.COMPLETED, OrderState.PENDING, CHANGE_STATE_NOT_VALID, testCheckService, done)
})

test('Put Order Test - 404 (check-service) - id not found', done => {
	cleanCollection(DbNames.ORDERS, DbCollections.ORDERS).then(() => {
		let update = {
			"_id": "1",
			"state": OrderState.PENDING
		}

		testCheckService(OrdersServiceMessages.PUT_ORDER, update,
			createResponseMessage(ORDER_ID_NOT_FOUND, undefined), done)
	})
})
