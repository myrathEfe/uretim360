package com.meslite.security;

import com.meslite.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final JwtConfig jwtConfig;
    private final Key key;

    public JwtTokenProvider(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(java.util.Base64.getEncoder()
                .encodeToString(jwtConfig.getSecret().getBytes())));
    }

    public String generateToken(CustomUserPrincipal principal) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime expiration = now.plusHours(jwtConfig.getExpirationHours());

        return Jwts.builder()
                .subject(String.valueOf(principal.id()))
                .claim("role", principal.role().name())
                .claim("email", principal.email())
                .issuedAt(Date.from(now.toInstant()))
                .expiration(Date.from(expiration.toInstant()))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validate(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public Long getUserId(String token) {
        return Long.valueOf(getClaims(token).getSubject());
    }

    public String getEmail(String token) {
        return getClaims(token).get("email", String.class);
    }
}

