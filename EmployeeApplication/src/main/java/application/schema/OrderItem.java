package application.schema;

/**
 * OrderItem schema
 *
 * @param item ordered item
 * @param quantity ordered quantity of the item
 */
public record OrderItem(Item item, int quantity) {}
