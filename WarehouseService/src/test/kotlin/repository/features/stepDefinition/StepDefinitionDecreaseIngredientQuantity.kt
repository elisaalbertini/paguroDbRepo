package repository.features.stepDefinition

import ApiUtils
import BaseTest
import application.UpdateQuantity
import io.cucumber.java.en.Then
import io.cucumber.java.en.When
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Assertions

class StepDefinitionDecreaseIngredientQuantity : BaseTest() {
    private var actualAnswer: String = ""
    private var actualMessage: String = ""
    private val apiUtils = ApiUtils(8080)

    @When("System decreases the {word} quantity by {word}")
    fun managerRestocksTea(
        name: String,
        quantity: String,
    ) {
        val decreaseIngredients = Json.encodeToString(listOf(UpdateQuantity(name, quantity.toInt())))
        runBlocking {
            val res = apiUtils.updateConsumedIngredientsQuantity("ingredients", decreaseIngredients).send().coAwait()
            actualAnswer =
                res.statusCode().toString()
            actualMessage = res.statusMessage().toString()
        }
    }

    @Then("System receives {word} and message {word}")
    fun managerReceivesResponse(
        expectedResponse: String,
        expectedMessage: String,
    ) {
        Assertions.assertEquals(expectedResponse, actualAnswer)
        Assertions.assertEquals(expectedMessage, actualMessage)
    }
}
