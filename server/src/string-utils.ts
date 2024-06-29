import { WarehouseInput } from './utils/warehouse-input'

/**
 * This utility transforms a string into the format expected by the API exposed by the Warehouse microservice 
 * @param string sent as input
 * @returns the input into the correct format
 */
export function fromStringToInput(string: string) {
	const jsonObj = JSON.parse(string)
	return jsonObj as WarehouseInput
}


/**
 * This utility transforms a string into an array in the format expected by the API exposed by the Warehouse microservice 
 * @param string sent as input
 * @returns the input into an array of the correct format
 */
export function fromStringToArrayInput(string: string) {
	const jsonObj = JSON.parse(string)
	return jsonObj as WarehouseInput[]
}
