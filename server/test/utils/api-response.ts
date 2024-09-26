import { StatusCodes } from "http-status-codes"

/**
 * This interface represents the response given by an API
 */
export interface ApiResponse {
	code: number,
	message: string
}

export const OK: ApiResponse = {
	code: StatusCodes.OK,
	message: "OK"
}

export const CHANGE_STATE_NOT_VALID: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: "CHANGE_STATE_NOT_VALID"
}

export const ORDER_ID_NOT_FOUND: ApiResponse = {
	code: StatusCodes.NOT_FOUND,
	message: "ORDER_ID_NOT_FOUND"
}

export const ERROR_MISSING_INGREDIENTS: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: "ERROR_MISSING_INGREDIENTS"
}

export const ERROR_WRONG_PARAMETERS: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: "ERROR_WRONG_PARAMETERS"
}

export const ERROR_INGREDIENT_NOT_FOUND: ApiResponse = {
	code: StatusCodes.NOT_FOUND,
	message: "ERROR_INGREDIENT_NOT_FOUND"
}

export const ERROR_INGREDIENT_ALREADY_EXISTS: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: "ERROR_INGREDIENT_ALREADY_EXISTS"
}

export const ERROR_INGREDIENT_QUANTITY: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: "ERROR_INGREDIENT_QUANTITY"
}

export const ERROR_EMPTY_WAREHOUSE: ApiResponse = {
	code: StatusCodes.NOT_FOUND,
	message: "ERROR_EMPTY_WAREHOUSE"
}
