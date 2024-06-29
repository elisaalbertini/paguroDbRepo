package application

import domain.Ingredient

interface WarehouseService {
    /**
     * @return a list of all the ingredients in the warehouse and WarehouseMessage.OK
     *      if the list is not empty,
     *      otherwise it returns an empty list and WarehouseMessage.ERROR_EMPTY_WAREHOUSE
     */
    suspend fun getAllIngredients(): WarehouseServiceResponse<List<Ingredient>>

    /**
     * @param ingredient to create
     * @return null and WarehouseMessage.ERROR_WRONG_PARAMETERS
     *      if the quantity passed in the body is less ore equal to 0,
     *      otherwise it returns the repository response
     */
    suspend fun createIngredient(ingredient: Ingredient): WarehouseServiceResponse<Ingredient>

    /**
     * @param ingredients list of the consumed ingredients
     * @return the list of updated ingredients and WarehouseMessage.OK
     *      if all the consumed ingredients are updated,
     *      null and WarehouseMessage.ERROR_INGREDIENT_QUANTITY
     *      if a quantity is greater than the actual quantity of the consumed ingredient in the warehouse,
     *      null and WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND
     *      if one consumed ingredient is not found in the warehouse
     */
    suspend fun updateConsumedIngredientsQuantity(ingredients: List<UpdateQuantity>): WarehouseServiceResponse<List<Ingredient>>

    /**
     * @param ingredient information needed to restock
     * @return null and WarehouseMessage.ERROR_WRONG_PARAMETERS
     *      if the quantity passed in the body is less ore equal to 0,
     *      otherwise it returns the repository response
     */
    suspend fun restock(ingredient: UpdateQuantity): WarehouseServiceResponse<Ingredient>

    /**
     * @return a list of all the available ingredients in the warehouse and WarehouseMessage.OK
     *      if the list is not empty,
     *      otherwise it returns an empty list and WarehouseMessage.ERROR_EMPTY_WAREHOUSE
     */
    suspend fun getAllAvailableIngredients(): WarehouseServiceResponse<List<Ingredient>>
}
