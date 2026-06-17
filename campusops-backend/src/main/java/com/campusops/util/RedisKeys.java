package com.campusops.util;

public class RedisKeys {
    public static final String BLACKLIST_DUPLICATE_LOGIN = "DUPLICATE_LOGIN";

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

    public static String activeToken(Long userNo, String tokenHash) {
        return "auth:token:" + userNo + ":" + tokenHash;
    }

    public static String activeTokens(Long userNo) {
        return "auth:tokens:" + userNo;
    }

    public static String tokenBlacklist(String tokenHash) {
        return "auth:blacklist:" + tokenHash;
    }

    public static String emailVerification(String email) {
        return "auth:email:verify:" + email;
    }
}
