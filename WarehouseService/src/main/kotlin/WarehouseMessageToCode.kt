import java.net.HttpURLConnection

/**
 * Object that maps WarehouseMessage into Http codes
 */
object WarehouseMessageToCode {
    fun convert(warehouseMessage: WarehouseMessage): Int {
        return when (warehouseMessage) {
            WarehouseMessage.OK -> {
                HttpURLConnection.HTTP_OK
            }
            WarehouseMessage.ERROR_DB_NOT_AVAILABLE -> {
                HttpURLConnection.HTTP_INTERNAL_ERROR
            }
            WarehouseMessage.ERROR_INGREDIENT_ALREADY_EXISTS,
            WarehouseMessage.ERROR_INGREDIENT_QUANTITY,
            WarehouseMessage.ERROR_WRONG_PARAMETERS,
            -> {
                HttpURLConnection.HTTP_BAD_REQUEST
            }
            else -> {
                HttpURLConnection.HTTP_NOT_FOUND
            }
        }
    }
}
