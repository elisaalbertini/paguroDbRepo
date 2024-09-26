import { RequestMessage } from "./schema/messages"

/**
 * This function returns if the web socket passed is opened or not. 
 * In case it's opened, the function sends the request.
 * @param request that has to be sent 
 * @param ws web socket to check
 * @returns if the web socket is opened or not 
 */
export function checkWsConnectionAndSend(request: RequestMessage, ws: WebSocket) {
	const isConnected = (ws.readyState == WebSocket.OPEN)
	if (isConnected) {
		ws.send(JSON.stringify(request))
	}
	return isConnected
}
