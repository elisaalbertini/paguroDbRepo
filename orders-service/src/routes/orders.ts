import express, { Request, Response } from "express"
import { StatusCodes } from 'http-status-codes';
import { assertEquals } from 'typia'
import { NewOrder, Order, OrderState } from "../domain/order"
import { OrdersMessage } from "../orders-message"
import * as service from "../application/orders-service"

const router = express.Router();

/**
 * POST '/orders' API handles the addition of a new Order delegating to the service.
 */
router.post('/', async (req: Request, res: Response) => {
	try {
		const order = assertEquals<NewOrder>(req.body)
		let service_res = await service.addNewOrder(order.customerEmail, order.price, order.type, order.items)
		sendResponse(res, service_res.message, service_res.data)
	} catch (error) {
		sendResponse(res, OrdersMessage.ERROR_WRONG_PARAMETERS, {})
	}

});

/**
 * GET '/orders' API handles the retrieval of all the Orders delegating to the service
 */
router.get('/', async (req: Request, res: Response) => {
	let service_res = await service.getAllOrders()
	sendResponse(res, service_res.message, service_res.data)
})

/**
 * GET 'orders/:orderId' API handles the retrieval of one specific Order delegating to the service
 */
router.get('/:orderId', async (req: Request, res: Response) => {
	let service_res = await service.getOrderById(req.params['orderId'])
	sendResponse(res, service_res.message, service_res.data)
})

/**
 * PUT '/orders' API handles the update of one specific Order delegating to the service and sending a notify email when needed
 */
router.put('/', async (req: Request, res: Response) => {
	try {
		let order = assertEquals<Order>(req.body)
		let service_res = await service.updateOrder(order._id, order.state)
		if (service_res.data?.customerEmail && service_res.message == OrdersMessage.OK && order.state == OrderState.READY) {
			await service.sendNotifyEmail(service_res.data.customerEmail)
		}
		sendResponse(res, service_res.message, service_res.data)
	} catch (error) {
		sendResponse(res, OrdersMessage.ERROR_WRONG_PARAMETERS, {})
	}
})

function sendResponse(res: Response, message: string, data: any) {
	res.statusMessage = message
	res.statusCode = serviceMessageToCode(res.statusMessage)
	res.json(data)
}

function serviceMessageToCode(service_message: string) {
	switch (service_message) {
		case OrdersMessage.OK: {
			return StatusCodes.OK
		}
		case OrdersMessage.EMPTY_ORDERS_DB:
		case OrdersMessage.ORDER_ID_NOT_FOUND: {
			return StatusCodes.NOT_FOUND
		}
		default: {
			return StatusCodes.BAD_REQUEST
		}
	}

}

export default router;
