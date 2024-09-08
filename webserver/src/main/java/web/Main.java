package web;

import com.fastcgi.FCGIInterface;

import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.time.LocalDateTime;

public class Main {
    public static void main(String[] args) {
        var fcgiInterface = new FCGIInterface();
        while (fcgiInterface.FCGIaccept() >= 0) {
            Properties params = fcgiInterface.request.params;
            String xStr = params.getProperty("x");
            String yStr = params.getProperty("y");
            String rStr = params.getProperty("r");

            String response;
            if (validateParams(xStr, yStr, rStr)) {
                double x = Double.parseDouble(xStr);
                String[] yValuesStr = yStr.split(",");
                double r = Double.parseDouble(rStr);

                StringBuilder resultsBuilder = new StringBuilder();

                for (String yValueStr : yValuesStr) {
                    double y = Double.parseDouble(yValueStr);
                    boolean isInside = checkPoint(x, y, r);
                    resultsBuilder.append(generateResponseHTML(x, y, r, isInside));
                }

                response = resultsBuilder.toString();
            } else {
                response = "<html><body><h3>Invalid input, please enter correct numeric values!</h3></body></html>";
            }

            String httpResponse = """
                    HTTP/1.1 200 OK
                    Content-Type: text/html
                    Content-Length: %d

                    %s
                    """.formatted(response.getBytes(StandardCharsets.UTF_8).length, response);
            System.out.println(httpResponse);
        }
    }

    private static boolean validateParams(String xStr, String yStr, String rStr) {
        try {
            Double.parseDouble(xStr);
            for (String y : yStr.split(",")) {
                Double.parseDouble(y);
            }
            Double.parseDouble(rStr);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static boolean checkPoint(double x, double y, double r) {
        return (x >= 0 && y >= 0 && x <= r && y <= r) ||
                (x <= 0 && y <= 0 && x * x + y * y <= (r / 2) * (r / 2)) ||
                (x >= 0 && y <= 0 && y >= x - r);
    }

    private static String generateResponseHTML(double x, double y, double r, boolean isInside) {
        String status = isInside ? "inside" : "not inside";
        return """
                <html>
                <body>
                <h2>Point Check Result</h2>
                <p>Point (%.2f, %.2f) with R = %.2f is %s the area.</p>
                <p>Current Time: %s</p>
                </body>
                </html>
                """.formatted(x, y, r, status, LocalDateTime.now());
    }
}
