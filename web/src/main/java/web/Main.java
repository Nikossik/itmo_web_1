package web;

import com.fastcgi.FCGIInterface;
import com.fastcgi.FCGIRequest;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

public class Main {
    public static void main(String[] args) {
        System.out.println("Ready to accept requests...");
        FCGIInterface fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            FCGIRequest request = FCGIInterface.request;

            StringBuilder postData = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(request.inStream))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    postData.append(line);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            String[] pairs = postData.toString().split("&");
            String xStr = null, yStr = null, rStr = null;
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2) {
                    switch (keyValue[0]) {
                        case "x":
                            xStr = keyValue[1];
                            break;
                        case "y":
                            yStr = keyValue[1];
                            break;
                        case "r":
                            rStr = keyValue[1];
                            break;
                    }
                }
            }

            if (xStr == null || yStr == null || rStr == null) {
                sendErrorResponse(request, "Invalid input parameters");
                continue;
            }

            try {
                double x = Double.parseDouble(xStr);
                double y = Double.parseDouble(yStr);
                double r = Double.parseDouble(rStr);

                boolean isInside = checkPoint(x, y, r);

                String response = "<html><body>" +
                        "<table border='1'>" +
                        "<tr><th>X</th><th>Y</th><th>R</th><th>Result</th><th>Current Time</th></tr>" +
                        "<tr><td>" + x + "</td><td>" + y + "</td><td>" + r + "</td><td>" +
                        (isInside ? "Inside" : "Not inside") + "</td><td>" + LocalDateTime.now() + "</td></tr>" +
                        "</table>" +
                        "</body></html>";

                String httpResponse = "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: text/html; charset=UTF-8\r\n" +
                        "Content-Length: " + response.getBytes(StandardCharsets.UTF_8).length + "\r\n\r\n" +
                        response;

                request.outStream.write(httpResponse.getBytes(StandardCharsets.UTF_8));
                request.outStream.flush();
            } catch (NumberFormatException e) {
                sendErrorResponse(request, "Invalid numeric input parameters");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private static boolean checkPoint(double x, double y, double r) {
        return (x >= 0 && y >= 0 && x <= r && y <= r) || // Прямоугольник
                (x <= 0 && y <= 0 && x * x + y * y <= (r / 2) * (r / 2)) || // Четверть круга
                (x >= 0 && y <= 0 && y >= x - r); // Треугольник
    }

    private static void sendErrorResponse(FCGIRequest request, String message) {
        String response = "HTTP/1.1 400 Bad Request\r\n" +
                "Content-Type: text/html; charset=UTF-8\r\n" +
                "Content-Length: " + message.length() + "\r\n\r\n" +
                message;
        try {
            request.outStream.write(response.getBytes(StandardCharsets.UTF_8));
            request.outStream.flush();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}