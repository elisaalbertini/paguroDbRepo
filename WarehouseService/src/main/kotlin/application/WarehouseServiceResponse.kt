package application

import Message

/**
 * Data class representing the response of the WarehouseService modifica ciao ciaoo ciao ciao ciao ciao ciao ciao ciao ciao
 * @param data returned by the query
 * @param response returned by the WarehouseService
 */
data class WarehouseServiceResponse<Data>(
    val data: Data?,
    val response: Message,
)
