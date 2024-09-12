package webserver;

import com.fastcgi.FCGIInterface;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

public class Main {
    private static final Logger logger = Logger.getLogger(Main.class.getName());
    private static final String RESPONSE_TEMPLATE = "Content-Type: application/json\nContent-Length: %d\n\n%s";

    static {
        try {
            String logFilePath = "/home/studs/s408490/httpd-root/fcgi-bin/server.log";
            FileHandler fileHandler = new FileHandler(logFilePath, true);
            fileHandler.setFormatter(new SimpleFormatter());
            logger.addHandler(fileHandler);
            logger.setUseParentHandlers(false);
        } catch (Exception e) {
            logger.info("Failed to initialize log handler: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            long startTime = System.currentTimeMillis();
            try {
                logger.info("Incoming request accepted.");

                String queryString = FCGIInterface.request.params.getProperty("QUERY_STRING");
                logger.info("Received query string: " + queryString);

                if (queryString == null || queryString.trim().isEmpty()) {
                    logger.warning("QUERY_STRING is empty.");
                    sendJson("{\"error\": \"missing query parameters\"}");
                    continue;
                }

                HashMap<String, String> params = Parameters.parse(queryString);
                logger.info("Parsed parameters: " + params.toString());

                if (params.get("x") == null || params.get("y") == null || params.get("r") == null) {
                    logger.warning("Missing parameter(s): x, y, or r is null");
                    sendJson("{\"error\": \"missed necessary query param\"}");
                    continue;
                }

                int x = Integer.parseInt(params.get("x"));
                float y = Float.parseFloat(params.get("y"));
                float r = Float.parseFloat(params.get("r"));

                logger.info(String.format("Parsed values - x: %d, y: %.2f, r: %.2f", x, y, r));

                boolean validX = Validator.validateX(x);
                boolean validY = Validator.validateY(y);
                boolean validR = Validator.validateR(r);

                logger.info(String.format("Validation results - x: %b, y: %b, r: %b", validX, validY, validR));

                if (validX && validY && validR) {
                    boolean isInside = Checker.hit(x, y, r);
                    logger.info("Point inside check result: " + isInside);

                    long endTime = System.currentTimeMillis();
                    String executionTime = (endTime - startTime) + "ms";

                    String jsonResponse = String.format(
                            "{\"result\": %b, \"currentTime\": \"%s\", \"executionTime\": \"%s\"}",
                            isInside, java.time.LocalDateTime.now(), executionTime
                    );
                    sendJson(jsonResponse);
                } else {
                    logger.warning("Invalid data detected during validation.");
                    sendJson("{\"error\": \"invalid data\"}");
                }
            } catch (NumberFormatException e) {
                logger.warning("NumberFormatException: " + e.getMessage());
                sendJson("{\"error\": \"wrong query param type\"}");
            } catch (NullPointerException e) {
                logger.warning("NullPointerException: " + e.getMessage());
                sendJson("{\"error\": \"missed necessary query param\"}");
            } catch (Exception e) {
                logger.severe("Unexpected exception: " + e.toString());
                sendJson(String.format("{\"error\": \"%s\"}", e.toString()));
            }
        }
    }

    private static void sendJson(String jsonDump) {
        logger.info("Sending JSON response: " + jsonDump);
        System.out.printf((RESPONSE_TEMPLATE) + "%n", jsonDump.getBytes(StandardCharsets.UTF_8).length, jsonDump);
    }
}