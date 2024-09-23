import { OrderType, OrderItem } from "../domain/order";

/**
 * this interface represents the information needed to create a new pending order
 */
export interface NewOrder {
	customerEmail: string;
	price: number;
	type: OrderType;
	items: OrderItem[];
}
