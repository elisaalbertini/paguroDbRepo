import express, { Request, Response } from "express"
import { StatusCodes } from 'http-status-codes';
import { assertEquals } from 'typia'
import { IngredientInRecipe, Item } from "../domain/item";
import { addNewItem, getItemByName, getAllMenuItems, updateMenuItem, getAllAvailableMenuItems } from "../application/menu-service";
import { MenuMessage } from "../menu-message";

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
 * GET '/menu/:name' API handles the retrieval of an Item given the name as a query parameter delegating to the service
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
		case MenuMessage.EMPTY_MENU_DB: {
			return StatusCodes.NOT_FOUND
		}
		default: {
			return StatusCodes.BAD_REQUEST
		}
	}

}

/**
 * GET '/menu' API handles the retrieval of all the items delegating to the service
 */
router.get('/', async (req: Request, res: Response) => {
	const service_res = await getAllMenuItems()
	sendResponse(res, service_res.message, service_res.data)
})

/**
 * PUT '/menu' API handles the update of an item delegating to the service
 */
router.put('/', async (req: Request, res: Response) => {

	try {

		const set = {
			$set: {
				recipe: assertEquals<IngredientInRecipe[]>(req.body.recipe),
				price: assertEquals<number>(req.body.price)
			}
		}
		let service_res = await updateMenuItem(assertEquals<string>(req.body.name), set)
		sendResponse(res, service_res.message, service_res.data)
	} catch (error) {
		sendResponse(res, MenuMessage.ERROR_WRONG_PARAMETERS)
	}


})

/**
 * GET '/available/:availableIngredients' API handles the retrieval of an item 
 * given availableIngredients as a query parameter delegating to the service
 */
router.get('/available/:availableIngredients', async (req: Request, res: Response) => {
	try {
		const availableIng = assertEquals<string[]>(JSON.parse(req.params['availableIngredients']))
		let service_res = await getAllAvailableMenuItems(availableIng)
		sendResponse(res, service_res.message, service_res.data)
	} catch (error) {
		sendResponse(res, MenuMessage.ERROR_WRONG_PARAMETERS)
	}

})

export default router;
