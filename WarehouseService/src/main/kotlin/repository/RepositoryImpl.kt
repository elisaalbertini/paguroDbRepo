package repository

import MongoInfo
import WarehouseMessage
import com.mongodb.MongoException
import com.mongodb.client.model.Filters.eq
import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.Indexes
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Updates
import com.mongodb.kotlin.client.coroutine.MongoClient
import domain.Ingredient
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.runBlocking
import server.MongoUtils

class RepositoryImpl(mongoInfo: MongoInfo) : Repository {
    private val collection = MongoUtils.getMongoCollection(mongoInfo)

    init {
        runBlocking {
            val ascendingIndex = Indexes.text("ciao")
            MongoClient
                .create(MongoInfo().mongoAddress)
                .getDatabase(MongoInfo().databaseName)
                .getCollection<Ingredient>(MongoInfo().collectionName)
                .createIndex(ascendingIndex, IndexOptions().unique(true))
        }
    }

    override suspend fun getAllIngredients(): RepositoryResponse<List<Ingredient>> {
        return RepositoryResponse(collection.find<Ingredient>().toList(), WarehouseMessage.OK)
    }

    private suspend fun getIngredient(name: String): Ingredient {
        return collection.find(eq(Ingredient::name.name, name)).first()
    }

    override suspend fun createIngredient(
        name: String,
        quantity: Int,
    ): RepositoryResponse<Ingredient> {
        return try {
            collection.insertOne(Ingredient(name, quantity)).wasAcknowledged()
            RepositoryResponse(getIngredient(name), WarehouseMessage.OK)
        } catch (e: MongoException) {
            RepositoryResponse(null, WarehouseMessage.ERROR_INGREDIENT_ALREADY_EXISTS)
        }
    }

    override suspend fun isIngredientPresent(name: String): WarehouseMessage {
        return if (collection.find(eq(Ingredient::name.name, name)).toList().isNotEmpty()) {
            WarehouseMessage.OK
        } else {
            WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND
        }
    }

    override suspend fun getIngredientQuantity(name: String): RepositoryResponse<Int?> {
        val projectionQuantity = Projections.fields(Projections.include(Ingredient::quantity.name))
        val quantity =
            collection.withDocumentClass<Quantity>().find(
                eq(Ingredient::name.name, name),
            ).projection(projectionQuantity).firstOrNull()?.quantity
        return RepositoryResponse(
            quantity,
            if (quantity != null) {
                WarehouseMessage.OK
            } else {
                WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND
            },
        )
    }

    private suspend fun updateIngredientQuantity(
        name: String,
        quantity: Int,
    ): RepositoryResponse<Ingredient> {
        val oldQuantity = getIngredientQuantity(name)
        return if (oldQuantity.message == WarehouseMessage.OK) {
            val filter = eq(Ingredient::name.name, name)
            val updates = Updates.combine(Updates.set(Ingredient::quantity.name, oldQuantity.data!! + quantity))
            val res = collection.updateOne(filter, updates)
            if (res.modifiedCount > 0) {
                RepositoryResponse(getIngredient(name), WarehouseMessage.OK)
            } else {
                RepositoryResponse(null, WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND)
            }
        } else {
            RepositoryResponse(null, WarehouseMessage.ERROR_INGREDIENT_NOT_FOUND)
        }
    }

    override suspend fun decreaseIngredientQuantity(
        name: String,
        quantity: Int,
    ): RepositoryResponse<Ingredient> {
        return updateIngredientQuantity(name, -quantity)
    }

    override suspend fun restock(
        name: String,
        quantity: Int,
    ): RepositoryResponse<Ingredient> {
        return updateIngredientQuantity(name, quantity)
    }

    override suspend fun getAllAvailableIngredients(): RepositoryResponse<List<Ingredient>> {
        val availableIngredients =
            getAllIngredients().data!!.filter { i ->
                val qty = getIngredientQuantity(i.name)
                qty.message == WarehouseMessage.OK && qty.data!! > 0
            }
        return RepositoryResponse(availableIngredients, WarehouseMessage.OK)
    }
}

data class Quantity(val quantity: Int)
