package server

import ApiUtils
import BaseTest
import WarehouseMessage
import application.UpdateQuantity
import domain.Ingredient
import io.kotest.matchers.shouldBe
import io.vertx.core.Vertx
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class RoutesTesterWrongConnection : BaseTest() {
    private val port = 8081
    private val apiUtils = ApiUtils(port)

    init {
        runBlocking {
            Vertx.vertx().deployVerticle(Server(getWrongInfo(), port)).coAwait()
        }
    }

    @Test
    suspend fun createIngredientRouteTest() {
        val newIngredient = Json.encodeToString(coffee)

        val response = apiUtils.createIngredient("ingredient", newIngredient).send().coAwait()
        response.statusCode() shouldBe 500
        response.statusMessage() shouldBe WarehouseMessage.ERROR_DB_NOT_AVAILABLE.toString()
    }

    @Ignore
    @Test
    suspend fun updateConsumedIngredientsQuantityRouteTest() {
        val decreaseMilk = 10
        val decreaseTea = 4

        val decreaseIngredients =
            Json.encodeToString(listOf(UpdateQuantity("milk", decreaseMilk), UpdateQuantity("tea", decreaseTea)))

        val response = apiUtils.updateConsumedIngredientsQuantity("quantity", decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe 500
        response.statusMessage() shouldBe WarehouseMessage.ERROR_DB_NOT_AVAILABLE.toString()
    }

    @Ignore
    @Test
    suspend fun restockRouteTest() {
        val quantity = Json.encodeToString(10)

        val response = apiUtils.restock("tea", "quantity", quantity).send().coAwait()
        response.statusCode() shouldBe 500
        response.statusMessage() shouldBe WarehouseMessage.ERROR_DB_NOT_AVAILABLE.toString()
    }

    @Ignore
    @Test
    suspend fun getAllIngredientsRouteTest() {
        val response = apiUtils.getAllIngredients("").send().coAwait()

        response.statusCode() shouldBe 500
        response.bodyAsString() shouldBe null
        response.statusMessage() shouldBe WarehouseMessage.ERROR_DB_NOT_AVAILABLE.toString()
    }

    @Ignore
    @Test
    suspend fun getAllAvailableIngredients() {
        collection.insertOne(Ingredient("coffee", 0))

        val response = apiUtils.getAllIngredients("available").send().coAwait()

        response.statusCode() shouldBe 500
        response.bodyAsString() shouldBe null
        response.statusMessage() shouldBe WarehouseMessage.ERROR_DB_NOT_AVAILABLE.toString()
    }
}
