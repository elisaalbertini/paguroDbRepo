import * as mongoDB from "mongodb"

/**
 * Mongo Client
 */
const DB_CONN_STRING = "mongodb://localhost:27017"

const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING)

/**
 * Add one element into a collection
 * @param db_name 
 * @param collection_name 
 * @param input the element to add
 * @returns if the operation was successful and the id of the inserted element
 */
export async function add(db_name: string, collection_name: string, input: string) {
	await client.connect()

	return client.db(db_name).collection(collection_name).insertOne(JSON.parse(input))
}

/**
 * Get a specific collection of a DB
 * @param db_name 
 * @param db_collection 
 * @returns the collection
 */
export async function getCollection(db_name: string, db_collection: string) {

	await client.connect()

	return client.db(db_name).collection(db_collection)
}

/**
 * Delete all the orders present in the collection
 */
export async function cleanCollection(db_name: string, collection_name: string) {
	await client.connect()

	client.db(db_name).collection(collection_name).deleteMany()
}

/**
 * Utility function to get the last inserted Item
 * @returns the last inserted Item
 */
export async function getLastInsertedItem() {
	let menuItems = (await client.db("Menu").collection("Items")).find({}, { projection: { _id: 0 } })
	let last = (await menuItems.toArray()).pop()
	return last!
}

/**
  * Utility function to get the last inserted Order
  * @returns the last inserted Order
  */
export async function getLastInsertedOrder() {
	await client.connect()

	let orders = (await client.db("Orders").collection("Orders")).find()
	let last = (await orders.toArray()).pop()
	return last
}

/**
 * Closes the connection
 */
export function closeMongoClient() {
	client.close()
}
