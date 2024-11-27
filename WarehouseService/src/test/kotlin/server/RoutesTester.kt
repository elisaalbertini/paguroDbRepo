package server

import ApiUtils
import BaseTest
import Message
import MongoInfo
import Quantity
import UpdateQuantity
import com.mongodb.client.model.Filters
import domain.Ingredient
import io.kotest.extensions.system.withEnvironment
import io.kotest.matchers.shouldBe
import io.vertx.core.Vertx
import io.vertx.core.buffer.Buffer
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
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
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_ALREADY_EXISTS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("{\"names\":" + milk.name + ", \"quantity\":2}")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("{\"name\":" + milk.name + ", \"quantity\":\"two\"}")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.createIngredient(Buffer.buffer("")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.createIngredient(Buffer.buffer(Json.encodeToString(butter))).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun updateConsumedIngredientsQuantityRouteTest() {
        val decrease = 4
        val decreaseMilk = 100
        var decreaseIngredients =
            Buffer.buffer(
                Json.encodeToString(
                    listOf(
                        UpdateQuantity(milk.name, decrease),
                        UpdateQuantity(tea.name, decrease),
                    ),
                ),
            )

        apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients)
            .coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity(tea.name, decrease))))
        var response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity(milk.name, decreaseMilk))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_QUANTITY.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity(coffee.name, decrease))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients =
            Buffer.buffer(Json.encodeToString(listOf(UpdateQuantity(coffee.name, decrease))))
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients = Buffer.buffer("[{\"name\":" + milk.name + ",\"quantity\":\"four\"}]")
        response = apiUtils.updateConsumedIngredientsQuantity(decreaseIngredients).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun restockRouteTest() {
        val quantity = Buffer.buffer(Json.encodeToString(Quantity(10)))

        apiUtils.restock(tea.name, quantity).coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        var response = apiUtils.restock(coffee.name, quantity).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe Message.ERROR_INGREDIENT_NOT_FOUND.toString()

        response = apiUtils.restock(tea.name, Buffer.buffer("[{\"quantity\": \"ten\"}]")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.restock(tea.name, Buffer.buffer("[{\"quantiti\": \"ten\"}]")).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.restock(tea.name, Buffer.buffer(Json.encodeToString(butter))).coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe Message.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun getAllIngredientsRouteTest() {
        val positiveResult = apiUtils.getAllIngredients("").send().coAwait()

        positiveResult.statusCode() shouldBe HttpURLConnection.HTTP_OK
        positiveResult.bodyAsString() shouldBe Json.encodeToString(ingredients)

        collection.deleteMany(Filters.empty())
        val negativeResult = apiUtils.getAllIngredients("").send().coAwait()
        negativeResult.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        negativeResult.statusMessage() shouldBe Message.ERROR_EMPTY_WAREHOUSE.toString()
    }

    @Test
    suspend fun getAllAvailableIngredients() {
        collection.insertOne(Ingredient(coffee.name, 0))

        val positiveResult = apiUtils.getAllIngredients("available").send().coAwait()

        positiveResult.statusCode() shouldBe HttpURLConnection.HTTP_OK
        positiveResult.bodyAsString() shouldBe Json.encodeToString(ingredients)

        collection.deleteMany(Filters.empty())
        val negativeResult = apiUtils.getAllIngredients("available").send().coAwait()

        negativeResult.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        negativeResult.statusMessage() shouldBe Message.ERROR_EMPTY_WAREHOUSE.toString()
    }

    @Test
    fun environmentVariablesTest() {
        var mongoInfo = MongoInfo()
        val address = "mongodb://mongo:27017"
        mongoInfo.mongoAddress shouldBe "mongodb://localhost:27017"

        withEnvironment("DB_CONNECTION_ADDRESS", address) {
            mongoInfo = MongoInfo()
            mongoInfo.mongoAddress shouldBe address
        }
    }
}
