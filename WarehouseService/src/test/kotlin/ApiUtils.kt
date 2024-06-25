import io.vertx.core.Future
import io.vertx.core.Vertx
import io.vertx.core.buffer.Buffer
import io.vertx.ext.web.client.HttpRequest
import io.vertx.ext.web.client.HttpResponse
import io.vertx.ext.web.client.WebClient

class ApiUtils(private val port: Int) {
    private val client = WebClient.create(Vertx.vertx())

    private fun initializePost(URI: String): HttpRequest<Buffer> {
        return client.post(URI).port(port).host("localhost")
    }

    private fun initializeGet(URI: String): HttpRequest<Buffer> {
        return client.get(URI).port(port).host("localhost")
    }

    private fun initializePut(URI: String): HttpRequest<Buffer> {
        return client.put(URI).port(port).host("localhost")
    }

    fun createIngredient(ingredient: Buffer): Future<HttpResponse<Buffer>> {
        return initializePost("/warehouse/").sendBuffer(ingredient)
    }

    fun updateConsumedIngredientsQuantity(quantity: Buffer): Future<HttpResponse<Buffer>> {
        return initializePut("/warehouse/").sendBuffer(quantity)
    }

    fun restock(
        ingredient: String,
        quantity: Buffer,
    ): Future<HttpResponse<Buffer>> {
        return initializePut("/warehouse/$ingredient").sendBuffer(quantity)
    }

    fun getAllIngredients(type: String): HttpRequest<Buffer> {
        return initializeGet("/warehouse/$type")
    }
}
