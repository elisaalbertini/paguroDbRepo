package repository

import Message

/**
 *  Data class representing the response of Repository
 *  @param data represent what the query return
 *  @param message returned by the Repository
 */
data class RepositoryResponse<Data>(
    val data: Data?,
    val message: Message,
)
