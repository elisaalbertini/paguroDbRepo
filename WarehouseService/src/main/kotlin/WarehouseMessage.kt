/**
 * Class that lists the messages returned by the Repository and the WarehouseService
 */
enum class WarehouseMessage {
    OK,
    ERROR_INGREDIENT_NOT_FOUND,
    ERROR_INGREDIENT_ALREADY_EXISTS,
    ERROR_EMPTY_WAREHOUSE,
    ERROR_INGREDIENT_QUANTITY,
    ERROR_DB_NOT_AVAILABLE,
    ERROR_WRONG_PARAMETERS,
}
