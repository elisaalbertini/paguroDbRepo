import express, { Request, Response } from "express"
import { StatusCodes } from 'http-status-codes';
import { assertEquals } from 'typia'
import { NewOrder } from "../domain/order"
import { OrdersMessage } from "../orders-message"
import * as service from "../application/orders-service"

var router = express.Router();

/**
 * POST '/orders' API handles the addition of a new Order delegating to the service.
 */
router.post('/', async (req: Request, res: Response) => {
    let order = req.body

    try {
        assertEquals<NewOrder>(order)
        let service_res = await service.addNewOrder(order.customerContact, order.price, order.type, order.items)
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
        case OrdersMessage.EMPTY_ORDERS_DB: {
            return StatusCodes.NOT_FOUND
        }
        default: {
            return StatusCodes.BAD_REQUEST
        }
    }

}

export default router;
