/** Interface for the different messages the Employee Application sends to the server. */
public interface Message {
  /** To ask the server for all the orders */
  String GET_ALL_ORDERS = "GET_ALL_ORDERS";
  /** To ask the server to update the order with the provided information */
  String PUT_ORDER = "PUT_ORDER";
}
