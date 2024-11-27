import java.net.HttpURLConnection

/**
 * Object that maps WarehouseMessage into Http codes
 */
object WarehouseMessageToCode {
    fun convert(warehouseMessage: Message): Int {
        return when (warehouseMessage) {
            Message.OK -> {
                HttpURLConnection.HTTP_OK
            }
            Message.ERROR_INGREDIENT_ALREADY_EXISTS,
            Message.ERROR_INGREDIENT_QUANTITY,
            Message.ERROR_WRONG_PARAMETERS,
            -> {
                HttpURLConnection.HTTP_BAD_REQUEST
            }
            else -> {
                HttpURLConnection.HTTP_NOT_FOUND
            }
        }
    }
}
