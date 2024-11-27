package repository.features.stepDefinition

import BaseTest
import MongoInfo
import com.mongodb.client.model.Filters
import domain.Ingredient
import io.cucumber.java.en.Given
import io.vertx.core.Vertx
import io.vertx.kotlin.coroutines.coAwait
import kotlinx.coroutines.runBlocking
import server.Server

class StepDefinitionGiven : BaseTest() {
    init {
        runBlocking {
            Vertx.vertx().deployVerticle(Server(MongoInfo(), 8080)).coAwait()
        }
    }

    @Given("there are 99 units of milk and 4 units of tea in the warehouse")
    fun thereAre99UnitsOfMilkAnd4UnitsOfTeaInTheWarehouse() {
        runBlocking {
            collection.deleteMany(Filters.empty())
            collection.insertMany(ingredients)
        }
    }

    @Given("there are 99 units of milk, 4 units of tea and 0 unit of coffee in the warehouse")
    fun thereAre99UnitsOfMilk4UnitsOfTeaAnd0UnitOfCoffeeInTheWarehouse() {
        thereAre99UnitsOfMilkAnd4UnitsOfTeaInTheWarehouse()
        runBlocking {
            collection.insertOne(Ingredient(coffee.name, 0))
        }
    }

    @Given("there are no ingredients in the warehouse")
    fun thereAreNoIngredientsInTheWarehouse() {
        runBlocking {
            collection.deleteMany(Filters.empty())
        }
    }
}
