package domain

import kotlinx.serialization.Serializable

/**
 * Data class representing an ingredient
 * @param name of the ingredient
 * @param quantity of the ingredient in the warehouse
 */
@Serializable
data class Ingredient(val name: String, val quantity: Int)
