package com.example.zenve_vet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZenveVetApplication {

	public static void main(String[] args) {
		SpringApplication.run(ZenveVetApplication.class, args);
	}

}