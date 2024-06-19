import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import domain.Ingredient
import io.kotest.core.spec.style.AnnotationSpec
import server.MongoUtils

open class BaseTest : AnnotationSpec() {
    protected val collection = MongoUtils.getMongoCollection(MongoInfo())
    protected val milk = Ingredient("milk", 99)
    protected val tea = Ingredient("tea", 4)
    protected val coffee = Ingredient("coffee", 1)
    protected val notAvailableCoffee = Ingredient(coffee.name, 0)
    protected val ingredients = listOf(milk, tea)

    @BeforeAll
    suspend fun initializeCollection(){
        MongoClient.create(MongoInfo().mongoAddress)
            .getDatabase(MongoInfo().databaseName)
            .createCollection("Ingredients")
    }

    @BeforeEach
    suspend fun beforeTest() {
        collection.deleteMany(Filters.empty())
        collection.insertMany(ingredients)
    }

    fun getWrongInfo(): MongoInfo {
        return MongoInfo("mongodb://localhost:27016/")
    }
}
