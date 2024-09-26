import { OrderState } from "../domain/order";
import { NewOrder } from "../routes/new-order";

/**
 * this interface represents the information needed to insert an order into the repository modifica
 */

export interface InsertOrder extends NewOrder {
	state: OrderState;
}

