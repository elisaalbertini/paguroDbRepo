package application.schema;

import java.util.List;

/**
 * Order Schema
 *
 * @param _id of the order
 * @param customerEmail email of the customer that made the order qwertytrewqwertytrewqwertyrewq asdfghjhgfdsa drgzdgdrhzdrg qwrttrewq qwerewqwerewq
 * @param price total price of the order
 * @param type type of the order wdefgrthgrfdewsdfgthgrfdes
 * @param state current state of the order qwertytrewqwertrewertytrewertytrewqwertrewqwertrewqwertqwertfgyuhijoèkp+stydufgihjk
 * @param items ordered menu items
 */
public record Order(
    String _id,
    String customerEmail,
    int price,
    String type,
    String state,
    List<OrderItem> items) {}