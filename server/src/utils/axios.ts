import axios from 'axios'
import { checkErrorMessage } from './handlers'
import WebSocket from 'ws'

/**
 * Connection with the warehouse microservice
 */
export const http = axios.create({
	baseURL: 'http://warehouse-service:8080'
})

/**
 * Connection with the orders microservice
 */
export const httpOrders = axios.create({
	baseURL: 'http://orders-service:8090'
})

/**
 * Connection with the menu microservice
 */
export const httpMenu = axios.create({
	baseURL: 'http://menu-service:8085'
})

/**
 * This function catches the error of a promise and sends a message
 * @param promise 
 * @param ws 
 */
export function catchErrorAndSendMsg(promise: Promise<any>, ws: WebSocket) {
	promise.catch((e) => ws.send(checkErrorMessage(e)))
}
