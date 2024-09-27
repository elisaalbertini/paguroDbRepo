package application;

import application.schema.Order;
import application.schema.OrderItem;
import application.schema.Request;
import io.vertx.core.AsyncResult;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.WebSocket;
import io.vertx.core.json.JsonObject;
import java.awt.*;
import javax.swing.*;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;

/** Graphic Panel Representation for an Order modifica ciao*/
public class OrderCard extends JPanel {

  private static final String READY = "READY";
  private static final String COMPLETED = "COMPLETED";

  /**
   * application.OrderCard constructor
   *
   * @param order json representation of an order
   * @param ctx the websocket
   * @param color the background color
   */
  public OrderCard(Order order, AsyncResult<WebSocket> ctx, Color color) {
    super();

    setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
    addLabels(order);

    JButton button = new JButton("Choose State");
    button.setEnabled(false);

    ButtonGroup radio = new ButtonGroup();
    JRadioButton ready = createRadioButton(READY, color, button, radio);
    createRadioButton(COMPLETED, color, button, radio);

    button.addActionListener(
        x -> changeOrderState(ready.isSelected() ? READY : COMPLETED, order, ctx));

    add(button);
    var border = BorderFactory.createLineBorder(Color.black);
    var margin = new EmptyBorder(10, 10, 10, 10);
    setBorder(new CompoundBorder(border, margin));
    setBackground(color);
  }

  private void changeOrderState(String state, Order order, AsyncResult<WebSocket> ctx) {
    var updateOrder = new JsonObject();

    updateOrder.put("_id", order._id()).put("state", state);
    ctx.result()
        .write(
            Buffer.buffer(
                String.valueOf(Request.createJsonRequest(Message.PUT_ORDER, updateOrder))));
  }

  private void addLabels(Order order) {
    add(new JLabel("Order id: " + order._id()));
    add(new JLabel("Email: " + order.customerEmail()));
    add(new JLabel("Price: " + order.price()));
    add(new JLabel("Order Type: " + order.type()));
    add(new JLabel("Order State: " + order.state()));
    addItemsLabel(order);
  }

  private void addItemsLabel(Order order) {
    StringBuilder toPrint = new StringBuilder();
    var items = order.items();
    for (OrderItem item : items) {
      var name = item.item().name();
      toPrint.append(", ").append(name).append(" x ").append(item.quantity());
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
