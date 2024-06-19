package application

import BaseTest
import MongoInfo
import com.mongodb.client.model.Filters
import domain.Ingredient
import io.kotest.matchers.shouldBe

class WarehouseServiceTest : BaseTest() {
    private val warehouseService = WarehouseServiceImpl(MongoInfo())

    @Test
    suspend fun getAllIngredientsTest() {
        warehouseService.getAllIngredients() shouldBe WarehouseServiceResponse(ingredients, WarehouseMessage.OK)
    }

    @Test
    suspend fun getAllIngredientsEmpty() {
        collection.deleteMany(Filters.empty())
        warehouseService.getAllIngredients() shouldBe WarehouseServiceResponse(emptyList(), WarehouseMessage.ERROR_EMPTY_WAREHOUSE)
    }

    @Test
    suspend fun createNewIngredientTest() {
        warehouseService.createIngredient(coffee) shouldBe WarehouseServiceResponse(coffee, WarehouseMessage.OK)
    }

    @Test
    suspend fun createExistingIngredientTest() {
        warehouseService.createIngredient(milk) shouldBe WarehouseServiceResponse(null, WarehouseMessage.ERROR_INGREDIENT_ALREADY_EXISTS)
    }

    @Test
    suspend fun successfulUpdateConsumedIngredientsQuantityTest() {
        val decreaseMilk = 10
        val decreaseTea = 4
        val decreaseIngredients = listOf(UpdateQuantity(milk.name, decreaseMilk), UpdateQuantity(tea.name, decreaseTea))
        val expectedIngredients =
            listOf(Ingredient(milk.name, milk.quantity - decreaseMilk), Ingredient(tea.name, tea.quantity - decreaseTea))
        warehouseService
            .updateConsumedIngredientsQuantity(decreaseIngredients) shouldBe
            WarehouseServiceResponse(expectedIngredients, WarehouseMessage.OK)

        val updatedIngredients = warehouseService.getAllIngredients().data
        updatedIngredients shouldBe expectedIngredients
    }

    @Test
    suspend fun failedUpdateConsumedIngredientsQuantityTest() {
        val decreaseMilk = 200
        val decreaseTea = 3
        val decreaseIngredients = listOf(UpdateQuantity(milk.name, decreaseMilk), UpdateQuantity(tea.name, decreaseTea))
        warehouseService
            .updateConsumedIngredientsQuantity(decreaseIngredients) shouldBe
            WarehouseServiceResponse(null, WarehouseMessage.ERROR_INGREDIENT_QUANTITY)

        val updatedIngredients = warehouseService.getAllIngredients().data
        updatedIngredients shouldBe ingredients
    }

    @Test
    suspend fun restockTest() {
        warehouseService.restock(UpdateQuantity(tea.name, tea.quantity)) shouldBe
            WarehouseServiceResponse(Ingredient(tea.name, tea.quantity * 2), WarehouseMessage.OK)
        warehouseService.restock(UpdateQuantity(coffee.name, coffee.quantity)) shouldBe
            WarehouseServiceResponse(null, WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND)
    }

    @Test
    suspend fun getAllAvailableIngredientsTest() {
        collection.insertOne(notAvailableCoffee)
        warehouseService
            .getAllAvailableIngredients() shouldBe WarehouseServiceResponse(ingredients, WarehouseMessage.OK)
    }

    @Test
    suspend fun getAllAvailableIngredientsEmpty() {
        collection.deleteMany(Filters.empty())
        warehouseService
            .getAllAvailableIngredients() shouldBe WarehouseServiceResponse(emptyList(), WarehouseMessage.ERROR_EMPTY_WAREHOUSE)
    }
}
