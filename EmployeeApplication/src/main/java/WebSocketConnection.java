import io.vertx.core.AbstractVerticle;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.WebSocketClient;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

/**
 * This class is in charge of connecting to the server and handling the GUI update when it receives
 * messages from the server. When start is called it connects the websocket to the server and
 * initializes the message handler. The handler updates the GUI when order data arrives, if the
 * server is not able to provide the data the websocket resends the request. If the connection is
 * successful it asks all the orders from the server. If the connection is not successful it keeps
 * trying to reconnect.
 */
public class WebSocketConnection extends AbstractVerticle {

  View view;

  /**
   * Class Constructor
   *
   * @param view the Main GUI
   */
  public WebSocketConnection(View view) {
    this.view = view;
  }

  @Override
  public void start() {
    startClient(vertx);
  }

  private void startClient(Vertx vertx) {
    var request = new JsonObject();
    request
        .put("client_name", "Orders")
        .put("client_request", Message.GET_ALL_ORDERS)
        .put("input", "");

    WebSocketClient client = vertx.createWebSocketClient();
    connect(client, request);
  }

  private void connect(WebSocketClient client, JsonObject request) {
    client.connect(
        3000,
        "localhost",
        "/",
        (ctx) -> {
          var ws = ctx.result();
          if (ws != null) {

            ws.handler(
                message -> {
                  JsonObject res = message.toJsonObject();
                  var msg = (String) res.getValue("message");
                  var code = (Integer) res.getValue("code");
                  if (code == 200) {
                    var data = new JsonArray(res.getValue("data").toString());
                    view.addPanels(data, ctx);
                  } else if (msg.equals("ERROR_SERVER_NOT_AVAILABLE")) {
                    try {
                      Thread.sleep(1000);
                      ws.write(Buffer.buffer(String.valueOf(request)));
                    } catch (InterruptedException e) {
                      e.printStackTrace();
                    }
                  }
                  view.setLabel(msg);
                });

            ws.write(Buffer.buffer(String.valueOf(request)));
          } else {
            connect(client, request);
          }
        });
  }
}
