package application

import MongoInfo
import WarehouseMessage
import domain.Ingredient
import repository.RepositoryImpl

class WarehouseServiceImpl(mongoInfo: MongoInfo) : WarehouseService {
    private val repository = RepositoryImpl(mongoInfo)

    override suspend fun getAllIngredients(): WarehouseServiceResponse<List<Ingredient>> {
        val ingredients = repository.getAllIngredients()
        return correctIngredientList(ingredients.data!!)
    }

    override suspend fun createIngredient(ingredient: Ingredient): WarehouseServiceResponse<Ingredient> {
        val repositoryRes = repository.createIngredient(ingredient.name, ingredient.quantity)
        return WarehouseServiceResponse(repositoryRes.data, repositoryRes.message)
    }

    override suspend fun updateConsumedIngredientsQuantity(ingredients: List<UpdateQuantity>): WarehouseServiceResponse<List<Ingredient>> {
        val availableIngredients = repository.getAllAvailableIngredients().data
        if (availableIngredients != null) {
            ingredients.forEach {
                if (availableIngredients.none { i -> i.name == it.name }) {
                    return WarehouseServiceResponse(null, WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND)
                } else if (availableIngredients.find { i -> i.name == it.name }?.quantity!! < it.quantity) {
                    return WarehouseServiceResponse(null, WarehouseMessage.ERROR_INGREDIENT_QUANTITY)
                }
            }
        }

        ingredients.forEach {
                i ->
            repository.decreaseIngredientQuantity(i.name, i.quantity)
        }
        return WarehouseServiceResponse(repository.getAllIngredients().data, WarehouseMessage.OK)
    }

    override suspend fun restock(ingredient: UpdateQuantity): WarehouseServiceResponse<Ingredient> {
        val repositoryRes = repository.restock(ingredient.name, ingredient.quantity)
        return WarehouseServiceResponse(repositoryRes.data, repositoryRes.message)
    }

    override suspend fun getAllAvailableIngredients(): WarehouseServiceResponse<List<Ingredient>> {
        val ingredients = repository.getAllAvailableIngredients()
        return correctIngredientList(ingredients.data!!)
    }

    private fun correctIngredientList(ingredients: List<Ingredient>): WarehouseServiceResponse<List<Ingredient>> {
        return WarehouseServiceResponse(
            ingredients,
            if (ingredients.isNotEmpty()) {
                WarehouseMessage.OK
            } else {
                WarehouseMessage.ERROR_EMPTY_WAREHOUSE
            },
        )
    }
}
