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
        val vertxServer = Vertx.vertx()
        vertxServer.deployVerticle(Server(MongoInfo(), 8080))
    }
}
