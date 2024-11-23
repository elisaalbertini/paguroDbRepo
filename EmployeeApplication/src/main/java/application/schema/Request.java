package application.schema;

import io.vertx.core.json.JsonObject;

/** This utility class allows to create a request for the server. */
public final class Request {

    private Request() {}

    /**
     * @param message representing the needed server functionality
     * @param input data to send to the server
     * @return the request as a JsonObject
     */
    public static JsonObject createJsonRequest(String message, JsonObject input) {
        var request = new JsonObject();
        request.put("client_request", message).put("input", input);
        return request;
    }
}
