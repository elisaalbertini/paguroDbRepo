import * as mongoDB from "mongodb"
require('dotenv').config()

/**
 * Names of the dbs
 */
export const DbNames = {
	WAREHOUSE: "Warehouse",
	MENU: "Menu",
	ORDERS: "Orders"
}
Object.freeze(DbNames)

/**
 * Names of the collections of the dbs
 */
export const DbCollections = {
	WAREHOUSE: "Ingredient",
	MENU: "Items",
	ORDERS: "Orders"
}
Object.freeze(DbCollections)

/**
 * Mongo Client
 */
const DB_CONN_STRING = process.env.DB_CONNECTION_ADDRESS != undefined ? process.env.DB_CONNECTION_ADDRESS : "mongodb://localhost:27017"

const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING)

/**
 * Add one element into a collection
 * @param dbName 
 * @param dbCollection 
 * @param input the element to add
 * @returns if the operation was successful and the id of the inserted element
 */
export async function add(dbName: string, dbCollection: string, input: any) {
	await client.connect()
	return client.db(dbName).collection(dbCollection).insertOne({ ...input })
}

/**
 * Get a specific collection of a DB
 * @param dbName 
 * @param dbCollection 
 * @returns the collection
 */
export async function getCollection(dbName: string, dbCollection: string) {

	await client.connect()

	return client.db(dbName).collection(dbCollection)
}

/**
 * Delete all the orders present in the collection
 * @param dbName 
 * @param dbCollection 
 */
export async function cleanCollection(dbName: string, dbCollection: string) {
	await client.connect()
	await client.db(dbName).collection(dbCollection).deleteMany()
}

/**
 * Utility function to get the last inserted Item
 * @returns the last inserted Item
 */
export async function getLastInsertedItem() {
	let menuItems = client.db(DbNames.MENU).collection(DbCollections.MENU).find({}, { projection: { _id: 0 } })
	let last = (await menuItems.toArray()).pop()
	return last!
}
/**
  * Utility function to get the last inserted Order
  * @returns the last inserted Order
  */
export async function getLastInsertedOrder() {
	await client.connect()

	let orders = client.db(DbNames.ORDERS).collection(DbCollections.ORDERS).find()
	let last = (await orders.toArray()).pop()
	return last
}

/**
 * Closes the connection
 */
export function closeMongoClient() {
	client.close()
}
