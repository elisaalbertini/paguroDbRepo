import axios from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import { assertEquals } from 'typia'
import { addItem, emptyMenuDb, getLastInsertedItem } from './utils/test-utils'
import { Item } from '../src/domain/item'
import { MenuMessage } from '../menu-message'

const http = axios.create({
    baseURL: 'http://localhost:8085'
})

const omelette: Item = {
    name: "omelette",
    recipe: [
        {
            ingredient_name: "egg",
            quantity: 2
        }
    ],
    price: 3
}

beforeEach(async () => {
    await emptyMenuDb()
    await addItem(omelette)
})

afterAll(() => {
    client.closeMongoClient()
    server.close()
})

test('Get Item by name', async () => {
    // ok
    const res = await http.get('/menu/omelette')
    expect(res.status).toBe(200)
    expect(res.statusText).toBe(MenuMessage.OK)
    assertEquals<Item>(res.data)
    const item = res.data as Item
    expect(item).toStrictEqual(omelette)

    // empty
    await emptyMenuDb()
    await http.get('/menu/omelette').catch((error) => {
        expect(error.response.status).toBe(404)
        expect(error.response.statusText).toBe(MenuMessage.ERROR_ITEM_NOT_FOUND)
        expect(error.response.data).toStrictEqual("")
    })

})

test('Add new item', async () => {

    const friedEgg: Item = {
        name: "fried_egg",
        recipe: [
            {
                ingredient_name: "egg",
                quantity: 1
            }
        ],
        price: 1
    }

    const wrongItem: any = {
        name: "boiled_egg",
        recipe: [
            {
                ingredient_name: "egg",
                quantity: 1
            }
        ],
        price: "1"
    }

    let res = await http.post('/menu', friedEgg)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe(MenuMessage.OK)
    assertEquals<Item>(res.data)
    let last = await getLastInsertedItem()
    expect(res.data).toStrictEqual(last)

    // send wrong format
    await http.post('/menu', wrongItem).catch((error) => {
        expect(error.response.status).toBe(400)
        expect(error.response.statusText).toBe(MenuMessage.ERROR_WRONG_PARAMETERS)
        expect(error.response.data).toStrictEqual("")

    })
    // name already existing
    await http.post('/menu', friedEgg).catch((error) => {
        expect(error.response.status).toBe(400)
        expect(error.response.statusText).toBe(MenuMessage.ERROR_ITEM_ALREADY_EXISTS)
        expect(error.response.data).toStrictEqual("")

    })
})
