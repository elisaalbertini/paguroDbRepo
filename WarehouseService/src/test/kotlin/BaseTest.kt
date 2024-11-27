import com.mongodb.client.model.Filters
import domain.Ingredient
import io.kotest.core.spec.style.AnnotationSpec
import server.MongoUtils

open class BaseTest : AnnotationSpec() {
    init {
        SetupLogger().setupLogger()
    }

    protected val collection = MongoUtils.getMongoCollection(MongoInfo())
    protected val milk = Ingredient("milk", 99)
    protected val tea = Ingredient("tea", 4)
    protected val coffee = Ingredient("coffee", 1)
    protected val butter = Ingredient("butter", -2)
    protected val notAvailableCoffee = Ingredient(coffee.name, 0)
    protected val ingredients = listOf(milk, tea)

    @BeforeEach
    suspend fun beforeTest() {
        collection.deleteMany(Filters.empty())
        collection.insertMany(ingredients)
    }
}
