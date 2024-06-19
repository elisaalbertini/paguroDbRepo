import io.vertx.core.Vertx
import io.vertx.core.buffer.Buffer
import io.vertx.ext.web.client.HttpRequest
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

    fun createIngredient(
        paramName: String,
        ingredient: String,
    ): HttpRequest<Buffer> {
        return initializePost("/warehouse/").addQueryParam(paramName, ingredient)
    }

    fun updateConsumedIngredientsQuantity(
        paramName: String,
        quantity: String,
    ): HttpRequest<Buffer> {
        return initializePut("/warehouse/").addQueryParam(paramName, quantity)
    }

    fun restock(
        ingredient: String,
        paramName: String,
        quantity: String,
    ): HttpRequest<Buffer> {
        return initializePut("/warehouse/$ingredient").addQueryParam(paramName, quantity)
    }

    fun getAllIngredients(type: String): HttpRequest<Buffer> {
        return initializeGet("/warehouse/$type")
    }
}
