import io.vertx.core.AsyncResult;
import io.vertx.core.http.WebSocket;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import java.awt.*;
import java.util.LinkedList;
import java.util.stream.Stream;
import javax.swing.*;

/** Main GUI Frame */
public class View extends JFrame {

  private final JPanel panel;
  private final JLabel label;

  /** Main GUI Frame Constructor */
  public View() {
    setTitle("Employee Application");

    JPanel labelPanel = new JPanel();
    label = new JLabel("");
    labelPanel.add(label);
    add(labelPanel);

    panel = new JPanel();
    panel.setLayout(new GridLayout(0, 1));
    JScrollPane scroll = new JScrollPane(panel);
    getContentPane().add(scroll);

    Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
    setSize(screenSize.width / 2, screenSize.height / 2);
    setLocation(screenSize.width / 4, screenSize.height / 4);
    setVisible(true);
    getContentPane().setLayout(new BoxLayout(getContentPane(), BoxLayout.Y_AXIS));

    setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
  }

  /**
   * It repaints the order panels based on the received data array
   *
   * @param array the order data
   * @param ctx the websocket
   */
  public void addPanels(JsonArray array, AsyncResult<WebSocket> ctx) {
    panel.removeAll();
    var iterator = array.stream().iterator();
    var colors = new LinkedList<Color>();
    colors.add(Color.PINK);
    colors.add(Color.LIGHT_GRAY);
    var infiniteIterator =
        Stream.iterate(0, i -> (i + colors.size() + 1) % colors.size()).iterator();
    while (iterator.hasNext()) {
      var color = colors.get(infiniteIterator.next());
      var next = (JsonObject) iterator.next();
      panel.add(new OrderCard(next, ctx, color));
    }
    panel.revalidate();
  }

  /**
   * It repaints the label message based on the received message
   *
   * @param message to display
   */
  public void setLabel(String message) {
    label.setText("Recap Order: " + message);
  }
}
