package server

import MongoInfo
import io.vertx.core.Vertx

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
