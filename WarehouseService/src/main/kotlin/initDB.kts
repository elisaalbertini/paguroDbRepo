import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.Indexes
import com.mongodb.kotlin.client.coroutine.MongoClient
import domain.Ingredient
import kotlinx.coroutines.runBlocking

runBlocking {
    val ascendingIndex = Indexes.text("name")
    MongoClient
        .create(MongoInfo().mongoAddress)
        .getDatabase(MongoInfo().databaseName)
        .getCollection<Ingredient>(MongoInfo().collectionName)
        .createIndex(ascendingIndex, IndexOptions().unique(true))
}
