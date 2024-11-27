import { StatusCodes } from 'http-status-codes';
import { MenuMessage } from '../../src/menu-message';

/**
 * This interface represents the response given by an API
 */
export interface ApiResponse {
	code: StatusCodes,
	message: string
}

export const OK: ApiResponse = {
	code: StatusCodes.OK,
	message: MenuMessage.OK
}

export const ERROR_ITEM_ALREADY_EXISTS: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: MenuMessage.ERROR_ITEM_ALREADY_EXISTS
}

export const ERROR_ITEM_NOT_FOUND: ApiResponse = {
	code: StatusCodes.NOT_FOUND,
	message: MenuMessage.ERROR_ITEM_NOT_FOUND
}

export const ERROR_WRONG_PARAMETERS: ApiResponse = {
	code: StatusCodes.BAD_REQUEST,
	message: MenuMessage.ERROR_WRONG_PARAMETERS
}

export const EMPTY_MENU_DB: ApiResponse = {
	code: StatusCodes.NOT_FOUND,
	message: MenuMessage.EMPTY_MENU_DB
}
