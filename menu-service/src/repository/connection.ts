import * as mongoDB from "mongodb"
import { Item } from "../domain/item"
require('dotenv').config()

/**
 * Mongo Client
 */
const DB_CONN_STRING = process.env.DB_CONNECTION_ADDRESS != undefined ? process.env.DB_CONNECTION_ADDRESS :"mongodb://localhost:27017"
const DB_NAME = "Menu"
const COLLECTION_NAME = "Items"

const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING)

/**
 * @returns the item collection 
 */
export async function getMenuItems() {

	await client.connect()

	return client.db(DB_NAME).collection<Item>(COLLECTION_NAME)
}

/**
 * Closes the connection
 */
export function closeMongoClient() {
	client.close()
}


