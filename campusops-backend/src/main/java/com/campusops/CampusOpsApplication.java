package com.campusops;

import com.campusops.service.SeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@RequiredArgsConstructor
public class CampusOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusOpsApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedRunner(SeedService seedService) {
        return args -> seedService.seedDefaultUsers();
    }
}
