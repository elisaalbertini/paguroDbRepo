package application

import Message
import MongoInfo
import UpdateQuantity
import domain.Ingredient
import repository.RepositoryImpl

class WarehouseServiceImpl(mongoInfo: MongoInfo) : WarehouseService {
    private val repository = RepositoryImpl(mongoInfo)

    override suspend fun getAllIngredients(): WarehouseServiceResponse<List<Ingredient>> {
        val ingredients = repository.getAllIngredients()
        return correctIngredientList(ingredients.data)
    }

    override suspend fun createIngredient(ingredient: Ingredient): WarehouseServiceResponse<Ingredient> {
        return if (ingredient.quantity > 0) {
            val repositoryRes = repository.createIngredient(ingredient.name, ingredient.quantity)
            WarehouseServiceResponse(repositoryRes.data, repositoryRes.message)
        } else {
            WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
        }
    }

    override suspend fun updateConsumedIngredientsQuantity(ingredients: List<UpdateQuantity>): WarehouseServiceResponse<List<Ingredient>> {
        val availableIngredients = repository.getAllAvailableIngredients().data
        if (availableIngredients != null) {
            ingredients.forEach {
                val qty = availableIngredients.find { i -> i.name == it.name }?.quantity
                if (availableIngredients.none { i -> i.name == it.name }) {
                    return WarehouseServiceResponse(null, Message.ERROR_INGREDIENT_NOT_FOUND)
                } else if (qty != null && qty < it.quantity) {
                    return WarehouseServiceResponse(null, Message.ERROR_INGREDIENT_QUANTITY)
                }
            }
        }

        ingredients.forEach {
                i ->
            repository.decreaseIngredientQuantity(i.name, i.quantity)
        }
        return WarehouseServiceResponse(repository.getAllIngredients().data, Message.OK)
    }

    override suspend fun restock(ingredient: UpdateQuantity): WarehouseServiceResponse<Ingredient> {
        return if (ingredient.quantity > 0) {
            val repositoryRes = repository.restock(ingredient.name, ingredient.quantity)
            WarehouseServiceResponse(repositoryRes.data, repositoryRes.message)
        } else {
            WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
        }
    }

    override suspend fun getAllAvailableIngredients(): WarehouseServiceResponse<List<Ingredient>> {
        val ingredients = repository.getAllAvailableIngredients()
        return correctIngredientList(ingredients.data)
    }

    private fun correctIngredientList(ingredients: List<Ingredient>?): WarehouseServiceResponse<List<Ingredient>> {
        return WarehouseServiceResponse(
            ingredients,
            if (!ingredients.isNullOrEmpty()) {
                Message.OK
            } else {
                Message.ERROR_EMPTY_WAREHOUSE
            },
        )
    }
}
