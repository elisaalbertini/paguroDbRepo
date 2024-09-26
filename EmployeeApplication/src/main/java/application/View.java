package application;

import application.schema.Order;
import io.vertx.core.AsyncResult;
import io.vertx.core.http.WebSocket;
import java.awt.*;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Stream;
import javax.swing.*;

/** application.Main GUI Frame */
public class View extends JFrame {

  /** Panel that contains all the order cards */
  private final JPanel ordersPanel;
  /** Label that contains the status message */
  private final JLabel messageLabel;

  /** application.Main GUI Frame Constructor */
  public View() {
    setTitle("Employee Application");

    messageLabel = initMessageLabel();

    ordersPanel = initOrdersPanel();

    initFrameSizeAndLocation();

    setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
  }

  private JLabel initMessageLabel() {
    JPanel labelPanel = new JPanel();
    JLabel label = new JLabel("");
    labelPanel.add(label);
    add(labelPanel);
    return label;
  }

  private JPanel initOrdersPanel() {
    JPanel panel = new JPanel();
    panel.setLayout(new GridLayout(0, 1));
    JScrollPane scroll = new JScrollPane(panel);
    getContentPane().add(scroll);
    return panel;
  }

  private void initFrameSizeAndLocation() {
    Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
    int width = screenSize.width / 2;
    int height = screenSize.height / 2;
    setSize(width, height);
    setLocation(width / 2, height / 2);
    setVisible(true);
    getContentPane().setLayout(new BoxLayout(getContentPane(), BoxLayout.Y_AXIS));
  }

  /**
   * It repaints the order panels based on the received data array
   *
   * @param array the order data
   * @param ctx the websocket
   */
  public void addPanels(List<Order> array, AsyncResult<WebSocket> ctx) {
    ordersPanel.removeAll();
    var iterator = array.stream().iterator();
    var colors = new LinkedList<Color>();
    colors.add(Color.PINK);
    colors.add(Color.LIGHT_GRAY);
    var infiniteIterator =
        Stream.iterate(0, i -> (i + colors.size() + 1) % colors.size()).iterator();
    while (iterator.hasNext()) {
      var color = colors.get(infiniteIterator.next());
      var next = iterator.next();
      ordersPanel.add(new OrderCard(next, ctx, color));
    }
    ordersPanel.revalidate();
  }

  /**
   * It repaints the label message based on the received message
   *
   * @param message to display
   */
  public void setMessageLabel(String message) {
    messageLabel.setText("Recap Order: " + message);
  }
}
