package com.campusops.util;

public class PasswordUtil {
    private PasswordUtil() {
    }

    public static String normalize(String password) {
        return password == null ? null : password.trim();
    }
}
