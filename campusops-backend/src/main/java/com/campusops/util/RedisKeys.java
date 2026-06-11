package com.campusops.util;

public class RedisKeys {
    private RedisKeys() {
    }

    public static String reportRate(Long userNo) {
        return "rate:report:" + userNo;
    }

    public static String rentalHold(Long assetNo, Long userNo) {
        return "rental:hold:" + assetNo + ":" + userNo;
    }

    public static String reservationHold(Long roomNo, String date, String startTime) {
        return "reservation:hold:" + roomNo + ":" + date + ":" + startTime;
    }

    public static String unreadCount(Long userNo) {
        return "notification:unread:" + userNo;
    }

    public static String recentNotices() {
        return "notice:recent";
    }
}
