import { Item } from "./Item"

/**
 * this interface represents the information needed to create a new pending order
 */
export interface NewOrder {
  customerEmail: string,
  price: number,
  type: OrderType,
  items: OrderItem[]
}


/**
 * this interface represents the item inside an order, so the item itself in the ordered quantity
 */
interface OrderItem {
  item: Item,
  quantity: number
}

/**
 * this enum represents the three different types of orders
 */
export enum OrderType {
  AT_THE_TABLE = "AT_THE_TABLE",
  TAKE_AWAY = "TAKE_AWAY",
  HOME_DELIVERY = "HOME_DELIVERY"
}
