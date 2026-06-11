package com.campusops.security;

import com.campusops.dto.TokenPrincipalDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey key() {
        byte[] keyBytes;
        if (secret == null) {
            keyBytes = "campusops-default-secret-key-cannot-be-used-in-production".getBytes(StandardCharsets.UTF_8);
        } else if (secret.matches("^[A-Za-z0-9+/=]+$") && secret.length() % 4 == 0) {
            keyBytes = Decoders.BASE64.decode(secret);
        } else {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(TokenPrincipalDTO principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .subject(String.valueOf(principal.getUserNo()))
                .claim("userId", principal.getUserId())
                .claim("role", principal.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key())
                .compact();
    }

    public TokenPrincipalDTO parseToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
        return new TokenPrincipalDTO(Long.valueOf(claims.getSubject()), claims.get("userId", String.class), claims.get("role", String.class));
    }
}
