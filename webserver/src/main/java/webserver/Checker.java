package webserver;

public class Checker {

    public static boolean hit(int x, float y, float r) {
        return inRect(x, y, r) || inTriangle(x, y, r) || inQuarterCircle(x, y, r);
    }

    private static boolean inRect(int x, float y, float r) {
        return x >= -r && x <= 0 && y >= 0 && y <= r;
    }

    private static boolean inTriangle(int x, float y, float r) {
        return x >= 0 && x <= r / 2 && y <= 0 && y >= -2 * (x - r / 2);
    }

    private static boolean inQuarterCircle(int x, float y, float r) {
        return x <= 0 && y <= 0 && (x * x + y * y <= (r / 2) * (r / 2));
    }
}
