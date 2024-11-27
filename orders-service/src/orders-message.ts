/**
 * This enum lists the messages sent by the repository
 */
export enum OrdersMessage {
	OK = "OK",
	EMPTY_ORDERS_DB = "EMPTY_ORDERS_DB",
	ERROR_WRONG_PARAMETERS = "ERROR_WRONG_PARAMETERS",
	ORDER_ID_NOT_FOUND = "ORDER_ID_NOT_FOUND",
	CHANGE_STATE_NOT_VALID = "CHANGE_STATE_NOT_VALID"
}
