package application;

/** Interface for the different messages the Employee Application sends to the server. */
public final class Message {

    /** To ask the server for all the orders */
    public static final String GET_ALL_ORDERS = "GET_ALL_ORDERS";

    /** To ask the server to update the order with the provided information */
    public static final String PUT_ORDER = "PUT_ORDER";

    private Message() {}
}
