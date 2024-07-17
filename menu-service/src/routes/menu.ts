import express, { Request, Response } from "express"
import { StatusCodes } from 'http-status-codes';
import { assertEquals } from 'typia'
import { Item } from "../domain/item";
import { addNewItem, getItemByName } from "../application/menu-service";
import { MenuMessage } from "../../menu-message";

const router = express.Router();


/**
 * POST '/menu' API handles the addition of a new Item delegating to the service.
 */
router.post('/', async (req: Request, res: Response) => {
	try {
		let item = assertEquals<Item>(req.body)
		let service_res = await addNewItem(item.name, item.price, item.recipe)
		sendResponse(res, service_res.message, service_res.data)
	} catch (error) {
		sendResponse(res, MenuMessage.ERROR_WRONG_PARAMETERS)
	}

});

/**
 * GET '/menu/:name' API handles the retrieval of an Item given the paramete name delegating to the service
 */
router.get('/:name', async (req: Request, res: Response) => {
	let service_res = await getItemByName(req.params['name'])
	sendResponse(res, service_res.message, service_res.data)
})

function sendResponse(res: Response, message: string, data?: any) {
	res.statusMessage = message
	res.statusCode = serviceMessageToCode(res.statusMessage)
	res.json(data)
}

function serviceMessageToCode(service_message: string) {
	switch (service_message) {
		case MenuMessage.OK: {
			return StatusCodes.OK
		}
		case MenuMessage.ERROR_ITEM_NOT_FOUND: {
			return StatusCodes.NOT_FOUND
		}
		default: {
			return StatusCodes.BAD_REQUEST
		}
	}

}

export default router;


