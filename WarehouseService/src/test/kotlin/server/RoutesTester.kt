package server

import ApiUtils
import BaseTest
import MongoInfo
import WarehouseMessage
import application.UpdateQuantity
import com.mongodb.client.model.Filters
import domain.Ingredient
import io.kotest.matchers.shouldBe
import io.vertx.core.Vertx
import io.vertx.core.buffer.Buffer
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import repository.Quantity
import java.net.HttpURLConnection

class RoutesTester : BaseTest() {
    private val port = 8080
    private val apiUtils = ApiUtils(port)

    init {
        runBlocking {
            Vertx.vertx().deployVerticle(Server(MongoInfo(), port)).coAwait()
        }
    }

    @Test
    suspend fun createIngredientRouteTest() {
        val newIngredient = Json.encodeToString(coffee)
        val existingIngredient = Json.encodeToString(milk)

        var response = apiUtils.createIngredient(Buffer.buffer(newIngredient)).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_OK
        response.bodyAsString() shouldBe newIngredient

        response = apiUtils.createIngredient(Buffer.buffer(existingIngredient)).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_ALREADY_EXISTS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("{\"names\":\"milk\", \"quantity\":2}")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("{\"name\":\"milk\", \"quantity\":\"two\"}")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun updateConsumedIngredientsQuantityRouteTest() {
        val decrease = 4
        val decreaseMilk = 100
        var decreaseIngredients =
            Buffer.buffer(
                Json.encodeToString(
                    listOf(
                        UpdateQuantity("milk", decrease),
                        UpdateQuantity("tea", decrease),
                    ),
                ),
            )

        apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients)
            .coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity("tea", decrease))))
        var response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity("milk", decreaseMilk))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_QUANTITY.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity("coffee", decrease))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity("coffee", decrease))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients = Buffer.buffer("[{\"name\":\"milk\",\"quantity\":\"four\"}]")
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun restockRouteTest() {
        val quantity = Buffer.buffer(Json.encodeToString(Quantity(10)))
        apiUtils.restock("tea", quantity).coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        var response = apiUtils.restock("coffee", quantity).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        response = apiUtils.restock("tea", Buffer.buffer("[{\"quantity\": \"ten\"}]")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.restock("tea", Buffer.buffer("[{\"quantiti\": \"ten\"}]")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun getAllIngredientsRouteTest() {
        val positiveResult = apiUtils.getAllIngredients("").send().coAwait()

        positiveResult.statusCode() shouldBe HttpURLConnection.HTTP_OK
        positiveResult.bodyAsString() shouldBe Json.encodeToString(ingredients)

        collection.deleteMany(Filters.empty())
        val negativeResult = apiUtils.getAllIngredients("").send().coAwait()
        negativeResult.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        negativeResult.statusMessage() shouldBe WarehouseMessage.ERROR_EMPTY_WAREHOUSE.toString()
    }

    @Test
    suspend fun getAllAvailableIngredients() {
        collection.insertOne(Ingredient("coffee", 0))

        val positiveResult = apiUtils.getAllIngredients("available").send().coAwait()

        positiveResult.statusCode() shouldBe HttpURLConnection.HTTP_OK
        positiveResult.bodyAsString() shouldBe Json.encodeToString(ingredients)

        collection.deleteMany(Filters.empty())
        val negativeResult = apiUtils.getAllIngredients("available").send().coAwait()

        negativeResult.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        negativeResult.statusMessage() shouldBe WarehouseMessage.ERROR_EMPTY_WAREHOUSE.toString()
    }
}
