package com.campusops.controller;

import com.campusops.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {
    private final DataSource dataSource;
    private final RedisConnectionFactory redisConnectionFactory;

    @GetMapping("/api/ping")
    public ApiResponse<Map<String, Object>> ping() {
        Map<String, Object> status = new HashMap<>();
        status.put("app", "UP");
        return ApiResponse.success("서버 응답 성공", status);
    }

    @GetMapping("/api/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("app", "UP");
        status.put("database", checkDatabase());
        status.put("redis", checkRedis());
        return ApiResponse.success("헬스 체크 성공", status);
    }

    private String checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception exception) {
            return "DOWN";
        }
    }

    private String checkRedis() {
        try (RedisConnection connection = redisConnectionFactory.getConnection()) {
            return "PONG".equalsIgnoreCase(connection.ping()) ? "UP" : "DOWN";
        } catch (Exception exception) {
            return "DOWN";
        }
    }
}
