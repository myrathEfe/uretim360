package com.meslite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MesLiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(MesLiteApplication.class, args);
    }
}
