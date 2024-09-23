package repository.features.stepDefinition

import ApiUtils
import BaseTest
import Quantity
import domain.Ingredient
import io.cucumber.java.en.Then
import io.cucumber.java.en.When
import io.vertx.core.buffer.Buffer
import io.vertx.ext.web.client.HttpResponse
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions

class StepDefinition : BaseTest() {
    private var actualAnswer: String = ""
    private var actualMessage: String = ""
    private val apiUtils = ApiUtils(8080)

    private fun getActualValues(buffer: HttpResponse<Buffer>) {
        actualAnswer = buffer.statusCode().toString()
        actualMessage = buffer.statusMessage().toString()
    }

    @When("Manager adds an ingredient with name {word} and quantity {word}")
    fun managerAddsAnIngredient(
        name: String,
        quantity: String,
    ) {
        val ingredient = Ingredient(name, quantity.toInt())
        runBlocking {
            val res = apiUtils.createIngredient(Buffer.buffer(Json.encodeToString(ingredient))).coAwait()
            getActualValues(res)
        }
    }

    @When("Manager restocks the {word} adding {word} units")
    fun managerRestocks(
        name: String,
        quantity: String,
    ) {
        runBlocking {
            val res = apiUtils.restock(name, Buffer.buffer(Json.encodeToString(Quantity(quantity.toInt())))).coAwait()
            getActualValues(res)
        }
    }

    @When("Manager asks for the list of ingredients in the warehouse")
    fun managerAsksForTheListOfIngredientsInTheWarehouse() {
        runBlocking {
            val res = apiUtils.getAllIngredients("").send().coAwait()
            getActualValues(res)
        }
    }

    @When("Manager asks for the list of available ingredients in the warehouse")
    fun managerAsksForTheListOfAvailableIngredientsInTheWarehouse() {
        runBlocking {
            val res = apiUtils.getAllIngredients("available").send().coAwait()
            getActualValues(res)
        }
    }

    @Then("Manager receives {word} and message {word}")
    fun managerReceivesResponseAndMessage(
        expectedResponse: String,
        expectedMessage: String,
    ) {
        Assertions.assertEquals(expectedResponse, actualAnswer)
        Assertions.assertEquals(expectedMessage, actualMessage)
    }
}
