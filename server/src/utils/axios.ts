import axios from 'axios'
import { checkErrorMessage } from './utils'
import WebSocket from 'ws'

/**
 * Connection with the warehouse microservice
 */
export const http = axios.create({
	baseURL: 'http://localhost:8080'
})

/**
 * Connection with the orders microservice
 */
export const httpOrders = axios.create({
	baseURL: 'http://localhost:8090'
})

/**
 * Connection with the menu microservice
 */
export const httpMenu = axios.create({
	baseURL: 'http://localhost:8085'
})

/**
 * This function catches the error of a promise and sends a message
 * @param promise 
 * @param ws 
 */
export function catchErrorAndSendMsg(promise: Promise<any>, ws: WebSocket) {
	promise.catch((e) => ws.send(checkErrorMessage(e)))
}
