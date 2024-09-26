package application.schema;

import java.util.List;

/**
 * This class represents the response, a message received from the server.
 *
 * @param message provided by the server
 * @param code provided by the server
 * @param data provided by the server
 */
public record Response(String message, int code, List<Order> data) {

  /**
   * It says if the server response is code based on the code.
   *
   * @return true if the code is ok, false otherwise
   */
  public boolean isCodeOk() {
    return code == 200;
  }

  /**
   * It says if the server is not available based on the message of the response.
   *
   * @return true if the server is not available, false otherwise
   */
  public boolean isServerNotAvailable() {
    return message.equals("ERROR_SERVER_NOT_AVAILABLE");
  }
}
