import axios from 'axios'
import * as client from '../src/repository/connection'
import { server } from '../src/app'
import * as db_test from '../test/test-utils'
import { OrdersMessage } from '../src/orders-message'
import { removeIndexOrder } from '../src/repository/order-conversion-utils'
import { assertEquals } from 'typia'
import { Order, OrderState } from '../src/domain/order'

const http = axios.create({
    baseURL: 'http://localhost:8090'
})

beforeEach(async () => { await db_test.emptyOrders() })

afterAll(() => {
    client.closeMongoClient()
    server.close()
})

test('Get All Orders', async () => {

    // empty
    await http.get('/orders').catch((error) => {
        expect(error.response.status).toBe(404)
        expect(error.response.statusText).toBe(OrdersMessage.EMPTY_ORDERS_DB)
        expect(error.response.data).toStrictEqual([])
    })

    // ok
    await db_test.fillOrders()
    let res = await http.get('/orders')
    expect(res.status).toBe(200)
    expect(res.statusText).toBe(OrdersMessage.OK)
    assertEquals<Order[]>(res.data)
    let orders = res.data as Order[]
    let expectedValues = orders.map(o => removeIndexOrder(o))
    expect(expectedValues).toStrictEqual(db_test.getTestOrders())

})

test('Add New Order', async () => {

    await db_test.fillOrders()
    let json: any = {
        "customerContact": "c1",
        "price": 1,
        "type": "HOME_DELIVERY",
        "items": [
            {
                "item": {
                    "name": "i1"
                },
                "quantity": 2
            },
        ]
    }


    let res = await http.post('/orders', json)
    expect(res.status).toBe(200)
    expect(res.statusText).toBe(OrdersMessage.OK)
    let last = await db_test.getLastInsertedOrder()
    expect(res.data).toStrictEqual(last)

    // send wrong format
    json["state"] = OrderState.PENDING
    await http.post('/orders', json).catch((error) => {
        expect(error.response.status).toBe(400)
        expect(error.response.statusText).toBe(OrdersMessage.ERROR_WRONG_PARAMETERS)
        expect(error.response.data).toStrictEqual({})

    })

})
