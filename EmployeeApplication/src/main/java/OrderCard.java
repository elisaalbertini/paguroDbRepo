import io.vertx.core.AsyncResult;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.WebSocket;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import java.awt.*;
import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;

/** Graphic Panel Representation for an Order */
public class OrderCard extends JPanel {

  /**
   * OrderCard constructor
   *
   * @param jsonOrder json representation of an order
   * @param ctx the websocket
   * @param color the background color
   */
  public OrderCard(JsonObject jsonOrder, AsyncResult<WebSocket> ctx, Color color) {
    super();
    setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
    addLabels(jsonOrder);

    JButton button = new JButton("Choose State");
    button.setEnabled(false);

    ButtonGroup radio = new ButtonGroup();
    JRadioButton ready = createRadioButton("READY", color, button, radio);
    createRadioButton("COMPLETED", color, button, radio);

    button.addActionListener(
        x -> {
          var state = ready.isSelected() ? "READY" : "COMPLETED";
          var updateOrder = new JsonObject();
          updateOrder.put("_id", jsonOrder.getValue("_id")).put("state", state);

          var request = new JsonObject();
          request
              .put("client_name", "Orders")
              .put("client_request", Message.PUT_ORDER)
              .put("input", updateOrder.toString());
          ctx.result().write(Buffer.buffer(String.valueOf(request)));
        });

    add(button);
    var border = BorderFactory.createLineBorder(Color.black);
    var margin = new EmptyBorder(10, 10, 10, 10);
    setBorder(new CompoundBorder(border, margin));
    setBackground(color);
  }

  private void addLabels(JsonObject jsonOrder) {
    add(new JLabel("Order id: " + jsonOrder.getValue("_id")));
    add(new JLabel("Email: " + jsonOrder.getValue("customerEmail")));
    add(new JLabel("Price: " + jsonOrder.getValue("price")));
    add(new JLabel("Order Type: " + jsonOrder.getValue("type")));
    add(new JLabel("Order State: " + jsonOrder.getValue("state")));
    addItemsLabel(jsonOrder);
  }

  private void addItemsLabel(JsonObject jsonOrder) {
    StringBuilder toPrint = new StringBuilder();
    var v = (JsonArray) jsonOrder.getValue("items");
    for (int i = 0; i < v.size(); i++) {
      var item = (JsonObject) v.getJsonObject(i).getValue("item");
      var name = item.getValue("name");
      toPrint
          .append(", ")
          .append(name)
          .append(" x ")
          .append(v.getJsonObject(i).getValue("quantity"));
    }
    toPrint = new StringBuilder(toPrint.subSequence(1, toPrint.length()).toString());
    var label = new JLabel("Order Items: " + toPrint);
    label.setLayout(new GridLayout(0, 1));
    add(label);
  }

  private JRadioButton createRadioButton(
      String option, Color color, JButton button, ButtonGroup bg) {
    JRadioButton rb = new JRadioButton(option);
    rb.setBackground(color);
    rb.addActionListener(
        x -> {
          button.setText("Click to set order as " + option);
          button.setEnabled(true);
        });
    bg.add(rb);
    add(rb);
    return rb;
  }
}
