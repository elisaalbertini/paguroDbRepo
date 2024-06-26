package server

import MongoInfo
import com.mongodb.client.model.Filters
import domain.Ingredient
import io.vertx.core.Vertx
import kotlinx.coroutines.runBlocking

/**
 * Entry point of the service
 */
object MainInit {
    @JvmStatic
    fun main(args: Array<String>) {
        val collection = MongoUtils.getMongoCollection(MongoInfo())
        val milk = Ingredient("milk", 95)
        val tea = Ingredient("tea", 0)
        val ingredients = listOf(milk, tea)
        runBlocking {
            collection.deleteMany(Filters.empty())
            collection.insertMany(ingredients)
        }

        val vertxServer = Vertx.vertx()
        vertxServer.deployVerticle(Server(MongoInfo(), 8080))
    }
}
