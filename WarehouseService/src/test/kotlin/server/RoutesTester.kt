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
        val correctParamName = "ingredient"
        val wrongParamName = "ingrediente"
        var response = apiUtils.createIngredient(correctParamName, newIngredient).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_OK
        response.bodyAsString() shouldBe newIngredient

        response = apiUtils.createIngredient(correctParamName, existingIngredient).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_ALREADY_EXISTS.toString()

        response = apiUtils.createIngredient(wrongParamName, existingIngredient).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun updateConsumedIngredientsQuantityRouteTest() {
        val decrease = 4
        val decreaseMilk = 100
        val correctParamName = "ingredients"
        val wrongParamName = "ingredient"
        var decreaseIngredients =
            Json.encodeToString(listOf(UpdateQuantity("milk", decrease), UpdateQuantity("tea", decrease)))

        apiUtils.updateConsumedIngredientsQuantity(correctParamName, decreaseIngredients)
            .send().coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity("tea", decrease)))
        var response = apiUtils.updateConsumedIngredientsQuantity(correctParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity("milk", decreaseMilk)))
        response = apiUtils.updateConsumedIngredientsQuantity(correctParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_QUANTITY.toString()

        decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity("coffee", decrease)))
        response = apiUtils.updateConsumedIngredientsQuantity(correctParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity("coffee", decrease)))
        response = apiUtils.updateConsumedIngredientsQuantity(correctParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity("milk", decrease)))
        response = apiUtils.updateConsumedIngredientsQuantity(wrongParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()

        decreaseIngredients = "[{\"name\":\"milk\",\"quantity\":\"four\"}]"
        response = apiUtils.updateConsumedIngredientsQuantity(wrongParamName, decreaseIngredients).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()
    }

    @Test
    suspend fun restockRouteTest() {
        val quantity = Json.encodeToString(10)

        apiUtils.restock("tea", "quantity", quantity).send().coAwait().statusCode() shouldBe HttpURLConnection.HTTP_OK

        var response = apiUtils.restock("coffee", "quantity", quantity).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_NOT_FOUND
        response.statusMessage() shouldBe WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND.toString()

        response = apiUtils.restock("coffee", "quantiti", quantity).send().coAwait()
        response.statusCode() shouldBe HttpURLConnection.HTTP_BAD_REQUEST
        response.statusMessage() shouldBe WarehouseMessage.ERROR_WRONG_PARAMETERS.toString()

        response = apiUtils.restock("tea", "quantity", "ten").send().coAwait()
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
