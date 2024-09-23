import axios, { AxiosInstance } from 'axios'
import { checkErrorMessage } from './handlers'
import WebSocket from 'ws'

/**
 * Connection with the warehouse microservice
 */
export const http = createAxios(process.env.WAREHOUSE_ADDRESS, '8080')

/**
 * Connection with the orders microservice
 */
export const httpOrders = createAxios(process.env.ORDER_ADDRESS, '8090')

/**
 * Connection with the menu microservice
 */
export const httpMenu = createAxios(process.env.MENU_ADDRESS, '8085')

function createAxios(address: string | undefined, port: string): AxiosInstance {
	return axios.create({
		baseURL: 'http://' + (address != undefined ? address : 'localhost') + ':' + port
	})
}
/**
 * This function catches the error of a promise and sends a message
 * @param promise 
 * @param ws 
 */
export function catchErrorAndSendMsg(promise: Promise<any>, ws: WebSocket) {
	promise.catch((e) => ws.send(checkErrorMessage(e)))
}
