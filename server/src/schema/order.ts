/**
 * Order schema
 */
export interface Order {
	customerEmail: string;
	price: number;
	type: string;
	items: OrderItem[];
}

/**
 * Item in Order schema
 */
export interface OrderItem {
	item: ItemId;
	quantity: number;
}

/**
 * Item Id schema
 */
export interface ItemId {
	name: string
}
