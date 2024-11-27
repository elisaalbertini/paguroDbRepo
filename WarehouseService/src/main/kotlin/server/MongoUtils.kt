package server

import MongoInfo
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.kotlin.client.coroutine.MongoCollection
import domain.Ingredient

/**
 * Object that exposes utils methods for MongoDB
 */
object MongoUtils {
    /**
     * @param mongoInfo that contains the information necessary to connect to the database
     * @return a MongoDB collection
     */
    fun getMongoCollection(mongoInfo: MongoInfo): MongoCollection<Ingredient> {
        val mongoClient = MongoClient.create(mongoInfo.mongoAddress)
        val db = mongoClient.getDatabase(mongoInfo.databaseName)
        return db.getCollection(mongoInfo.collectionName)
    }
}
