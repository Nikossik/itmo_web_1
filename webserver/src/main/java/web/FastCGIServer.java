package web;

import com.fastcgi.FCGIInterface;
import com.fastcgi.FCGIRequest;

import java.io.PrintStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class FastCGIServer extends FCGIInterface {

    private static final Logger logger = Logger.getLogger(FastCGIServer.class.getName());

    public static void main(String[] args) {
        FastCGIServer server = new FastCGIServer();
        logger.info("FastCGI server started, waiting for requests...");

        while (true) {
            int acceptResult = server.FCGIaccept();
            if (acceptResult >= 0) {
                if (request != null && request.socket != null) {
                    logger.info("Received a new request, processing...");
                    server.handleRequest();
                } else {
                    logger.warning("Request object or socket is null after FCGIaccept.");
                }
            } else {
                logger.warning("Failed to accept a request. Waiting for the next request...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    logger.log(Level.SEVERE, "Thread interrupted during sleep", e);
                }
            }
        }
    }

    private void handleRequest() {
        try {
            if (request == null || request.socket == null) {
                logger.warning("Request or socket is null, cannot handle the request.");
                return;
            }

            Properties params = request.params;

            if (params == null) {
                logger.warning("Request parameters are null, cannot process the request.");
                return;
            }

            String xParam = params.getProperty("x");
            String yParam = params.getProperty("y");
            String rParam = params.getProperty("r");

            if (xParam == null || yParam == null || rParam == null) {
                logger.warning("Missing required parameters in the request.");
                return;
            }

            double x = Double.parseDouble(xParam);
            double y = Double.parseDouble(yParam);
            double r = Double.parseDouble(rParam);

            boolean isInside = checkPointInsideRegion(x, y, r);

            String jsonResponse = createJsonResponse(x, y, r, isInside);

            PrintStream out = new PrintStream(request.outStream);
            out.println("Content-type: application/json\r\n");
            out.println(jsonResponse);
            out.flush();
            logger.info("Response sent: " + jsonResponse);

        } catch (Exception e) {
            logger.log(Level.SEVERE, "An error occurred while handling the request.", e);
        }
    }

    private boolean checkPointInsideRegion(double x, double y, double r) {
        boolean inRectangle = (x >= -r && x <= 0) && (y >= 0 && y <= r / 2);
        boolean inTriangle = (x >= 0 && x <= r / 2) && (y <= 0 && y >= -2 * x);
        boolean inQuarterCircle = (x >= -r && x <= 0) && (y >= -r && y <= 0) && (x * x + y * y <= r * r);

        return inRectangle || inTriangle || inQuarterCircle;
    }

    private String createJsonResponse(double x, double y, double r, boolean isInside) {
        String currentTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        long startTime = System.currentTimeMillis();
        long endTime = System.currentTimeMillis();
        String executionTime = (endTime - startTime) + "ms";

        return String.format(
                "{\"x\":\"%.2f\", \"y\":\"%.2f\", \"r\":\"%.2f\", \"result\":%b, \"currentTime\":\"%s\", \"executionTime\":\"%s\"}",
                x, y, r, isInside, currentTime, executionTime);
    }
}
