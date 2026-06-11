package com.campusops.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@MapperScan("com.campusops.dao")
public class MyBatisConfig {
}
