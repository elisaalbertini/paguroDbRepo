import kotlinx.serialization.Serializable

/**
 * Class that contains the information necessary to update an ingredient quantity in the warehouse
 * @param name of the ingredient
 * @param quantity of the ingredient
 */
@Serializable
class UpdateQuantity(val name: String, val quantity: Int)
