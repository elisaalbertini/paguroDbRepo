package handlers

import MongoInfo
import WarehouseMessage
import WarehouseMessageToCode
import application.UpdateQuantity
import application.WarehouseServiceImpl
import application.WarehouseServiceResponse
import domain.Ingredient
import io.vertx.ext.web.RoutingContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import server.MongoUtils
import java.net.HttpURLConnection

class HandlerImpl(private val mongoInfo: MongoInfo) : Handler {
    private val warehouseService = WarehouseServiceImpl(mongoInfo)

    private fun checkIfError(
        response: WarehouseMessage,
        body: String,
        context: RoutingContext,
    ) {
        if (WarehouseMessageToCode.convert(response) != HttpURLConnection.HTTP_OK) {
            context.response().setStatusMessage(response.toString()).end()
        } else {
            context.response().end(body)
        }
    }

    override suspend fun createIngredient(context: RoutingContext) {
        val param = context.request().params().get("ingredient")
        val response =
            if (param == null) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_WRONG_PARAMETERS)
            } else if (!MongoUtils.isDbSuccessfullyConnected(mongoInfo)) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_DB_NOT_AVAILABLE)
            } else {
                warehouseService.createIngredient(Json.decodeFromString(param))
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun getAllIngredients(context: RoutingContext) {
        getIngredients(warehouseService.getAllIngredients(), context)
    }

    private suspend fun getIngredients(
        warehouseServiceResponse: WarehouseServiceResponse<List<Ingredient>>,
        context: RoutingContext,
    ) {
        val response =
            if (MongoUtils.isDbSuccessfullyConnected(mongoInfo)) {
                warehouseServiceResponse
            } else {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_DB_NOT_AVAILABLE)
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun getAllAvailableIngredients(context: RoutingContext) {
        getIngredients(warehouseService.getAllAvailableIngredients(), context)
    }

    override suspend fun updateConsumedIngredientsQuantity(context: RoutingContext) {
        val params = context.request().params().get("ingredients")
        val response =
            if (params == null) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_WRONG_PARAMETERS)
            } else if (!MongoUtils.isDbSuccessfullyConnected(mongoInfo)) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_DB_NOT_AVAILABLE)
            } else {
                try {
                    warehouseService.updateConsumedIngredientsQuantity(Json.decodeFromString(params))
                } catch (e: Exception) {
                    WarehouseServiceResponse(null, WarehouseMessage.ERROR_WRONG_PARAMETERS)
                }
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun restock(context: RoutingContext) {
        val ingredientName = context.request().params().get("ingredient")
        val quantity = context.request().params().get("quantity")
        val response =
            if (ingredientName == null || quantity == null || quantity.toIntOrNull() == null) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_WRONG_PARAMETERS)
            } else if (!MongoUtils.isDbSuccessfullyConnected(mongoInfo)) {
                WarehouseServiceResponse(null, WarehouseMessage.ERROR_DB_NOT_AVAILABLE)
            } else {
                warehouseService.restock(UpdateQuantity(ingredientName, quantity.toInt()))
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }
}
