import { Service } from '../utils/service';
import { WarehouseIngredient } from './item';

/**
 * This interface represents the response sent by the microservice to the server
 */
export interface ServiceResponse<T> {
	statusText: string;
	status: number;
	data: T;
}
/**
 * This interface represents the request the client sends to the server
 */

export interface RequestMessage {
	client_name: Service
	client_request: string
	input: any
}
/**
 * This interface represents the response the client receives from the server
 */

export interface ResponseMessage {
	message: string
	code: number
	data: any
}/**
 * This interface represents the notification sent when an element is missing in the warehouse
 */

export interface MissingIngredientNotification {
	message: string
	data: WarehouseIngredient[]
}
/**
 * This interface represents the first message sent by a frontend
 */

export interface Log {
	message: string
}

