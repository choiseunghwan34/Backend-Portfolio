package com.campusops.util;

import com.campusops.dto.TokenPrincipalDTO;

public class AuthContextHolder {
    private static final ThreadLocal<TokenPrincipalDTO> CONTEXT = new ThreadLocal<>();

    public static void set(TokenPrincipalDTO principal) {
        CONTEXT.set(principal);
    }

    public static TokenPrincipalDTO get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
