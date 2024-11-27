package server

import MongoInfo
import SetupLogger
import io.vertx.core.Vertx

/**
 * Entry point of the service
 */
object Main {
    @JvmStatic
    fun main(args: Array<String>) {
        SetupLogger().setupLogger()
        val vertxServer = Vertx.vertx()
        vertxServer.deployVerticle(Server(MongoInfo(), 8080))
    }
}
