import { OrderState } from "../domain/order";
import { NewOrder } from "../routes/new-order";

/**
 * This interface represents the information needed to insert an order into the repository
 */

export interface InsertOrder extends NewOrder {
	state: OrderState;
}

