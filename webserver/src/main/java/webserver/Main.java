package webserver;

import com.fastcgi.FCGIInterface;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class Main {
    private static final String RESPONSE_TEMPLATE = "Content-Type: application/json\nContent-Length: %d\n\n%s";

    public static void main(String[] args) {
        System.out.println("Starting FastCGI server...");

        while (new FCGIInterface().FCGIaccept() >= 0) {
            try {
                System.out.println("Incoming request accepted.");

                BufferedReader reader = new BufferedReader(new InputStreamReader(FCGIInterface.request.inStream, StandardCharsets.UTF_8));
                StringBuilder requestBody = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    requestBody.append(line);
                }

                String body = requestBody.toString();
                System.out.println("Received request body: " + body);

                if (body.isEmpty()) {
                    System.out.println("Request body is empty.");
                    sendJson("{\"error\": \"missing query parameters\"}");
                    continue;
                }


                JSONObject jsonParams = new JSONObject(body);
                System.out.println("Parsed JSON parameters: " + jsonParams.toString());

                if (!jsonParams.has("x") || !jsonParams.has("y") || !jsonParams.has("r")) {
                    System.out.println("Missing parameter(s): x, y, or r is null");
                    sendJson("{\"error\": \"missed necessary query param\"}");
                    continue;
                }

                int x = jsonParams.getInt("x");
                float y = jsonParams.getFloat("y");
                float r = jsonParams.getFloat("r");

                System.out.printf("Parsed values - x: %d, y: %.2f, r: %.2f%n", x, y, r);

                boolean validX = Validator.validateX(x);
                boolean validY = Validator.validateY(y);
                boolean validR = Validator.validateR(r);

                System.out.printf("Validation results - x: %b, y: %b, r: %b%n", validX, validY, validR);

                if (validX && validY && validR) {
                    boolean isInside = Checker.hit(x, y, r);
                    System.out.println("Point inside check result: " + isInside);
                    String jsonResponse = String.format("{\"x\": %d, \"y\": %.2f, \"r\": %.2f, \"result\": %b}", x, y, r, isInside);
                    sendJson(jsonResponse);
                } else {
                    System.out.println("Invalid data detected during validation.");
                    sendJson("{\"error\": \"invalid data\"}");
                }
            } catch (NumberFormatException e) {
                System.out.println("NumberFormatException: " + e.getMessage());
                sendJson("{\"error\": \"wrong query param type\"}");
            } catch (NullPointerException e) {
                System.out.println("NullPointerException: " + e.getMessage());
                sendJson("{\"error\": \"missed necessary query param\"}");
            } catch (Exception e) {
                System.out.println("Unexpected exception: " + e.toString());
                sendJson(String.format("{\"error\": \"%s\"}", e.toString()));
            }
        }
    }

    private static void sendJson(String jsonDump) {
        System.out.println("Sending JSON response: " + jsonDump);
        System.out.printf((RESPONSE_TEMPLATE) + "%n", jsonDump.getBytes(StandardCharsets.UTF_8).length, jsonDump);
    }
}