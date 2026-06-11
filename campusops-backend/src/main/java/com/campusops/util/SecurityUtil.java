package com.campusops.util;

import com.campusops.dto.TokenPrincipalDTO;
import com.campusops.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    private SecurityUtil() {
    }

    public static TokenPrincipalDTO currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof TokenPrincipalDTO principal)) {
            throw new BusinessException("인증이 필요합니다.", 401);
        }
        return principal;
    }
}
