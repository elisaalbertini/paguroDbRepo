package application

import kotlinx.serialization.Serializable

/**
 * Data Class that contains the information necessary to update an ingredient quantity in the warehouse
 * @param name of the ingredient
 * @param quantity of the ingredient
 */
@Serializable
data class UpdateQuantity(val name: String, val quantity: Int)
