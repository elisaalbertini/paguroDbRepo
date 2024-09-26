package handlers

import Message
import MongoInfo
import Quantity
import UpdateQuantity
import WarehouseMessageToCode
import application.WarehouseServiceImpl
import application.WarehouseServiceResponse
import domain.Ingredient
import io.vertx.ext.web.RoutingContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection

class HandlerImpl(private val mongoInfo: MongoInfo) : Handler {
    private val warehouseService = WarehouseServiceImpl(mongoInfo)

    private fun checkIfError(
        response: Message,
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
        val body = context.body().asString()
        val response =
            if (body == null) {
                WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
            } else {
                try {
                    warehouseService.createIngredient(Json.decodeFromString(body))
                } catch (e: Exception) {
                    WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
                }
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun getAllIngredients(context: RoutingContext) {
        getIngredients(warehouseService.getAllIngredients(), context)
    }

    private fun getIngredients(
        response: WarehouseServiceResponse<List<Ingredient>>,
        context: RoutingContext,
    ) {
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun getAllAvailableIngredients(context: RoutingContext) {
        getIngredients(warehouseService.getAllAvailableIngredients(), context)
    }

    override suspend fun updateConsumedIngredientsQuantity(context: RoutingContext) {
        val body = context.body().asString()
        val response =
            if (body == null) {
                WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
            } else {
                try {
                    warehouseService.updateConsumedIngredientsQuantity(Json.decodeFromString(body))
                } catch (e: Exception) {
                    WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
                }
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }

    override suspend fun restock(context: RoutingContext) {
        val quantity = context.body().asString()
        val ingredientName = context.request().params()["ingredient"]
        val response =
            if (ingredientName == null || quantity == null) {
                WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
            } else {
                try {
                    warehouseService.restock(
                        UpdateQuantity(
                            ingredientName,
                            Json.decodeFromString<Quantity>(quantity).quantity,
                        ),
                    )
                } catch (e: Exception) {
                    WarehouseServiceResponse(null, Message.ERROR_WRONG_PARAMETERS)
                }
            }
        context.response().statusCode = WarehouseMessageToCode.convert(response.response)
        checkIfError(response.response, Json.encodeToString(response.data), context)
    }
}
