import * as repository from '../src/repository/repository'
import { InsertOrder, Order, OrderState, OrderType } from '../src/domain/order'
import { OrdersMessage } from '../src/orders-message'
import * as client from '../src/repository/connection'
import * as conversion from '../src/repository/order-conversion-utils'
import * as db_test from './test-utils'

afterAll(() => { client.closeMongoClient() })

// read
test('Get All Orders', async () => {

    // empty repository test
    await db_test.emptyOrders()
    let value = await repository.getAllOrders()
    expect(value.message).toBe(OrdersMessage.EMPTY_ORDERS_DB)
    expect(value.data?.length).toBe(0)

    // repository with orders test
    await db_test.fillOrders()
    value = await repository.getAllOrders()
    expect(value.message).toBe(OrdersMessage.OK)
    expect(value.data?.length).toBe(4)

    let expectedValues = value.data?.map(o => conversion.removeIndexOrder(o))

    expect(expectedValues).toStrictEqual(db_test.getTestOrders())

})

// write
test('Create Order', async () => {
    await db_test.emptyOrders()
    let expectedOrder = conversion.toInsertOrder("user@gmail.com", 10, OrderType.AT_THE_TABLE, OrderState.PENDING, db_test.getTestItems())
    let res = await repository.createOrder(expectedOrder.customerContact, expectedOrder.price, expectedOrder.type, expectedOrder.items)
    expect(res.message).toBe(OrdersMessage.OK)
    if (res.data != undefined) {
        expect(conversion.removeIndexOrder(res.data)).toStrictEqual(expectedOrder)
    }

})