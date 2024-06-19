package handlers

import io.vertx.ext.web.RoutingContext

/**
 * Interface exposing handler methods and set contexts status code
 */
interface Handler {
    /**
     * Uri: /warehouse/
     * Http method: POST
     * Service: @see WarehouseService.createIngredient
     */
    suspend fun createIngredient(context: RoutingContext)

    /**
     * Uri: /warehouse/
     * Http method: GET
     * Service: @see WarehouseService.getAllIngredients
     * Response body: list of ingredients in the warehouse
     */
    suspend fun getAllIngredients(context: RoutingContext)

    /**
     * Uri: /warehouse/
     * Http method: PUT
     * Service: @see WarehouseService.updateConsumedIngredientsQuantity
     */
    suspend fun updateConsumedIngredientsQuantity(context: RoutingContext)

    /**
     * Uri: /warehouse/:ingredient
     * Http method: PUT
     * Service: @see WarehouseService.restock
     */
    suspend fun restock(context: RoutingContext)

    /**
     * Uri: /warehouse/available
     * Http method: GET
     * Response body: list of available ingredients in the warehouse
     * Service: @see WarehouseService.getAllAvailableIngredients
     */
    suspend fun getAllAvailableIngredients(context: RoutingContext)
}
